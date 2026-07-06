import type {IStuffData} from '@habbo/room/object/data/IStuffData';

/**
 * Overrides the stuff data (e.g. wallpaper/floor variant) used for the room-canvas preview
 * of the currently selected offer.
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/events/SetRoomPreviewerStuffDataEvent.as
 */
export class SetRoomPreviewerStuffDataEvent
{
    static readonly CWE_SET_PREVIEWER_STUFFDATA: string = 'CWE_SET_PREVIEWER_STUFFDATA';

    private _stuffData: IStuffData | null;

    constructor(stuffData: IStuffData | null)
    {
        this._stuffData = stuffData;
    }

    get type(): string
    {
        return SetRoomPreviewerStuffDataEvent.CWE_SET_PREVIEWER_STUFFDATA;
    }

    get stuffData(): IStuffData | null
    {
        return this._stuffData;
    }
}
