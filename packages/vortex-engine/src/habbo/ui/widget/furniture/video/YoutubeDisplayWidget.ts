import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDisplayObjectWrapper} from '@core/window/components/IDisplayObjectWrapper';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {
    IYoutubePlaylist
} from '@habbo/communication/messages/parser/room/furniture/YoutubeDisplayPlaylistsMessageEventParser';
import type {YoutubeDisplayWidgetHandler} from '@habbo/ui/handler/YoutubeDisplayWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {YoutubePlayerStateEnum} from './YoutubePlayerStateEnum';
import {VideoIframeOverlay} from './VideoIframeOverlay';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.ui.widget.furniture.video.YoutubeDisplayWidget');

/**
 * The YouTube "TV" furni's floating player window — the `RWE_YOUTUBE` widget.
 *
 * AS3 embeds a Flash `Loader` (the chromeless YouTube player SWF) into the layout's
 * `video_wrapper` `display_object_wrapper` slot and drives it through its Flash API
 * (`loadVideoById`/`playVideo`/`pauseVideo`/`getPlayerState`, `onReady`/`onStateChange` events).
 * This port has no Flash player to embed, so — following the substitution this port already
 * established for `StageWebView` in `packages/vortex-client/src/login/WebCaptchaView.ts` — the
 * player is a real `<iframe>` (`VideoIframeOverlay`) tracking `video_wrapper`'s on-screen
 * rectangle, loaded from YouTube's standard embed URL and driven through YouTube's documented
 * `postMessage` protocol (`enablejsapi=1`; commands as `{event:"command",func,args}`; state as
 * `{event:"infoDelivery",info:{playerState}}`/`{event:"onStateChange",info}`).
 *
 * One AS3 mechanism has no substitute at all: `onVideoMouseEvent()` reads `getPlayerState()` on
 * every `mouseUp`/`mouseMove` bubbled up from the embedded Flash content and reports the opposite
 * action (playing → pause, paused → continue) to the server, because Flash let the host swap
 * forward the nested SWF's raw mouse events. A cross-origin `<iframe>` cannot do this — the
 * browser does not expose events dispatched *inside* another origin's document at all (the same
 * restriction `WebCaptchaView`'s header describes for `locationChange`). The substitute here reacts
 * to the provider's own `onStateChange`/`infoDelivery` reports instead: whenever the observed
 * state flips between playing and paused while this viewer has control, that transition is
 * reported to the server exactly as AS3's click handler would have. See
 * `onProviderStateChanged()` for the guard that keeps this from echoing the server's own commands
 * back to itself.
 *
 * `suggestedQuality:"large"` (AS3's `loadVideoById()` param) has no embed-URL equivalent — it
 * would need a `setPlaybackQuality` postMessage command after `onReady`. Not ported: it is a
 * cosmetic hint and the embed already sizes to `video_wrapper`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/video/YoutubeDisplayWidget.as
 */
export class YoutubeDisplayWidget extends RoomWidgetBase
{
    // Name DERIVED (`_SafeStr_11099`): the highlight colour a selected playlist row's
    // `item_background` is set to.
    // AS3: .../video/YoutubeDisplayWidget.as::_SafeStr_11099
    private static readonly SELECTED_ITEM_COLOR: number = 4291611903;

    // Name DERIVED (`_SafeStr_11026`): the colour a deselected playlist row's `item_background`
    // is restored to.
    // AS3: .../video/YoutubeDisplayWidget.as::_SafeStr_11026
    private static readonly DEFAULT_ITEM_COLOR: number = 4294967295;

    // AS3: .../video/YoutubeDisplayWidget.as::_habboTracking
    private _habboTracking: IHabboTracking | null;

    // Name DERIVED (`_SafeStr_4690`): the currently highlighted playlist row.
    // AS3: .../video/YoutubeDisplayWidget.as::_SafeStr_4690
    private _selectedPlaylistItem: IWindow | null = null;

    // AS3: .../video/YoutubeDisplayWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../video/YoutubeDisplayWidget.as::_roomObject
    private _roomObject: IRoomObject | null = null;

    // Name DERIVED (`_SafeStr_6180`): the playlist item template, taken out of the item list once
    // (`removeListItemAt(0)`) and `clone()`-d for every row `populatePlaylists()` builds.
    // AS3: .../video/YoutubeDisplayWidget.as::_SafeStr_6180
    private _playlistItemTemplate: IWindow | null = null;

