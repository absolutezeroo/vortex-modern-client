/**
 * ConfirmPetBreedingView — the nest's "name the offspring and confirm" dialog.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/ConfirmPetBreedingView.as
 *
 * Raised by ConfirmBreedingRequestEvent once both plants are in the nest: shows both parents,
 * one preview row per rarity category (each breed rendered from `<resultPetTypeId> <breedId>`),
 * and a name field. `save_button` sends ConfirmPetBreeding and locks the dialog until the
 * server answers — a rejected name re-enables it through enable().
 *
 * AS3 adaptation: BitmapData.copyPixels() → OffscreenCanvas drawImage.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IUserData} from '@habbo/session/IUserData';
import {PetFigureData} from '@habbo/avatar/pets/PetFigureData';
import {Vector3d} from '@room/utils/Vector3d';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {BreedingRarityCategoryData} from '../events/BreedingRarityCategoryData';
import type {AvatarInfoWidget} from './AvatarInfoWidget';

// Preview render parameters (ConfirmPetBreedingView.as::resolvePreviewImage()).
const PREVIEW_DIRECTION: number = 90;
const PREVIEW_SCALE: number = 64;
const PREVIEW_POSTURE: string = 'std';

export class ConfirmPetBreedingView implements IDisposable, IGetImageListener
{
    private _window: IFrameWindow | null = null;
    private _disposed: boolean = false;
    private _widget: AvatarInfoWidget;
    private _windowManager: IHabboWindowManager;
    private _assets: IAssetLibrary | null;

    // AS3: ConfirmPetBreedingView.as::_SafeStr_6216 — pending image request id → target window name.
    private _pendingImages: Map<number, string> = new Map();

    private _requestRoomObjectId: number = 0;
    private _targetRoomObjectId: number = 0;
    private _petData: IUserData | null = null;
    private _petData2: IUserData | null = null;
    private _stuffId: number = 0;
    private _rarityCategories: BreedingRarityCategoryData[] = [];
    private _resultPetTypeId: number = 0;

    // AS3: ConfirmPetBreedingView.as::ConfirmPetBreedingView()
    constructor(widget: AvatarInfoWidget)
    {
        this._widget = widget;
        this._windowManager = widget.windowManager;
        this._assets = widget.assets;
    }

    // AS3: ConfirmPetBreedingView.as::get requestRoomObjectId()
    public get requestRoomObjectId(): number
    {
        return this._requestRoomObjectId;
    }

    // AS3: ConfirmPetBreedingView.as::get targetRoomObjectId()
    public get targetRoomObjectId(): number
    {
        return this._targetRoomObjectId;
    }

    // AS3: ConfirmPetBreedingView.as::open()
    public open(
        requestRoomObjectId: number,
        targetRoomObjectId: number,
        stuffId: number,
        rarityCategories: BreedingRarityCategoryData[],
        resultPetTypeId: number,
        pet1Level: number,
        pet2Level: number
    ): void
    {
        const userDataManager = this._widget.handler?.container?.roomSession.userDataManager ?? null;

        this._requestRoomObjectId = requestRoomObjectId;
        this._targetRoomObjectId = targetRoomObjectId;
        this._petData = userDataManager?.getUserDataByIndex(requestRoomObjectId) ?? null;
        this._petData2 = userDataManager?.getUserDataByIndex(targetRoomObjectId) ?? null;

        // The levels on the event are fresher than the ones in the room's user data.
        if(this._petData) this._petData.petLevel = pet1Level;
        if(this._petData2) this._petData2.petLevel = pet2Level;

        this._rarityCategories = rarityCategories;
        this._resultPetTypeId = resultPetTypeId;
        this._stuffId = stuffId;

        this.setWindowContent();

        if(this._window) this._window.visible = true;
    }

    // AS3: ConfirmPetBreedingView.as::resolvePreviewImage()
    private resolvePreviewImage(figure: string, targetName: string, scale: number = PREVIEW_SCALE): ImageBitmap | null
    {
        const roomEngine = this._widget.handler?.container?.roomEngine ?? null;

        if(!roomEngine) return null;

        const figureData = new PetFigureData(figure);
        const result = roomEngine.getPetImage(
            figureData.typeId, figureData.paletteId, figureData.color,
            new Vector3d(PREVIEW_DIRECTION), scale, this, true, 0,
            figureData.customParts, PREVIEW_POSTURE
        );

        if(!result) return null;

        if(result.id > 0) this._pendingImages.set(result.id, targetName);

        return result.data;
    }

    // AS3: ConfirmPetBreedingView.as::imageReady()
    public imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this._disposed) return;

        const targetName = this._pendingImages.get(id);

        if(targetName) this.updatePreviewImage(data, targetName);
    }

    // AS3: ConfirmPetBreedingView.as::imageFailed()
    public imageFailed(_id: number): void
    {
        // AS3 no-op.
    }

    // AS3: ConfirmPetBreedingView.as::setWindowContent()
    private setWindowContent(): void
    {
        const localizations = this._widget.localizations;
        const pet1 = this._petData;
        const pet2 = this._petData2;

        if(!pet1 || !pet2) return;

        localizations?.registerParameter('breedpets.widget.title', 'name', pet1.name);
        localizations?.registerParameter('breedpets.widget.pet1.name', 'name', pet1.name);
        localizations?.registerParameter('breedpets.widget.pet2.name', 'name', pet2.name);
        localizations?.registerParameter('breedpets.widget.pet1.description', 'name', pet1.ownerName);
        localizations?.registerParameter('breedpets.widget.pet2.description', 'name', pet2.ownerName);
        localizations?.registerParameter('breedpets.widget.pet1.level', 'level', pet1.petLevel.toString());
        localizations?.registerParameter('breedpets.widget.pet2.level', 'level', pet2.petLevel.toString());
        localizations?.registerParameter('breedpets.widget.request', 'name', pet2.ownerName);

        if(!this._window)
        {
            this._window = this._windowManager.buildWidgetLayout('confirm_pet_breeding_xml') as IFrameWindow | null;

            if(!this._window) return;

            this.addClickListener('header_button_close');
        }

        this._window.center();
        this._window.visible = true;

        this.addClickListener('save_button');
        this.addClickListener('cancel_button');
        this.enable();

        this.updatePreviewImage(this.resolvePreviewImage(pet1.figure, 'preview_image'), 'preview_image');
        this.updatePreviewImage(this.resolvePreviewImage(pet2.figure, 'preview_image2'), 'preview_image2');

        // One `breeds<N>` row per rarity category, each holding a clone of the small preview
        // window per possible breed.
        let categoryIndex = 1;

        for(const category of this._rarityCategories)
        {
            localizations?.registerParameter(
                `breedpets.confirmation.widget.raritycategory.${categoryIndex}`, 'percent', category.chance.toString()
            );

            const list = this._window.findChildByName(`breeds${categoryIndex}`) as IItemListWindow | null;

            list?.removeListItems();

            for(const breed of category.breeds)
            {
                const template = this._windowManager.buildWidgetLayout('pet_breeding_pet_preview_xml') as IBitmapWrapperWindow | null;

                if(!template) break;

                const cell = template.clone() as IBitmapWrapperWindow;

                cell.name = `breed.${breed}`;

                if(list) list.addListItem(cell);

                const figureData = new PetFigureData([this._resultPetTypeId, breed].join(' '));

                this.updatePreviewImage(this.resolvePreviewImage(figureData.figureString, cell.name), cell.name);
            }

            categoryIndex++;
        }

        this.arrangeListItems();

        const nameInput = this._window.findChildByName('puppy.name.input') as ITextFieldWindow | null;

        nameInput?.setSelection(0, 0);

        this._window.invalidate();
    }

    // AS3: ConfirmPetBreedingView.as::arrangeListItems()
    private arrangeListItems(): void
    {
        this.arrangeListItem('button_list');
        this.arrangeListItem('pet1_itemlist');
        this.arrangeListItem('pet2_itemlist');
        this.arrangeListItem('preview_list');
        this.arrangeListItem('element_list');

        this._window?.resizeToFitContent();
    }

    // AS3: ConfirmPetBreedingView.as::arrangeListItem()
    private arrangeListItem(name: string): void
    {
        const list = this._window?.findChildByName(name) as IItemListWindow | null;

        list?.arrangeListItems();
    }

    // AS3: ConfirmPetBreedingView.as::updatePreviewImage()
    // No background asset here (unlike the monsterplant dialog) — AS3 fills the slot with a
    // transparent bitmap and copies the pet in centred.
    private updatePreviewImage(image: ImageBitmap | null, targetName: string): void
    {
        if(!this._window || !image) return;

        const target = this._window.findChildByName(targetName) as IBitmapWrapperWindow | null;

        if(!target) return;

        const canvas = new OffscreenCanvas(target.width, target.height);
        const context = canvas.getContext('2d');

        if(!context) return;

        context.drawImage(
            image,
            Math.round((target.width - image.width) / 2),
            Math.round((target.height - image.height) / 2)
        );

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();
    }

    // AS3: ConfirmPetBreedingView.as::close()
    public close(): void
    {
        if(this._window) this._window.visible = false;
    }

    // AS3: ConfirmPetBreedingView.as::disable()
    private disable(): void
    {
        this.enableElement('description', false, false);
        this.enableElement('request', false, false);
        this.enableElement('cancel_button', false, true);
        this.enableElement('description', false, true);
        this.enableElement('save_button', false, true);
    }

    // AS3: ConfirmPetBreedingView.as::enable()
    public enable(): void
    {
        this.enableElement('description', false, false);
        this.enableElement('request', false, false);
        this.enableElement('cancel_button', true, true);
        this.enableElement('description', true, true);
        this.enableElement('save_button', true, true);
    }

    // AS3: ConfirmPetBreedingView.as::addClickListener()
    private addClickListener(name: string): void
    {
        const child = (this._window as IWindowContainer | null)?.findChildByName(name);

        child?.addEventListener(WindowMouseEvent.CLICK, this.onMouseClick);
    }

    // AS3: ConfirmPetBreedingView.as::enableElement()
    private enableElement(name: string, enabled: boolean, visible: boolean): void
    {
        const child = (this._window as IWindowContainer | null)?.findChildByName(name);

        if(!child) return;

        child.visible = visible;

        if(enabled) child.enable();
        else child.disable();
    }

    // AS3: ConfirmPetBreedingView.as::onMouseClick()
    private onMouseClick = (event: WindowEvent): void =>
    {
        switch((event.window as IWindow | null)?.name)
        {
            case 'header_button_close':
            case 'cancel_button':
                this._widget.cancelPetBreeding(this._stuffId);
                this.close();
                break;
            case 'ok_button':
                this.disable();
                break;
            case 'save_button':
            {
                const name = this._window?.findChildByName('puppy.name.input')?.caption ?? '';

                if(name.length === 0)
                {
                    this._windowManager.simpleAlert(
                        '${breedpets.confirmation.alert.title}',
                        '${breedpets.confirmation.alert.name.required.head}',
                        '${breedpets.confirmation.alert.name.required.desc}'
                    );

                    break;
                }

                if(this._petData && this._petData2)
                {
                    this._widget.confirmPetBreeding(this._stuffId, name, this._petData.webID, this._petData2.webID);
                }

                this.disable();
                break;
            }
        }
    };

    // AS3: ConfirmPetBreedingView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: ConfirmPetBreedingView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        this._pendingImages.clear();
    }
}
