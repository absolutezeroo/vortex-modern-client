import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IConnection} from '@core/communication/connection/IConnection';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboSoundManager} from '@habbo/sound/IHabboSoundManager';
import {SongInfoReceivedEvent} from '@habbo/sound/events/SongInfoReceivedEvent';
import {
    OfficialSongIdMessageEvent
} from '@habbo/communication/messages/incoming/sound/OfficialSongIdMessageEvent';
import type {
    OfficialSongIdMessageParser
} from '@habbo/communication/messages/parser/sound/OfficialSongIdMessageParser';
import {
    GetOfficialSongIdMessageComposer
} from '@habbo/communication/messages/outgoing/sound/GetOfficialSongIdMessageComposer';
import type {HabboCatalog} from '../../HabboCatalog';
import {SelectProductEvent} from './events/SelectProductEvent';
import {ProductViewCatalogWidget} from './ProductViewCatalogWidget';

export class SongDiskProductViewCatalogWidget extends ProductViewCatalogWidget
{
    /**
    * SongDiskProductViewCatalogWidget — the product view for a catalog song-disk page.
    *
    * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/SongDiskProductViewCatalogWidget.as
    *
    * The normal product view plus a "listen" button and a track-length caption. Selecting an offer
    * resolves which song it is by one of two routes: the product's `extraParam` is either the numeric
    * song id already, or an *official song code*, which has to be resolved by the server. AS3 tells
    * the two apart by `parseInt(extraParam) == 0` — an official code is a non-numeric string, and
    * AS3's `parseInt` yields 0 for it.
    *
    * Preview playback runs at priority 3, and both the room's music (priority 0) and any previous
    * preview have their fade-out zeroed first so the new track starts immediately.
    */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/SongDiskProductViewCatalogWidget.as::PREVIEW_PRIORITY
    // Name DERIVED: AS3 inlines 3 at every call. 0 is the room-music priority it also has to silence.
    private static readonly PREVIEW_PRIORITY = 3;

    private static readonly ROOM_MUSIC_PRIORITY = 0;

    // AS3: .../SongDiskProductViewCatalogWidget.as::_soundManager
    private _soundManager: IHabboSoundManager | null;

    // AS3: .../SongDiskProductViewCatalogWidget.as::_connection
    private _connection: IConnection | null;

    // AS3: .../SongDiskProductViewCatalogWidget.as::_playPreviewContainer
    private _playPreviewContainer: IWindowContainer | null = null;

    // AS3: .../SongDiskProductViewCatalogWidget.as::_listenButton
    // Name DERIVED (`_SafeStr_5643`): the "listen" child it binds the preview click to.
    private _listenButton: IWindow | null = null;

    // AS3: .../SongDiskProductViewCatalogWidget.as::_songLengthText
    // Name DERIVED (`_SafeStr_7289`): the "ctlg_song_length" caption.
    private _songLengthText: IWindow | null = null;

    // AS3: .../SongDiskProductViewCatalogWidget.as::_songId
    // Name DERIVED (`_SafeStr_5576`): -1 until an offer with an extraParam is selected.
    private _songId: number = -1;

    // AS3: .../SongDiskProductViewCatalogWidget.as::_officialSongId
    private _officialSongId: string = '';

    // AS3: .../SongDiskProductViewCatalogWidget.as::_officialSongIdListener
    private _officialSongIdListener: IMessageEvent | null = null;

