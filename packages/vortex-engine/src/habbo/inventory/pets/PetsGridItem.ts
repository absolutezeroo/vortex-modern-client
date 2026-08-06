import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRarityItemGridOverlayWidget} from '@habbo/window/widgets/IRarityItemGridOverlayWidget';

import type {Pet} from './Pet';
import type {PetsView} from './PetsView';

/**
 * PetsGridItem — one pet thumbnail in the pets-inventory grid.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/pets/PetsGridItem.as
 *
 * Mirrors the pet-specific subset of GroupItem. Two documented port deviations from AS3:
 * - the thumbnail window is built via `windowManager.buildWidgetLayout('inventory_thumb_xml')`
 *   (the port's asset path) rather than AS3's raw `getAssetByName`/`buildFromXML`;
 * - the pet image is assigned straight into the "bitmap" child (`bitmap.bitmap = data`) instead of
 *   AS3's manual BitmapData copyPixels centering — RoomEngine delivers an already-composed
 *   ImageBitmap, and the window's bitmap wrapper centers it. Same as GroupItem.updateItemImageVisual.
 */
export class PetsGridItem
{
    // AS3: THUMB_COLOR_NORMAL / THUMB_COLOR_UNSEEN.
    private static readonly THUMB_COLOR_NORMAL: number = 13421772;
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsGridItem.as::THUMB_COLOR_UNSEEN
    private static readonly THUMB_COLOR_UNSEEN: number = 10275685;

    private _view: PetsView;
    private _pet: Pet;
    private _windowManager: IHabboWindowManager;
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsGridItem.as::_window
    private _window: IWindowContainer | null = null;
    private _bgColorWindow: IWindow | null = null;
    private _isSelected: boolean = false;
    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsGridItem.as::_isUnseen
    private _isUnseen: boolean;
    private _pressed: boolean = false;
    private _imageDownloadId: number = -1;

    constructor(view: PetsView, pet: Pet, windowManager: IHabboWindowManager, isUnseen: boolean)
    {
        this._view = view;
        this._pet = pet;
        this._windowManager = windowManager;
        this._isUnseen = isUnseen;

        this._window = this._windowManager.buildWidgetLayout('inventory_thumb_xml') as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.eventHandler;

        // AS3: per-type image scale / direction / full-image / growth posture (PetsGridItem.as:60-95).
        let scale = 64;
        let direction = 3;
        let fullImage = false;
        let posture: string | null = null;

        const typeId = pet.typeId;

        if(typeId === 15)
        {
            scale = 32;
            direction = 2;
            fullImage = true;
        }
        else if(typeId === 35)
        {
            scale = 64;
            direction = 3;
            fullImage = true;
        }
        else if(typeId === 26 || typeId === 27)
        {
            scale = 32;
            direction = 3;
            fullImage = true;
        }
        else if(typeId === 16)
        {
            scale = 32;
            direction = 2;
            fullImage = true;
            posture = pet.level >= 7 ? 'std' : `grw${pet.level}`;
        }

        // Async: RoomEngine.getPetImage resolves through PetsView.imageReady, which routes back to
        // this item's setPetImage() by imageDownloadId.
        this._view.getPetImage(pet, direction, fullImage, this, scale, posture);
        this.updateRarityOverlay();
        this.updateStatusGraphics();
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsGridItem.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsGridItem.as::get pet()
    get pet(): Pet
    {
        return this._pet;
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsGridItem.as::get imageDownloadId()
    get imageDownloadId(): number
    {
        return this._imageDownloadId;
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsGridItem.as::set imageDownloadId()
    set imageDownloadId(value: number)
    {
        this._imageDownloadId = value;
    }

    // AS3: PetsGridItem.as::eventHandler()
    private eventHandler = (event: {type: string}): void =>
    {
        switch(event.type)
        {
            case 'WME_DOWN':
                this._view.setSelectedGridItem(this);
                this._pressed = true;
                break;
            case 'WME_UP':
                this._pressed = false;
                break;
            case 'WME_OUT':
                if(this._pressed)
                {
                    this._pressed = false;
                    // Dragging a pet out of the grid starts placing it (skipServer=true).
                    this._view.placePetToRoom(this._pet.id, true);
                }
                break;
        }
    };

    // AS3: PetsGridItem.as::setPetImage()
    setPetImage(data: ImageBitmap | null): void
    {
        if(this._window === null) return;

        const bitmap = this._window.findChildByName('bitmap') as IBitmapWrapperWindow | null;

        if(bitmap !== null)
        {
            bitmap.bitmap = data;
        }
    }

    // AS3: PetsGridItem.as::setUnseen()
    setUnseen(value: boolean): void
    {
        if(this._isUnseen !== value)
        {
            this._isUnseen = value;
            this.updateStatusGraphics();
        }
    }

    // AS3: PetsGridItem.as::setSelected()
    setSelected(value: boolean): void
    {
        if(this._isSelected !== value)
        {
            this._isSelected = value;

            if(this._window === null) return;

            this.updateStatusGraphics();
        }
    }

    // AS3: PetsGridItem.as::updateStatusGraphics()
    private updateStatusGraphics(): void
    {
        if(this._window === null) return;

        const outline = this._window.findChildByName('outline');

        if(outline !== null)
        {
            outline.visible = this._isSelected;
        }

        if(this._bgColorWindow === null)
        {
            this._bgColorWindow = this._window.findChildByTag('BG_COLOR');
        }

        if(this._bgColorWindow !== null)
        {
            this._bgColorWindow.color = this._isUnseen
                ? PetsGridItem.THUMB_COLOR_UNSEEN
                : PetsGridItem.THUMB_COLOR_NORMAL;
        }
    }

    // AS3: PetsGridItem.as::updateRarityOverlay()
    private updateRarityOverlay(): void
    {
        if(this._window === null) return;

        const container = this._window.findChildByName('rarity_item_overlay_container') as IWidgetWindow | null;

        if(container === null) return;

        if(this._pet.rarityLevel >= 0)
        {
            const widget = container.widget as IRarityItemGridOverlayWidget | null;

            if(widget !== null)
            {
                widget.rarityLevel = this._pet.rarityLevel;
            }

            container.visible = true;
        }
        else
        {
            container.visible = false;
        }
    }

    // AS3: .../src/com/sulake/habbo/inventory/pets/PetsGridItem.as::dispose()
    dispose(): void
    {
        this._bgColorWindow = null;
        this._imageDownloadId = -1;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
