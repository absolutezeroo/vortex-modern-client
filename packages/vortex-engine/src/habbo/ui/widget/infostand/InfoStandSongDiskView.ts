/**
 * InfoStandSongDiskView
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as
 *
 * The furni infostand for a song disk: the shared furni view plus the disk's track and creator
 * names. Which song a disk holds is not in the furni data — it is encoded in the selection's
 * extraParam as `RWEIEP_SONGDISK<id>`, so update() parses the id out and updateSongInfo() only
 * accepts the reply carrying that same id. Layout selection works as in InfoStandJukeboxView.
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {RoomWidgetFurniInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetFurniInfoUpdateEvent';
import {RoomWidgetSongUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetSongUpdateEvent';
import {RoomWidgetInfostandExtraParamEnum} from '@habbo/ui/widget/enums/RoomWidgetInfostandExtraParamEnum';
import {InfoStandFurniView} from './InfoStandFurniView';
import type {InfoStandWidget} from './InfoStandWidget';

export class InfoStandSongDiskView extends InfoStandFurniView
{
    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as::_songId
    private _songId: number = -1;

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as::InfoStandSongDiskView()
    constructor(widget: InfoStandWidget, name: string, catalog: IHabboCatalog | null)
    {
        super(widget, name, catalog);
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as::createWindow()
    // Only the asset name differs from the base — see the file header.
    protected override get layoutName(): string
    {
        return 'songdisk_view';
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as::update()
    public override update(event: RoomWidgetFurniInfoUpdateEvent): void
    {
        super.update(event);

        this._songId = InfoStandSongDiskView.getSongIdFromExtraParam(event.extraParam);
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as::updateSongInfo()
    public updateSongInfo(event: RoomWidgetSongUpdateEvent): void
    {
        if(event.type === RoomWidgetSongUpdateEvent.SONG_DATA_RECEIVED && event.songId === this._songId)
        {
            this.trackName = event.songName;
            this.authorName = event.songAuthor;
        }
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as::set trackName()
    private set trackName(value: string)
    {
        const container = this._elementList?.getListItemByName('trackname_container') as IWindowContainer | null;

        if(!container) return;

        const text = container.getChildByName('track_name_text') as ITextWindow | null;

        if(!text) return;

        text.text = value;
        text.visible = true;
        text.height = text.textHeight + 5;

        this.updateWindow();
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as::set authorName()
    private set authorName(value: string)
    {
        const container = this._elementList?.getListItemByName('creatorname_container') as IWindowContainer | null;

        if(!container) return;

        const text = container.getChildByName('track_creator_text') as ITextWindow | null;

        if(!text) return;

        text.text = value;
        text.visible = true;
        text.height = text.textHeight + 5;

        this.updateWindow();
    }

    /**
     * AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as::getSongIdFromExtraParam()
     *
     * AS3's `parseInt` on a non-numeric tail yields NaN, which its `int` return coerces to 0.
     * `Number.NaN` would compare false against every incoming songId here, where 0 could match a
     * real one, so the unparseable case is folded into the same -1 the null case returns.
     */
    private static getSongIdFromExtraParam(extraParam: string | null): number
    {
        if(extraParam === null) return -1;

        const songId = parseInt(extraParam.substr(RoomWidgetInfostandExtraParamEnum.INFOSTAND_EXTRAPARAM_SONGDISK.length));

        return Number.isNaN(songId) ? -1 : songId;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/infostand/InfoStandSongDiskView.as::dispose()
    public override dispose(): void
    {
        super.dispose();
    }
}
