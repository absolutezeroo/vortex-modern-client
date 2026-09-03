import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

/**
 * The toolbar bubble telling a member their club gifts are waiting
 *
 * Two ways out of it: the button opens the `club_gifts` catalog page, the "later" link cancels.
 * `isCancelled` is what stops the controller putting it back up for the rest of the session —
 * the window is gone either way, so `visible` alone would not tell the two apart.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/ClubGiftNotification.as
 */
export class ClubGiftNotification
{
    // AS3: .../notifications/singular/ClubGiftNotification.as::TOOLBAR_EXTENSION_ID
    private static readonly TOOLBAR_EXTENSION_ID: string = 'club_gift_notification';

    // AS3: .../notifications/singular/ClubGiftNotification.as::LINK_COLOR_NORMAL
    private static readonly LINK_COLOR_NORMAL: number = 16777215;

    // AS3: .../notifications/singular/ClubGiftNotification.as::LINK_COLOR_HIGHLIGHT
    private static readonly LINK_COLOR_HIGHLIGHT: number = 12247545;

    // AS3: .../notifications/singular/ClubGiftNotification.as::ICON_STYLE_CLUB
    private static readonly ICON_STYLE_CLUB: number = 13;

    // AS3: .../notifications/singular/ClubGiftNotification.as::ICON_STYLE_VIP
    private static readonly ICON_STYLE_VIP: number = 14;

    // AS3: .../notifications/singular/ClubGiftNotification.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../notifications/singular/ClubGiftNotification.as::_catalog
    private _catalog: IHabboCatalog | null = null;

    // AS3: .../notifications/singular/ClubGiftNotification.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;

    // AS3: .../notifications/singular/ClubGiftNotification.as::_cancelLink
    private _cancelLink: ITextWindow | null = null;

    // AS3: .../notifications/singular/ClubGiftNotification.as::_isCancelled
    private _isCancelled: boolean = false;

    // AS3: .../notifications/singular/ClubGiftNotification.as::ClubGiftNotification()
    // `numGifts` is taken and never read — AS3 does the same; the layout's caption carries the
    // wording and the count is only used by the caller's own guard.
    constructor(_numGifts: number, windowManager: IHabboWindowManager | null, catalog: IHabboCatalog | null, toolbar: IHabboToolbar | null)
    {
        if(windowManager === null || catalog === null) return;

        this._catalog = catalog;
        this._toolbar = toolbar;

        this._window = windowManager.buildWidgetLayout('club_gift_notification_xml') as IWindowContainer | null;

        if(this._window === null) return;

        this._window.procedure = this.eventHandler;
        this._toolbar?.extensionView?.attachExtension(ClubGiftNotification.TOOLBAR_EXTENSION_ID, this._window);

        this._cancelLink = this._window.findChildByName('cancel_link') as unknown as ITextWindow | null;

        const region = this._window.findChildByName('cancel_link_region');

        if(region !== null)
        {
            region.addEventListener('WME_OVER', this.onMouseOver);
            region.addEventListener('WME_OUT', this.onMouseOut);
        }

        this.setClubIcon(ClubGiftNotification.ICON_STYLE_CLUB);
    }

    // AS3: .../notifications/singular/ClubGiftNotification.as::get visible()
    get visible(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    // AS3: .../notifications/singular/ClubGiftNotification.as::get isCancelled()
    get isCancelled(): boolean
    {
        return this._isCancelled;
    }

    /**
     * Draws an image into a named bitmap child, scaled 2x and centred.
     *
     * The offsets AS3 computes are `dest/2 - src`, using the *unscaled* source size — which is
     * centring, once you account for the `Matrix(2,0,0,2)`: `dest/2 - (2*src)/2`. Smoothing stays
     * off, as everywhere else in this port, so the pixel art doubles cleanly.
     *
     * Private and uncalled in AS3 too, but a real member of the class, so it is ported rather
     * than left as a hole.
     */
    // AS3: .../notifications/singular/ClubGiftNotification.as::setImage()
    private setImage(childName: string, image: ImageBitmap): void
    {
        if(this._window === null) return;

        const target = this._window.findChildByName(childName) as (IWindow & { bitmap: ImageBitmap | null }) | null;

        if(target === null) return;

        const canvas = new OffscreenCanvas(Math.max(1, target.width), Math.max(1, target.height));
        const ctx = canvas.getContext('2d');

        if(ctx === null) return;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            image,
            Math.trunc(canvas.width * 0.5 - image.width),
            Math.trunc(canvas.height * 0.5 - image.height),
            image.width * 2,
            image.height * 2
        );

        target.bitmap = canvas.transferToImageBitmap();
    }

    // AS3: .../notifications/singular/ClubGiftNotification.as::setClubIcon()
    private setClubIcon(style: number): void
    {
        const icon = this._window?.findChildByName('club_icon') ?? null;

        if(icon === null) return;

        icon.style = style;
        icon.invalidate();
    }

    // AS3: .../notifications/singular/ClubGiftNotification.as::eventHandler()
    private eventHandler = (event: WindowEvent, target: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        switch(target.name)
        {
            case 'open_catalog_button':
                this._catalog?.openCatalogPage('club_gifts');
                this.dispose();
                break;

            case 'cancel_link_region':
            case 'cancel_link':
                this._isCancelled = true;
                this.dispose();
                break;
        }
    };

    // AS3: .../notifications/singular/ClubGiftNotification.as::onMouseOver()
    private onMouseOver = (): void =>
    {
        if(this._cancelLink !== null) this._cancelLink.textColor = ClubGiftNotification.LINK_COLOR_HIGHLIGHT;
    };

    // AS3: .../notifications/singular/ClubGiftNotification.as::onMouseOut()
    private onMouseOut = (): void =>
    {
        if(this._cancelLink !== null) this._cancelLink.textColor = ClubGiftNotification.LINK_COLOR_NORMAL;
    };

    // AS3: .../notifications/singular/ClubGiftNotification.as::dispose()
    dispose(): void
    {
        this._toolbar?.extensionView?.detachExtension(ClubGiftNotification.TOOLBAR_EXTENSION_ID);

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._catalog = null;
    }
}
