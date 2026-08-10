/**
 * InfoStandJukeboxView
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as
 *
 * The furni infostand for a jukebox: the shared furni view plus a "now playing" block naming the
 * current track and its creator. AS3 copies the whole of InfoStandFurniView.createWindow() here
 * only to build from the `jukebox_view` layout; this port overrides `layoutName` instead (see
 * InfoStandFurniView.layoutName). The two icons AS3 assigns in code — `icon_disc` and
 * `icon_composer` — come out of the layout's own `bitmap_asset_name` variables here, which
 * BitmapWrapperController resolves, so no explicit assignment is needed.
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import {RoomWidgetSongUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetSongUpdateEvent';
import {InfoStandFurniView} from './InfoStandFurniView';
import type {InfoStandWidget} from './InfoStandWidget';

export class InfoStandJukeboxView extends InfoStandFurniView
{
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::_songId
    private _songId: number = -1;

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::_songName
    private _songName: string = '';

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::_songAuthor
    private _songAuthor: string = '';

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::InfoStandJukeboxView()
    constructor(widget: InfoStandWidget, name: string, catalog: IHabboCatalog | null)
    {
        super(widget, name, catalog);
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::createWindow()
    // Only the asset name differs from the base — see the file header.
    protected override get layoutName(): string
    {
        return 'jukebox_view';
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::set nowPlayingTrackName()
    private set nowPlayingTrackName(value: string)
    {
        const container = this._elementList?.getListItemByName('trackname_container') as IWindowContainer | null;

        if(!container) return;

        const text = container.getChildByName('track_name_text') as ITextWindow | null;

        if(!text) return;

        text.text = value;
        text.visible = true;
        text.height = text.textHeight + 5;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::set nowPlayingAuthorName()
    private set nowPlayingAuthorName(value: string)
    {
        const container = this._elementList?.getListItemByName('creatorname_container') as IWindowContainer | null;

        if(!container) return;

        const text = container.getChildByName('track_creator_text') as ITextWindow | null;

        if(!text) return;

        text.text = value;
        text.visible = true;
        text.height = text.textHeight + 5;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::updateSongInfo()
    public updateSongInfo(event: RoomWidgetSongUpdateEvent): void
    {
        if(event.type === RoomWidgetSongUpdateEvent.SONG_PLAYING_CHANGED)
        {
            this._songId = event.songId;
        }

        // A DATA_RECEIVED for some other disk in the room must not overwrite what is playing here.
        if(event.songId === this._songId)
        {
            this._songName = event.songName;
            this._songAuthor = event.songAuthor;
            this.updateNowPlaying(this._songId >= 0);
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::updateNowPlaying()
    private updateNowPlaying(playing: boolean): void
    {
        const nowPlayingText = this._elementList?.getListItemByName('now_playing_text') as ITextWindow | null;

        if(nowPlayingText)
        {
            nowPlayingText.text = this._widget.localizations?.getLocalization(
                playing ? 'infostand.jukebox.text.now.playing' : 'infostand.jukebox.text.not.playing', ''
            ) ?? '';
        }

        this.nowPlayingTrackName = playing ? this._songName : '';
        this.nowPlayingAuthorName = playing ? this._songAuthor : '';

        this.updateWindow();
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandJukeboxView.as::dispose()
    public override dispose(): void
    {
        super.dispose();
    }
}
