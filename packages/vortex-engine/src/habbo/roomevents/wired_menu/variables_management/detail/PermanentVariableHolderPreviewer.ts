import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {PetImageWidget} from '@habbo/window/widgets/PetImageWidget';
import type {WiredMenuController} from '../../WiredMenuController';
import {
    GetExtendedProfileMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';

/**
 * The little portrait in the detail window's info box: the user, pet or bot whose permanent
 * variables are being edited.
 *
 * Only the *user* preview is clickable — `setUserPreview()` shows the click region only when it was
 * given a real id, and the click opens that player's profile. The pet preview has no such region in
 * the layout.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/detail/PermanentVariableHolderPreviewer.as
 */
export class PermanentVariableHolderPreviewer implements IGetImageListener
{
    // AS3: PermanentVariableHolderPreviewer.as::_disposed
    private _disposed: boolean = false;

    // AS3: PermanentVariableHolderPreviewer.as::_container
    private _container: IWindowContainer | null;

    // AS3: PermanentVariableHolderPreviewer.as::_wiredMenu (obfuscated `_SafeStr_4593`)
    private _wiredMenu: WiredMenuController | null;

    // AS3: PermanentVariableHolderPreviewer.as::_userId (obfuscated `_SafeStr_5971`)
    private _userId: number = 0;

    // AS3: PermanentVariableHolderPreviewer.as::PermanentVariableHolderPreviewer()
    constructor(container: IWindowContainer, wiredMenu: WiredMenuController)
    {
        this._container = container;
        this._wiredMenu = wiredMenu;

        this.clearPreviewer();

        this.previewAvatarRegion?.addEventListener('WME_CLICK', this.onPreviewAvatarClicked);
    }

    /**
	 * Centre a window inside its parent. Static in AS3 and used from the view as well, so it stays
	 * a static here rather than becoming an instance helper.
	 */
    // AS3: PermanentVariableHolderPreviewer.as::centerContainer()
    static centerContainer(window: IWindow): void
    {
        const parent = window.parent;

        if(!parent) return;

        window.x = (parent.width / 2) - (window.width / 2);
        window.y = (parent.height / 2) - (window.height / 2);
    }

    // AS3: PermanentVariableHolderPreviewer.as::onPreviewAvatarClicked()
    private onPreviewAvatarClicked = (): void =>
    {
        // AS3's second argument is `true` — open the profile in its own window rather than inline.
        this._wiredMenu?.send(new GetExtendedProfileMessageComposer(this._userId, true));
    };

    // AS3: PermanentVariableHolderPreviewer.as::clearPreviewer()
    clearPreviewer(): void
    {
        const avatar = this.previewAvatarWidget;
        const pet = this.previewPetWidget;

        if(avatar) avatar.visible = false;
        if(pet) pet.visible = false;
    }

    // AS3: PermanentVariableHolderPreviewer.as::setPetPreview()
    setPetPreview(figure: string): void
    {
        this.clearPreviewer();

        const window = this.previewPetWidget;

        if(!window) return;

        window.visible = true;

        const widget = window.widget as PetImageWidget | null;

        if(widget) widget.figure = figure;

        PermanentVariableHolderPreviewer.centerContainer(window);
    }

    /**
	 * `userId` of -1 means "no profile behind this face" — AS3 hides the click region rather than
	 * leaving a region that would send a profile request for -1.
	 */
    // AS3: PermanentVariableHolderPreviewer.as::setUserPreview()
    setUserPreview(figure: string, userId: number = -1): void
    {
        this.clearPreviewer();

        const window = this.previewAvatarWidget;

        if(!window) return;

        window.visible = true;

        const widget = window.widget as IAvatarImageWidget | null;

        if(widget) widget.figure = figure;

        PermanentVariableHolderPreviewer.centerContainer(window);

        this._userId = userId;

        const region = this.previewAvatarRegion;

        if(region) region.visible = userId !== -1;
    }

    /**
	 * Both image callbacks are empty in AS3 too: the previewer implements the listener interface
	 * because the avatar widget expects one, and does nothing with the result — the widget paints
	 * itself.
	 */
    // AS3: PermanentVariableHolderPreviewer.as::imageReady()
    imageReady(_id: number, _data: ImageBitmap | null): void
    {
    }

    // AS3: PermanentVariableHolderPreviewer.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: PermanentVariableHolderPreviewer.as::get previewAvatarWidget()
    private get previewAvatarWidget(): IWidgetWindow | null
    {
        return (this._container?.findChildByName('avatar_preview') as IWidgetWindow | null) ?? null;
    }

    // AS3: PermanentVariableHolderPreviewer.as::get previewAvatarRegion()
    private get previewAvatarRegion(): IWindow | null
    {
        return this._container?.findChildByName('avatar_preview_region') ?? null;
    }

    // AS3: PermanentVariableHolderPreviewer.as::get previewPetWidget()
    private get previewPetWidget(): IWidgetWindow | null
    {
        return (this._container?.findChildByName('pet_preview') as IWidgetWindow | null) ?? null;
    }

    // AS3: PermanentVariableHolderPreviewer.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: PermanentVariableHolderPreviewer.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        // AS3 removes no listener here; the region dies with the window the view disposes.
        this._userId = -1;
        this._container = null;
        this._wiredMenu = null;
        this._disposed = true;
    }
}
