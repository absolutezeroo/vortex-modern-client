/**
 * RoomEngineAreaHideStateWidgetEvent
 *
 * @see source_as_win63/habbo/room/events/RoomEngineAreaHideStateWidgetEvent.as
 *
 * Event dispatched to update area hide widget state.
 */
import {RoomEngineToWidgetEvent} from './RoomEngineToWidgetEvent';

export class RoomEngineAreaHideStateWidgetEvent extends RoomEngineToWidgetEvent
{
    public static readonly UPDATE_STATE_AREA_HIDE = 'RETWE_UPDATE_STATE_AREA_HIDE';

    constructor(roomId: number, objectId: number, category: number, isOn: boolean)
    {
        super(RoomEngineAreaHideStateWidgetEvent.UPDATE_STATE_AREA_HIDE, roomId, objectId, category);
        this._isOn = isOn;
    }

    private _isOn: boolean;

    get isOn(): boolean
    {
        return this._isOn;
    }
}