    // Name DERIVED (`_SafeStr_6604`): the currently loaded video id, or '' for "no video", or null
    // before any video has ever been loaded this session (gates the "video.closed" tracking call
    // in hide()).
    // AS3: .../video/YoutubeDisplayWidget.as::_SafeStr_6604
    private _currentVideoId: string | null = null;

    // AS3: .../video/YoutubeDisplayWidget.as::_canControlPlayback
    private _canControlPlayback: boolean = false;

    // Name DERIVED (`_SafeStr_6593`): the state the server last told this widget the video should
    // be in — 1 (playing) or 2 (paused). Used only to self-correct an unwanted autoplay resume,
    // exactly as AS3's onPlayerStateChange() does.
    // AS3: .../video/YoutubeDisplayWidget.as::_SafeStr_6593
    private _desiredPlaybackState: number = -1;

    // TS-only: the iframe standing in for AS3's embedded Loader — see the class header.
    private _overlay: VideoIframeOverlay | null = null;

    // TS-only: the last player state actually reported by YouTube's postMessage protocol. Never
    // fabricated — null until a real onStateChange/infoDelivery message has arrived.
    private _lastKnownState: number | null = null;

    // TS-only: set right before this widget sends its own playVideo/pauseVideo postMessage
    // command, so the resulting state-change report is not echoed straight back to the server —
    // see onProviderStateChanged().
    private _suppressNextStateReport: boolean = false;

    // TS-only: bound postMessage listener, added/removed alongside the overlay.
    private _onProviderMessage: ((event: MessageEvent) => void) | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/video/YoutubeDisplayWidget.as::YoutubeDisplayWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        habboTracking: IHabboTracking | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._habboTracking = habboTracking;

        const ownHandler = this.ownHandler;

