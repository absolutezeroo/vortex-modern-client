import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDisplayObjectWrapper} from '@core/window/components/IDisplayObjectWrapper';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {VimeoDisplayWidgetHandler} from '@habbo/ui/handler/VimeoDisplayWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {VideoIframeOverlay} from './VideoIframeOverlay';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.ui.widget.furniture.video.VimeoDisplayWidget');

/**
 * The Vimeo "TV" furni's floating player window — the `RWE_VIMEO` widget.
 *
 * Much simpler than `YoutubeDisplayWidget`: no playlists, no playback-state sync, and no
 * server-driven play/pause — the only thing that ever leaves this widget is a new video id, typed
 * into the `video_id` field and confirmed with Enter, which both updates the player locally and
 * reports it to the server via the handler's `setVideo()`.
 *
 * AS3 constructs a Flash `VimeoPlayer` (Moogaloop) with a hard-coded app key and embeds it into
 * `video_wrapper` the same way `YoutubeDisplayWidget` embeds its `Loader` — see that class's
 * header for why this port uses a real `<iframe>` (`VideoIframeOverlay`) instead, positioned over
 * `video_wrapper`'s on-screen rectangle. The app key has no equivalent: it authenticated the
 * legacy Flash Moogaloop embed API, and the standard `player.vimeo.com/video/<id>` iframe embed
 * needs no such key.
 *
 * `onVideoMouseEvent()` — forwarding the embedded player's raw mouse events to the stage — has no
 * substitute either: a cross-origin iframe's internal events are not observable from the host
 * page at all (the same restriction `YoutubeDisplayWidget` and `WebCaptchaView` document). Nothing
 * in this widget reacts to that forwarded event in AS3 beyond letting it bubble, so nothing
 * user-visible is lost.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/video/VimeoDisplayWidget.as
 */
export class VimeoDisplayWidget extends RoomWidgetBase
{
    // Name DERIVED (`_SafeStr_11228`): the Flash Moogaloop embed's app key. Never used by this
    // port — see the class header.
    // AS3: .../video/VimeoDisplayWidget.as::_SafeStr_11228
    private static readonly VIMEO_APP_KEY: string = '9a106b76302cbce891b714afdc6a0c93';

    // AS3: .../video/VimeoDisplayWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../video/VimeoDisplayWidget.as::_roomObject
    private _roomObject: IRoomObject | null = null;

    // TS-only: the iframe standing in for AS3's embedded VimeoPlayer — see the class header.
    private _overlay: VideoIframeOverlay | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/video/VimeoDisplayWidget.as::VimeoDisplayWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null
    )
    {
        super(handler, windowManager, assets, localizations);

        void VimeoDisplayWidget.VIMEO_APP_KEY;

        const ownHandler = this.ownHandler;

        if(ownHandler !== null) ownHandler.widget = this;
    }

    // AS3: .../video/VimeoDisplayWidget.as::get ownHandler()
    private get ownHandler(): VimeoDisplayWidgetHandler | null
    {
        return (this._handler as VimeoDisplayWidgetHandler | null) ?? null;
    }

    // AS3: .../video/VimeoDisplayWidget.as::get mainWindow()
    override get mainWindow(): IWindow | null
    {
        return this._window;
    }

    // AS3: .../video/VimeoDisplayWidget.as::show()
    show(roomObject: IRoomObject, canEditVideoId: boolean, videoId: number): void
    {
        this._roomObject = roomObject;

        this.createWindow(canEditVideoId, videoId);

        if(this._window !== null) this._window.visible = true;
    }

    // AS3: .../video/VimeoDisplayWidget.as::createWindow()
    private createWindow(canEditVideoId: boolean, videoId: number): void
    {
        if(this._window !== null) return;

        this._window = this.windowManager.buildWidgetLayout('vimeo_viewer_xml') as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            log.warn('vimeo_viewer_xml did not build — the Vimeo display cannot be opened');
            this._window = null;

            return;
        }

        const videoIdEditor = this._window.findChildByName('video_id_editor');
        const videoWrapper = this._window.findChildByName('video_wrapper') as IDisplayObjectWrapper | null;

        if(videoIdEditor !== null) videoIdEditor.visible = canEditVideoId;
        if(videoWrapper !== null) videoWrapper.visible = videoId > 0;

        this._window.procedure = this.onWindowEvent;
        this._window.center();

        if(videoWrapper !== null)
        {
            this._overlay = new VideoIframeOverlay();
            this._overlay.mount(
                videoWrapper as unknown as IWindow,
                videoId > 0 ? this.buildEmbedUrl(videoId) : 'about:blank',
                'autoplay; encrypted-media; fullscreen'
            );
        }
    }

    /**
     * AS3: .../video/VimeoDisplayWidget.as::windowProcedure()
     */
    // AS3: .../video/VimeoDisplayWidget.as::windowProcedure()
    private onWindowEvent = (event: WindowEvent, target: IWindow): void =>
    {
        switch(event.type)
        {
            case 'WME_CLICK':
                if(target.name === 'header_button_close') this.hide(this._roomObject);

                break;

            case 'WE_RESIZE':
                if(target.name === 'video_wrapper') this._overlay?.sync();

                break;

            case WindowKeyboardEvent.KEY_DOWN:
                if((event as WindowKeyboardEvent).charCode === 13) this.onVideoIdConfirmed();

                break;
        }
    };

    // AS3: .../video/VimeoDisplayWidget.as::windowProcedure() — the WKE_KEY_DOWN/Enter branch
    private onVideoIdConfirmed(): void
    {
        if(this._window === null || this._roomObject === null) return;

        const videoId = parseInt(this._window.findChildByName('video_id')?.caption ?? '', 10) || 0;

        this.ownHandler?.setVideo(this._roomObject, videoId);

        const videoWrapper = this._window.findChildByName('video_wrapper');

        if(videoWrapper !== null) videoWrapper.visible = videoId > 0;

        this._overlay?.setSrc(videoId > 0 ? this.buildEmbedUrl(videoId) : 'about:blank');
    }

    // TS-only: builds the standard Vimeo embed URL — see the class header for what this replaces.
    private buildEmbedUrl(videoId: number): string
    {
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }

    // AS3: .../video/VimeoDisplayWidget.as::hide()
    hide(roomObject: IRoomObject | null): void
    {
        if(this._roomObject !== roomObject) return;

        this._overlay?.destroy();
        this._overlay = null;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._roomObject = null;
    }

    // TS-only: VimeoDisplayWidget.as has no dispose() override of its own in any tree (unlike
    // YoutubeDisplayWidget, which explicitly calls hide() from one) — RoomWidgetBase's is used
    // as-is. Overridden here only so the iframe overlay (this port's own addition) is torn down
    // even if the widget is disposed without hide() having run first.
    override dispose(): void
    {
        if(this.disposed) return;

        this.hide(this._roomObject);

        super.dispose();
    }
}
