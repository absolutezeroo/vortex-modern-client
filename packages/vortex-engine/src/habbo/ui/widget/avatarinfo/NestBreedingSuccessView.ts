/**
 * NestBreedingSuccessView — the "your nest produced this pet" dialog.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/NestBreedingSuccessView.as
 *
 * Opened from RoomSessionNestBreedingSuccessEvent (header 40) with the new pet's room index and
 * its rarity category; shows the pet's name, the rarity caption and a rendered preview.
 *
 * AS3 adaptation: BitmapData.copyPixels() → OffscreenCanvas drawImage.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IUserData} from '@habbo/session/IUserData';
import {PetFigureData} from '@habbo/avatar/pets/PetFigureData';
import {Vector3d} from '@room/utils/Vector3d';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {AvatarInfoWidget} from './AvatarInfoWidget';

const logger = Logger.getLogger('habbo.ui.widget.avatarinfo.NestBreedingSuccessView');

// Preview render parameters (NestBreedingSuccessView.as::resolvePreviewImage()).
const PREVIEW_DIRECTION: number = 90;
const PREVIEW_SCALE: number = 64;
const PREVIEW_POSTURE: string = 'std';

export class NestBreedingSuccessView implements IDisposable, IGetImageListener
{
    private _window: IFrameWindow | null = null;
    private _disposed: boolean = false;
    private _widget: AvatarInfoWidget;
    private _windowManager: IHabboWindowManager;
    private _assets: IAssetLibrary | null;

    private _petData: IUserData | null = null;
    private _roomIndex: number = 0;
    private _rarityCategory: number = 0;

    // AS3: NestBreedingSuccessView.as::_SafeStr_6216 — pending image request id → target name.
    // DIVERGENCE: the AS3 constructor never creates this map (its three siblings all do), so a
    // preview that has to be rendered asynchronously throws there. Constructed here, which is
    // what the sibling dialogs do and what the rest of the class already assumes.
    private _pendingImages: Map<number, string> = new Map();

    // AS3: NestBreedingSuccessView.as::NestBreedingSuccessView()
    constructor(widget: AvatarInfoWidget)
    {
        this._widget = widget;
        this._windowManager = widget.windowManager;
        this._assets = widget.assets;
    }

    // AS3: NestBreedingSuccessView.as::open()
    public open(roomIndex: number, rarityCategory: number): void
    {
        const userDataManager = this._widget.handler?.container?.roomSession.userDataManager ?? null;

        this._roomIndex = roomIndex;
        this._petData = userDataManager?.getUserDataByIndex(roomIndex) ?? null;

        if(!this._petData)
        {
            logger.warn('Couldn\'t find the correct pet.');

            return;
        }

        this._rarityCategory = rarityCategory;

        this.setWindowContent();

        if(this._window) this._window.visible = true;
    }

    // AS3: NestBreedingSuccessView.as::setWindowContent()
    private setWindowContent(): void
    {
        const pet = this._petData;

        if(!pet) return;

        if(!this._window)
        {
            this._window = this._windowManager.buildWidgetLayout('nestBreedingSuccess_xml') as IFrameWindow | null;

            if(!this._window) return;

            this.addClickListener('header_button_close');
        }

        this._window.center();
        this._window.visible = true;

        this.addClickListener('button.ok');

        const nameWindow = this._window.findChildByName('pet.name') as ITextWindow | null;

        if(nameWindow) nameWindow.caption = pet.name;

        const rarityWindow = this._window.findChildByName('pet.raritycategory') as ITextWindow | null;

        if(rarityWindow) rarityWindow.caption = `\${breedpets.nestbreeding.success.raritycategory.${this._rarityCategory}}`;

        this.updatePreviewImage(this.resolvePreviewImage(pet.figure, 'pet_image'), 'pet_image');

        this._window.invalidate();
    }

    // AS3: NestBreedingSuccessView.as::resolvePreviewImage()
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

    // AS3: NestBreedingSuccessView.as::imageReady()
    public imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this._disposed) return;

        const targetName = this._pendingImages.get(id);

        if(targetName) this.updatePreviewImage(data, targetName);
    }

    // AS3: NestBreedingSuccessView.as::imageFailed()
    public imageFailed(_id: number): void
    {
        // AS3 no-op.
    }

    // AS3: NestBreedingSuccessView.as::updatePreviewImage()
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

    // AS3: NestBreedingSuccessView.as::close()
    public close(): void
    {
        if(this._window) this._window.visible = false;
    }

    // AS3: NestBreedingSuccessView.as::addClickListener()
    private addClickListener(name: string): void
    {
        const child = (this._window as IWindowContainer | null)?.findChildByName(name);

        child?.addEventListener(WindowMouseEvent.CLICK, this.onMouseClick);
    }

    // AS3: NestBreedingSuccessView.as::onMouseClick()
    private onMouseClick = (event: WindowEvent): void =>
    {
        switch((event.window as IWindow | null)?.name)
        {
            case 'header_button_close':
            case 'cancel_button':
            case 'button.ok':
                this.close();
                break;
        }
    };

    // TS-only: the room index the dialog was opened for, so the widget can drop a stale dialog.
    public get roomIndex(): number
    {
        return this._roomIndex;
    }

    // AS3: NestBreedingSuccessView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: NestBreedingSuccessView.as::dispose()
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
