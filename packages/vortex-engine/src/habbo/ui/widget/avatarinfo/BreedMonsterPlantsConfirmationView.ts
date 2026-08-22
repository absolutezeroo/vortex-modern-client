/**
 * BreedMonsterPlantsConfirmationView — the "breed these two plants?" dialog.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/BreedMonsterPlantsConfirmationView.as
 *
 * Two states on the same `breed_pets_confirmation_xml` layout: the requester sees the
 * description + `save_button` (STATE_NORMAL), the other owner sees the request text +
 * `accept_button` (STATE_REQUESTED). Both sides carry a live preview of each plant, rendered
 * through RoomEngine.getPetImage() and composited over `breed_pets_preview_bg`.
 *
 * AS3 adaptation: BitmapData.copyPixels() → an OffscreenCanvas drawImage at the same offsets,
 * the port's standard substitute for Flash bitmap compositing.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IUserData} from '@habbo/session/IUserData';
import {PetFigureData} from '@habbo/avatar/pets/PetFigureData';
import {Vector3d} from '@room/utils/Vector3d';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {AvatarInfoWidget} from './AvatarInfoWidget';

export class BreedMonsterPlantsConfirmationView implements IDisposable, IGetImageListener
{
    // AS3: BreedMonsterPlantsConfirmationView.as::STATE_NORMAL
    private static readonly STATE_NORMAL: number = 0;

    private static readonly STATE_REQUESTED: number = 1;

    // Preview render parameters (BreedMonsterPlantsConfirmationView.as::resolvePreviewImage()).
    private static readonly PREVIEW_DIRECTION: number = 90;

    private static readonly PREVIEW_SCALE: number = 64;

    private static readonly PREVIEW_POSTURE: string = 'std';

    // AS3: BreedMonsterPlantsConfirmationView.as::_window
    private _window: IFrameWindow | null = null;
    // AS3: BreedMonsterPlantsConfirmationView.as::disposed (obfuscated `_SafeStr_5769`; named from its getter)
    private _disposed: boolean = false;
    // AS3: BreedMonsterPlantsConfirmationView.as::_widget (obfuscated `_SafeStr_4549`)
    private _widget: AvatarInfoWidget;
    // AS3: BreedMonsterPlantsConfirmationView.as::_windowManager
    private _windowManager: IHabboWindowManager;
    // AS3: BreedMonsterPlantsConfirmationView.as::_assets
    private _assets: IAssetLibrary | null;

    // AS3: BreedMonsterPlantsConfirmationView.as::_SafeStr_6216 — pending image request id →
    // the preview window name it should land in.
    private _pendingImages: Map<number, string> = new Map();

    // AS3: BreedMonsterPlantsConfirmationView.as::requestRoomObjectId (obfuscated `_SafeStr_7499`)
    private _requestRoomObjectId: number = 0;
    // AS3: BreedMonsterPlantsConfirmationView.as::targetRoomObjectId (obfuscated `_SafeStr_6863`)
    private _targetRoomObjectId: number = 0;
    // AS3: BreedMonsterPlantsConfirmationView.as::_petData (obfuscated `_SafeStr_4853`; the
    // sibling field `_petData2` below keeps its readable AS3 name)
    private _petData: IUserData | null = null;
    // AS3: BreedMonsterPlantsConfirmationView.as::_petData2
    private _petData2: IUserData | null = null;
    // AS3: BreedMonsterPlantsConfirmationView.as::_state (obfuscated `_SafeStr_4597`; named from
    // the STATE_NORMAL/STATE_REQUESTED pair it switches on)
    private _state: number = BreedMonsterPlantsConfirmationView.STATE_NORMAL;

    // AS3: BreedMonsterPlantsConfirmationView.as::BreedMonsterPlantsConfirmationView()
    constructor(widget: AvatarInfoWidget)
    {
        this._widget = widget;
        this._windowManager = widget.windowManager;
        this._assets = widget.assets;
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::get requestRoomObjectId()
    public get requestRoomObjectId(): number
    {
        return this._requestRoomObjectId;
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::get targetRoomObjectId()
    public get targetRoomObjectId(): number
    {
        return this._targetRoomObjectId;
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::open()
    public open(requestRoomObjectId: number, targetRoomObjectId: number, requested: boolean): void
    {
        const userDataManager = this._widget.handler?.container?.roomSession.userDataManager ?? null;

        this._requestRoomObjectId = requestRoomObjectId;
        this._targetRoomObjectId = targetRoomObjectId;
        this._petData = userDataManager?.getUserDataByIndex(requestRoomObjectId) ?? null;
        this._petData2 = userDataManager?.getUserDataByIndex(targetRoomObjectId) ?? null;
        this._state = requested ? BreedMonsterPlantsConfirmationView.STATE_REQUESTED : BreedMonsterPlantsConfirmationView.STATE_NORMAL;

        this.setWindowContent();

        if(this._window) this._window.visible = true;
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::resolvePreviewImage()
    private resolvePreviewImage(figure: string, targetName: string): ImageBitmap | null
    {
        const roomEngine = this._widget.handler?.container?.roomEngine ?? null;

        if(!roomEngine) return null;

        const figureData = new PetFigureData(figure);
        const result = roomEngine.getPetImage(
            figureData.typeId, figureData.paletteId, figureData.color,
            new Vector3d(BreedMonsterPlantsConfirmationView.PREVIEW_DIRECTION), BreedMonsterPlantsConfirmationView.PREVIEW_SCALE, this, true, 0,
            figureData.customParts, BreedMonsterPlantsConfirmationView.PREVIEW_POSTURE
        );

        if(!result) return null;

        // A pending render answers later through imageReady(); the id keys which slot it fills.
        if(result.id > 0) this._pendingImages.set(result.id, targetName);

        return result.data;
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::imageReady()
    public imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this._disposed) return;

        const targetName = this._pendingImages.get(id);

        if(targetName) this.updatePreviewImage(data, targetName);
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::imageFailed()
    public imageFailed(_id: number): void
    {
        // AS3 no-op — the dialog stays up with the plain background.
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::setWindowContent()
    private setWindowContent(): void
    {
        const localizations = this._widget.localizations;
        const pet1 = this._petData;
        const pet2 = this._petData2;

        if(!pet1 || !pet2) return;

        localizations?.registerParameter('breedpets.widget.title', 'name', pet1.name);
        localizations?.registerParameter('breedpets.widget.plant1.name', 'name', pet1.name);
        localizations?.registerParameter('breedpets.widget.plant2.name', 'name', pet2.name);
        localizations?.registerParameter('breedpets.widget.plant1.description', 'name', pet1.ownerName);
        localizations?.registerParameter('breedpets.widget.plant2.description', 'name', pet2.ownerName);
        localizations?.registerParameter('breedpets.widget.plant1.raritylevel', 'level', pet1.rarityLevel.toString());
        localizations?.registerParameter('breedpets.widget.plant2.raritylevel', 'level', pet2.rarityLevel.toString());
        localizations?.registerParameter('breedpets.widget.request', 'name', pet2.ownerName);

        if(!this._window)
        {
            this._window = this._windowManager.buildWidgetLayout('breed_pets_confirmation_xml') as IFrameWindow | null;

            if(!this._window) return;

            this.addClickListener('header_button_close');
        }

        this._window.center();
        this._window.visible = true;

        this.addClickListener('save_button');
        this.addClickListener('accept_button');
        this.addClickListener('cancel_button');

        this.enableElement('description', false);
        this.enableElement('request', false);
        this.enableElement('save_button', false);
        this.enableElement('accept_button', false);
        this.enableElement('cancel_button', true);

        switch(this._state)
        {
            case BreedMonsterPlantsConfirmationView.STATE_NORMAL:
                this.enableElement('description', true);
                this.enableElement('save_button', true);
                break;
            case BreedMonsterPlantsConfirmationView.STATE_REQUESTED:
                this.enableElement('request', true);
                this.enableElement('accept_button', true);
                break;
        }

        this.updatePreviewImage(this.resolvePreviewImage(pet1.figure, 'preview_image'), 'preview_image');
        this.updatePreviewImage(this.resolvePreviewImage(pet2.figure, 'preview_image2'), 'preview_image2');

        this.arrangeListItems();
        this._window.invalidate();
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::arrangeListItems()
    private arrangeListItems(): void
    {
        this.arrangeListItem('button_list');
        this.arrangeListItem('plant1_itemlist');
        this.arrangeListItem('plant2_itemlist');
        this.arrangeListItem('preview_list');
        this.arrangeListItem('element_list');

        this._window?.resizeToFitContent();
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::arrangeListItem()
    private arrangeListItem(name: string): void
    {
        const list = this._window?.findChildByName(name) as IItemListWindow | null;

        list?.arrangeListItems();
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::updatePreviewImage()
    // AS3 paints the background asset first and then copies the pet over it, centred.
    private updatePreviewImage(image: ImageBitmap | null, targetName: string): void
    {
        if(!this._window || !image) return;

        const target = this._window.findChildByName(targetName) as IBitmapWrapperWindow | null;

        if(!target) return;

        const canvas = new OffscreenCanvas(target.width, target.height);
        const context = canvas.getContext('2d');

        if(!context) return;

        const background = (this._assets?.getAssetByName('breed_pets_preview_bg')?.content ?? null) as ImageBitmap | null;

        if(background) context.drawImage(background, 0, 0);

        context.drawImage(
            image,
            Math.round((target.width - image.width) / 2),
            Math.round((target.height - image.height) / 2)
        );

        target.bitmap = canvas.transferToImageBitmap();
        target.invalidate();
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::close()
    private close(): void
    {
        if(this._window) this._window.visible = false;
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::addClickListener()
    private addClickListener(name: string): void
    {
        const child = (this._window as IWindowContainer | null)?.findChildByName(name);

        child?.addEventListener(WindowMouseEvent.CLICK, this.onMouseClick);
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::enableElement()
    private enableElement(name: string, visible: boolean): void
    {
        const child = (this._window as IWindowContainer | null)?.findChildByName(name);

        if(child) child.visible = visible;
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::onMouseClick()
    private onMouseClick = (event: WindowEvent): void =>
    {
        switch((event.window as IWindow | null)?.name)
        {
            case 'header_button_close':
            case 'cancel_button':
                this._widget.cancelBreedPets(this._requestRoomObjectId, this._targetRoomObjectId);
                this.close();
                break;
            case 'ok_button':
                this.close();
                break;
            case 'accept_button':
                this.close();
                this._widget.acceptBreedPets(this._requestRoomObjectId, this._targetRoomObjectId);
                break;
            case 'save_button':
                this._widget.breedPets(this._requestRoomObjectId, this._targetRoomObjectId);

                // Breeding with somebody else's plant needs their confirmation, so the requester
                // is parked on a waiting alert until they answer.
                if(this._petData && this._petData2 && this._petData.ownerId !== this._petData2.ownerId)
                {
                    this._widget.showBreedingPetsWaitingConfirmationAlert(this._requestRoomObjectId, this._targetRoomObjectId);
                }

                this.close();
                break;
        }
    };

    // AS3: BreedMonsterPlantsConfirmationView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: BreedMonsterPlantsConfirmationView.as::dispose()
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