    // AS3: .../SongDiskProductViewCatalogWidget.as::SongDiskProductViewCatalogWidget()
    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window, catalog);

        this._listenButton = this._window.findChildByName('listen');

        if(this._listenButton !== null)
        {
            this._listenButton.addEventListener(WindowMouseEvent.CLICK, this.onClickPlay);
            // Stays disabled until a selected offer turns out to have a known length.
            this._listenButton.disable();
        }

        this._songLengthText = this._window.findChildByName('ctlg_song_length');
        this._playPreviewContainer = this._window.findChildByName('playPreviewContainer') as IWindowContainer | null;

        if(this._playPreviewContainer !== null) this._playPreviewContainer.visible = false;

        this._soundManager = catalog.soundManager;
        this._soundManager?.events.on(SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED, this.onSongInfoReceived);

        this._connection = catalog.connection;

        if(this._connection !== null && this._officialSongIdListener === null)
        {
            this._officialSongIdListener = new OfficialSongIdMessageEvent(this.onOfficialSongId);
            this._connection.addMessageEvent(this._officialSongIdListener);
        }
    }

    // AS3: .../SongDiskProductViewCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        if(this.page.offers.length === 0) return false;

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);

        return true;
    }

    // AS3: .../SongDiskProductViewCatalogWidget.as::closed()
    override closed(): void
    {
        super.closed();

        this._soundManager?.musicController?.stop(SongDiskProductViewCatalogWidget.PREVIEW_PRIORITY);
    }

    // AS3: .../SongDiskProductViewCatalogWidget.as::onClickPlay()
    private onClickPlay = (_event: WindowMouseEvent): void =>
    {
        if(!this._soundManager?.musicController) return;

        this.forceNoFadeoutOnPlayingSong(SongDiskProductViewCatalogWidget.ROOM_MUSIC_PRIORITY);
        this.forceNoFadeoutOnPlayingSong(SongDiskProductViewCatalogWidget.PREVIEW_PRIORITY);
        this._soundManager.musicController.playSong(this._songId, SongDiskProductViewCatalogWidget.PREVIEW_PRIORITY, 15, 40, 0.5, 2);
    };

    /**
     * AS3: .../SongDiskProductViewCatalogWidget.as::forceNoFadeoutOnPlayingSong()
     *
     * A track already fading out at this priority would keep bleeding into the preview, so its
     * fade is cut to zero before the new one starts.
     */
    // AS3: .../SongDiskProductViewCatalogWidget.as::forceNoFadeoutOnPlayingSong()
    private forceNoFadeoutOnPlayingSong(priority: number): void
    {
        const musicController = this._soundManager?.musicController;

        if(!musicController) return;

        const playingId = musicController.getSongIdPlayingAtPriority(priority);

        if(playingId === -1) return;

        const songInfo = musicController.getSongInfo(playingId);

        if(songInfo?.soundObject) songInfo.soundObject.fadeOutSeconds = 0;
    }

    // AS3: .../SongDiskProductViewCatalogWidget.as::onSelectProduct()
    private onSelectProduct = (event: SelectProductEvent): void =>
    {
        if(!event?.offer) return;

        const product = event.offer.product;

        if(product && product.extraParam.length > 0)
        {
            this._songId = parseInt(product.extraParam);

            // Not a number: it is an official song code, and only the server can turn it into an
            // id. AS3 relies on parseInt yielding 0 there; TS yields NaN, so both are accepted.
            if(this._songId === 0 || Number.isNaN(this._songId))
            {
                this._officialSongId = product.extraParam;
                this._connection?.send(new GetOfficialSongIdMessageComposer(this._officialSongId));
            }

            if(this._playPreviewContainer !== null) this._playPreviewContainer.visible = true;
        }
        else
        {
            this._songId = -1;
        }

        this.updateView();
    };

    // AS3: .../SongDiskProductViewCatalogWidget.as::updateView()
    private updateView(): void
    {
        const seconds = this.getSongLength();
        let hasLength = false;

        if(seconds >= 0)
        {
            const minutePart = String(Math.floor(seconds / 60));
            const secondPart = String(seconds % 60).padStart(2, '0');
            // AS3 reaches the manager back through `page.viewer.catalog` here rather than the
            // field it already holds; kept, since the base class keeps its own `_catalog` private.
            const localization = this.page.viewer?.catalog?.localization ?? null;

            localization?.registerParameter('catalog.song.length', 'min', minutePart);

            const caption = localization?.registerParameter('catalog.song.length', 'sec', secondPart) ?? '';

            hasLength = true;

            if(this._songLengthText !== null) this._songLengthText.caption = caption;
        }
        else if(this._songLengthText !== null)
        {
            this._songLengthText.caption = '';
        }

        if(this._listenButton === null) return;

        if(hasLength) this._listenButton.enable();
        else this._listenButton.disable();
    }

    /**
     * AS3: .../SongDiskProductViewCatalogWidget.as::getSongLength()
     *
     * Seconds, or -1 when the metadata has not arrived — in which case asking for it is what makes
     * it arrive, and onSongInfoReceived() runs this again.
     */
    // AS3: .../SongDiskProductViewCatalogWidget.as::getSongLength()
    private getSongLength(): number
    {
        const musicController = this._soundManager?.musicController;

        if(!musicController) return -1;

        const songInfo = musicController.getSongInfo(this._songId);

        if(songInfo !== null) return songInfo.length / 1000;

        musicController.requestSongInfoWithoutSamples(this._songId);

        return -1;
    }

    // AS3: .../SongDiskProductViewCatalogWidget.as::onSongInfoReceivedEvent()
    private onSongInfoReceived = (event: SongInfoReceivedEvent): void =>
    {
        if(event.id === this._songId) this.updateView();
    };

    // AS3: .../SongDiskProductViewCatalogWidget.as::onOfficialSongIdMessageEvent()
    // The event fires for every code the session resolves, so the reply is matched to the one this
    // widget asked for before it is believed.
    private onOfficialSongId = (event: IMessageEvent): void =>
    {
        const parser = event.parser as OfficialSongIdMessageParser;

        if(parser.officialSongId !== this._officialSongId) return;

        this._songId = parser.songId;
        this.updateView();
    };

    // AS3: .../SongDiskProductViewCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this._listenButton?.removeEventListener(WindowMouseEvent.CLICK, this.onClickPlay);
        this._listenButton = null;
        this._songLengthText = null;
        this._playPreviewContainer = null;

        // AS3 nests every teardown below inside `if(_soundManager && _soundManager.musicController)`,
        // so a widget disposed before the sound manager resolved would leak its connection listener
        // and never stop the preview. Flattened here: each step guards only itself.
        this._soundManager?.musicController?.stop(SongDiskProductViewCatalogWidget.PREVIEW_PRIORITY);
        this._soundManager?.events.off(SongInfoReceivedEvent.TRAX_SONG_INFO_RECEIVED, this.onSongInfoReceived);
        this._soundManager = null;

        if(this._connection !== null && this._officialSongIdListener !== null)
        {
            this._connection.removeMessageEvent(this._officialSongIdListener);
            this._officialSongIdListener = null;
        }

        this._connection = null;

        super.dispose();
    }
}