        if(ownHandler !== null) ownHandler.widget = this;
    }

    // AS3: .../video/YoutubeDisplayWidget.as::get ownHandler()
    private get ownHandler(): YoutubeDisplayWidgetHandler | null
    {
        return (this._handler as YoutubeDisplayWidgetHandler | null) ?? null;
    }

    // AS3: .../video/YoutubeDisplayWidget.as::get mainWindow()
    override get mainWindow(): IWindow | null
    {
        return this._window;
    }

    // AS3: .../video/YoutubeDisplayWidget.as::show()
    show(roomObject: IRoomObject, canControlPlayback: boolean): void
    {
        this._roomObject = roomObject;
        this._canControlPlayback = canControlPlayback;

        this.createWindow(canControlPlayback);

        if(this._window !== null) this._window.visible = true;
    }

    // AS3: .../video/YoutubeDisplayWidget.as::createWindow()
    private createWindow(canControlPlayback: boolean): void
    {
        if(this._window !== null) return;

        this._window = this.windowManager.buildWidgetLayout('video_viewer_xml') as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            log.warn('video_viewer_xml did not build — the YouTube display cannot be opened');
            this._window = null;

            return;
        }

        if(canControlPlayback)
        {
            const playlists = this._window.findChildByName('playlists') as IItemListWindow | null;

            this._playlistItemTemplate = playlists?.removeListItemAt(0) ?? null;
        }
        else
        {
            this._window.findChildByName('right_pane')?.dispose();

            const videoBackground = this._window.findChildByName('video_background');

            if(videoBackground !== null)
            {
                videoBackground.width = this._window.width - 20;
                videoBackground.setParamFlag(128);
            }

            this._window.width -= 250;
        }

        const videoWrapper = this._window.findChildByName('video_wrapper') as IDisplayObjectWrapper | null;

        if(videoWrapper !== null)
        {
            this._overlay = new VideoIframeOverlay();
            this._onProviderMessage = this.onProviderMessage;
            window.addEventListener('message', this._onProviderMessage);
            this._overlay.mount(
                videoWrapper as unknown as IWindow, 'about:blank', 'autoplay; encrypted-media; fullscreen'
            );
        }

        this._window.procedure = this.onWindowEvent;
        this._window.center();
    }

    /**
     * AS3: .../video/YoutubeDisplayWidget.as::hide()
     */
    hide(roomObject: IRoomObject | null): void
    {
        if(this._roomObject !== roomObject) return;

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._playlistItemTemplate !== null)
        {
            this._playlistItemTemplate.dispose();
            this._playlistItemTemplate = null;
        }

        this.destroyPlayer();

        if(this._currentVideoId !== null)
        {
            this._habboTracking?.trackEventLog('YouTubeTVs', this._currentVideoId, 'video.closed');
        }

        this._selectedPlaylistItem = null;
        this._roomObject = null;
    }

    // AS3: .../video/YoutubeDisplayWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this.hide(this._roomObject);
        this._habboTracking = null;

        super.dispose();
    }

    // TS-only: tears down the iframe overlay and its message listener — see the class header.
    private destroyPlayer(): void
    {
        if(this._onProviderMessage !== null)
        {
            window.removeEventListener('message', this._onProviderMessage);
            this._onProviderMessage = null;
        }

        this._overlay?.destroy();
        this._overlay = null;
        this._lastKnownState = null;
        this._suppressNextStateReport = false;
    }

    /**
     * AS3: .../video/YoutubeDisplayWidget.as::windowProcedure()
     */
    // AS3: .../video/YoutubeDisplayWidget.as::windowProcedure()
    private onWindowEvent = (event: WindowEvent, target: IWindow): void =>
    {
        switch(event.type)
        {
            case 'WME_CLICK':
                switch(target.name)
                {
                    case 'header_button_close':
                        this.hide(this._roomObject);

                        break;

                    case 'playlist_prev':
                        if(this._roomObject !== null) this.ownHandler?.switchToPreviousVideo(this._roomObject.getId());

                        break;

                    case 'playlist_next':
                        if(this._roomObject !== null) this.ownHandler?.switchToNextVideo(this._roomObject.getId());

                        break;

                    default:
                        this.onPlaylistItemClicked(target);

                        break;
                }

                break;

            case 'WE_RESIZE':
                switch(target.name)
                {
                    case 'video_viewer':
                        this.onViewerResized();

                        break;

                    case 'playlists':
                        this.onPlaylistsResized(target as IItemListWindow);

                        break;

                    case 'video_wrapper':
                        this._overlay?.sync();

                        break;
                }

                break;
        }
    };

    /**
     * AS3's `default:` branch tests `param2 is IRegionWindow` — in this widget's tree the only
     * `IRegionWindow` instances are the playlist rows (built off the `<region name="item">`
     * template), so "clicked window belongs to the playlist item list" is the equivalent
     * discriminant for this port's typed window model.
     */
    // AS3: .../video/YoutubeDisplayWidget.as::windowProcedure() — the default WME_CLICK branch
    private onPlaylistItemClicked(target: IWindow): void
    {
        const playlists = this._window?.findChildByName('playlists') as IItemListWindow | null;

        if(playlists === null || playlists === undefined || playlists.getListItemIndex(target) === -1) return;

        if(this._selectedPlaylistItem !== null)
        {
            const previousBackground = (this._selectedPlaylistItem as IWindowContainer).findChildByName('item_background');

            if(previousBackground !== null) previousBackground.color = YoutubeDisplayWidget.DEFAULT_ITEM_COLOR;
        }

        if(this._selectedPlaylistItem === target)
        {
            this._selectedPlaylistItem = null;

            if(this._roomObject !== null) this.ownHandler?.selectPlaylist(this._roomObject.getId(), '');
        }
        else
        {
            this._selectedPlaylistItem = target;

            const background = (target as IWindowContainer).findChildByName('item_background');

            if(background !== null) background.color = YoutubeDisplayWidget.SELECTED_ITEM_COLOR;

            if(this._roomObject !== null) this.ownHandler?.selectPlaylist(this._roomObject.getId(), target.name);
        }

        this.updateButtons();
    }

    // AS3: .../video/YoutubeDisplayWidget.as::windowProcedure() — the "video_viewer" WE_RESIZE branch
    private onViewerResized(): void
    {
        if(this._window === null) return;

        const rightPane = this._window.findChildByName('right_pane');

        if(rightPane === null) return;

        const availableWidth = this._window.width - 29;
        const videoWidth = availableWidth * 0.66;
        const videoBackground = this._window.findChildByName('video_background');

        if(videoBackground !== null)
        {
            videoBackground.width = videoWidth;
            rightPane.x = videoBackground.right + 9;
        }

        rightPane.width = availableWidth - videoWidth;
    }

    // AS3: .../video/YoutubeDisplayWidget.as::windowProcedure() — the "playlists" WE_RESIZE branch
    private onPlaylistsResized(playlists: IItemListWindow): void
    {
        for(let i = 0; i < playlists.numListItems; i++)
        {
            const item = playlists.getListItemAt(i) as IWindowContainer | null;

            if(item === null) continue;

            const background = item.findChildByName('item_background');
            const contents = item.findChildByName('item_contents');
            const description = item.findChildByName('item_description');

            if(background !== null) background.width = playlists.width;
            if(contents !== null) contents.width = playlists.width;
            if(description !== null) description.width = playlists.width - 22;
        }
    }

    /**
     * AS3: .../video/YoutubeDisplayWidget.as::showVideo()
     *
     * No `_queuedVideoParams` equivalent: AS3 queues while its Flash `Loader` is still
     * asynchronously initialising the player SWF. This port's iframe overlay is mounted
     * synchronously in `createWindow()`, which always runs before `showVideo()` can be reached (it
     * only arrives after `show()`), so there is nothing to queue behind.
     */
    showVideo(furniId: number, videoId: string, startAtSeconds: number, endAtSeconds: number, state: number): void
    {
        if(this._roomObject === null || this._roomObject.getId() !== furniId) return;

        this.loadVideo(videoId, startAtSeconds, endAtSeconds);
        this._desiredPlaybackState = state;
    }

    /**
     * AS3: .../video/YoutubeDisplayWidget.as::controlVideo()
     *
     * The received `commandId` uses a different numbering than the one this widget *sends*
     * (`YoutubeDisplayWidgetHandler.CONTROL_COMMAND_*`) — ported exactly as read rather than
     * "corrected" to match, per this project's AS3-fidelity rule.
     */
    controlVideo(furniId: number, commandId: number): void
    {
        if(this._roomObject === null || this._roomObject.getId() !== furniId) return;

        if(this._window === null || this._overlay === null) return;

        switch(commandId - 1)
        {
            case 0:
                this._desiredPlaybackState = YoutubePlayerStateEnum.PLAYING;
                this.sendPlayerCommand('playVideo');

                break;

            case 1:
                this._desiredPlaybackState = YoutubePlayerStateEnum.PAUSED;
                this.sendPlayerCommand('pauseVideo');

                break;
        }
    }

    /**
     * AS3: .../video/YoutubeDisplayWidget.as::loadVideo()
     *
     * AS3 always calls `loadVideoById()` (which starts playing) and relies on
     * `onPlayerStateChange()` to correct an unwanted autoplay afterwards; this port's embed URL
     * follows the same shape — `autoplay=1` whenever a video id is present.
     */
    // AS3: .../video/YoutubeDisplayWidget.as::loadVideo()
    private loadVideo(videoId: string, startAtSeconds: number, endAtSeconds: number): void
    {
        this._currentVideoId = videoId;

        const hasVideo = videoId !== '';

        if(hasVideo)
        {
            this._overlay?.setSrc(this.buildEmbedUrl(videoId, startAtSeconds, endAtSeconds));
            this._habboTracking?.trackEventLog('YouTubeTVs', videoId, 'video.started');
        }
        else
        {
            this._overlay?.setSrc('about:blank');
        }

        if(this._window !== null)
        {
            const noVideosLabel = this._window.findChildByName('no_videos_label');
            const videoWrapper = this._window.findChildByName('video_wrapper');

            if(noVideosLabel !== null) noVideosLabel.visible = !hasVideo;
            if(videoWrapper !== null) videoWrapper.visible = hasVideo;
        }
    }

    // TS-only: builds the standard YouTube embed URL — see the class header for what this
    // replaces and what it cannot (suggestedQuality).
    private buildEmbedUrl(videoId: string, startAtSeconds: number, endAtSeconds: number): string
    {
        const params = new URLSearchParams({
            enablejsapi: '1',
            autoplay: '1',
            playsinline: '1'
        });

        if(startAtSeconds > 0 || endAtSeconds > 0)
        {
            if(startAtSeconds > 0) params.set('start', String(startAtSeconds));
            if(endAtSeconds > 0) params.set('end', String(endAtSeconds));
        }

        if(typeof location !== 'undefined') params.set('origin', location.origin);

        return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
    }

    // TS-only: the postMessage command send half of the substitution described in the class header.
    private sendPlayerCommand(func: string, args: unknown[] = []): void
    {
        this._suppressNextStateReport = true;
        this._overlay?.postCommand({event: 'command', func, args});
    }

    /**
     * TS-only: the postMessage receive half. Registers for state-change notifications once the
     * player signals it is ready, and tracks the last reported state.
     */
    // TS-only: no AS3 counterpart — see the class header.
    private onProviderMessage = (event: MessageEvent): void =>
    {
        if(this._overlay === null || event.source !== this._overlay.contentWindow) return;

        let data: {event?: string; info?: unknown} | null = null;

        try
        {
            data = typeof event.data === 'string' ? JSON.parse(event.data) : (event.data as typeof data);
        }
        catch
        {
            return;
        }

        if(data === null) return;

        if(data.event === 'onReady')
        {
            this._overlay.postCommand({event: 'listening', id: 1});
            this.sendPlayerCommand('addEventListener', ['onStateChange']);

            return;
        }

        const info = (data.info ?? null) as {playerState?: number} | number | null;
        const state = typeof info === 'number' ? info : info?.playerState;

        if(typeof state === 'number') this.onProviderStateChanged(state);
    };

    /**
     * TS-only substitute for AS3's `onVideoMouseEvent()` + `onPlayerStateChange()` — see the class
     * header for why a raw click cannot be forwarded across a cross-origin iframe.
     *
     * `_suppressNextStateReport` is the guard AS3 did not need: its report path was gated on a
     * genuine `mouseUp`, which never fires from this widget's own `playVideo()`/`pauseVideo()`
     * calls. This port's gate is the state change itself, which *does* fire for both a real click
     * and this widget's own commands — without the flag, correcting the server's own command would
     * immediately report it right back, into a needless call-and-response.
     */
    // TS-only: no AS3 counterpart — see the class header.
    private onProviderStateChanged(state: number): void
    {
        this._lastKnownState = state;

        if(this._suppressNextStateReport)
        {
            this._suppressNextStateReport = false;
        }
        else if(this._canControlPlayback && this._roomObject !== null)
        {
            if(state === YoutubePlayerStateEnum.PLAYING)
            {
                this.ownHandler?.pauseVideo(this._roomObject.getId());
            }
            else if(state === YoutubePlayerStateEnum.PAUSED)
            {
                this.ownHandler?.continueVideo(this._roomObject.getId());
            }
        }

        // AS3: .../video/YoutubeDisplayWidget.as::onPlayerStateChange() — self-correct an
        // autoplay the server did not ask for.
        if(
            (state === YoutubePlayerStateEnum.UNSTARTED || state === YoutubePlayerStateEnum.PLAYING)
            && this._desiredPlaybackState === YoutubePlayerStateEnum.PAUSED
        )
        {
            this.sendPlayerCommand('pauseVideo');
        }
    }

    /**
     * AS3: .../video/YoutubeDisplayWidget.as::populatePlaylists()
     */
    populatePlaylists(furniId: number, playlists: IYoutubePlaylist[], selectedPlaylistId: string): void
    {
        if(
            this._roomObject === null || this._roomObject.getId() !== furniId
            || this._window === null || this._playlistItemTemplate === null
        ) return;

        const list = this._window.findChildByName('playlists') as IItemListWindow | null;

        if(list === null) return;

        list.destroyListItems();
        this._selectedPlaylistItem = null;

        for(const playlist of playlists)
        {
            const row = this._playlistItemTemplate.clone() as IWindowContainer;

            row.name = playlist.playlistId;

            const background = row.findChildByName('item_background');
            const contents = row.findChildByName('item_contents');
            const title = row.findChildByName('item_title');
            const description = row.findChildByName('item_description');

            if(background !== null) background.width = list.width;

            if(playlist.playlistId === selectedPlaylistId)
            {
                if(background !== null) background.color = YoutubeDisplayWidget.SELECTED_ITEM_COLOR;

                this._selectedPlaylistItem = row;
            }

            if(contents !== null) contents.width = list.width;
            if(title !== null) title.caption = playlist.title;

            if(description !== null)
            {
                description.caption = playlist.description.replace(/\r/g, '');
                description.width = list.width - 22;
            }

            list.addListItem(row);
        }

        this.updateButtons();
    }

    // AS3: .../video/YoutubeDisplayWidget.as::updateButtons()
    private updateButtons(): void
    {
        if(this._window === null) return;

        const prev = this._window.findChildByName('playlist_prev');
        const next = this._window.findChildByName('playlist_next');
        const enabled = this._selectedPlaylistItem !== null;

        if(enabled)
        {
            prev?.enable();
            next?.enable();
        }
        else
        {
            prev?.disable();
            next?.disable();
        }
    }
}
