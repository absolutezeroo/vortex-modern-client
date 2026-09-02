import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboSoundManager} from '@habbo/sound/IHabboSoundManager';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * The trax page's "listen" button. The song-disk product view does the same job for a disk offer;
 * this is the plain version for a trax page — no length caption, no official-song-code round trip,
 * and no product view underneath. The button stays disabled until the selected offer carries a
 * numeric `extraParam`.
 *
 * Preview playback runs at priority 3, with both the room's music (priority 0) and any earlier
 * preview cut to a zero fade-out first so the new track starts clean.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as
 */
export class TraxPreviewCatalogWidget extends CatalogWidget
{
    // TS-only: AS3 inlines 3 and 0 at every call site; both names match the song-disk widget's.
    private static readonly PREVIEW_PRIORITY = 3;

    // TS-only: see above.
    private static readonly ROOM_MUSIC_PRIORITY = 0;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::_soundManager
    private _soundManager: IHabboSoundManager | null;

    // The "listen" child. Name DERIVED — `_SafeStr_5643` is obfuscated in every tree.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::_SafeStr_5643
    private _listenButton: IWindow | null;

    // The song id from the selected offer's `extraParam`. Name DERIVED — `_SafeStr_5576`.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::_SafeStr_5576
    private _songId: number = -1;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::TraxPreviewCatalogWidget()
    constructor(window: IWindowContainer, soundManager: IHabboSoundManager | null)
    {
        super(window);

        this._listenButton = this.window.findChildByName('listen');

        if(this._listenButton !== null)
        {
            this._listenButton.addEventListener(WindowMouseEvent.CLICK, this.onClickPlay);
            this._listenButton.disable();
        }

        this._soundManager = soundManager;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        if(this.page.offers.length === 0) return false;

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);

        return true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::closed()
    override closed(): void
    {
        super.closed();

        this._soundManager?.musicController?.stop(TraxPreviewCatalogWidget.PREVIEW_PRIORITY);
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::onSelectProduct()
    private onSelectProduct = (event: SelectProductEvent): void =>
    {
        if(!event?.offer) return;

        const product = event.offer.product;
        let playable = false;

        if(product && product.extraParam.length > 0)
        {
            this._songId = parseInt(product.extraParam);
            playable = true;
        }

        if(this._listenButton === null) return;

        if(playable) this._listenButton.enable();
        else this._listenButton.disable();
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::onClickPlay()
    private onClickPlay = (_event: WindowMouseEvent): void =>
    {
        if(!this._soundManager?.musicController) return;

        this.forceNoFadeoutOnPlayingSong(TraxPreviewCatalogWidget.ROOM_MUSIC_PRIORITY);
        this.forceNoFadeoutOnPlayingSong(TraxPreviewCatalogWidget.PREVIEW_PRIORITY);
        this._soundManager.musicController.playSong(this._songId, TraxPreviewCatalogWidget.PREVIEW_PRIORITY, 15, 40, 0, 2);
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::forceNoFadeoutOnPlayingSong()
    private forceNoFadeoutOnPlayingSong(priority: number): void
    {
        const musicController = this._soundManager?.musicController;

        if(!musicController) return;

        const playingId = musicController.getSongIdPlayingAtPriority(priority);

        if(playingId === -1) return;

        const songInfo = musicController.getSongInfo(playingId);

        if(songInfo?.soundObject) songInfo.soundObject.fadeOutSeconds = 0;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/TraxPreviewCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this._listenButton?.removeEventListener(WindowMouseEvent.CLICK, this.onClickPlay);

        if(this._soundManager?.musicController)
        {
            this._soundManager.musicController.stop(TraxPreviewCatalogWidget.PREVIEW_PRIORITY);
            this._soundManager = null;
        }

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onSelectProduct);
        super.dispose();
    }
}
