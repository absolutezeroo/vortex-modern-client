/**
 * RoomWidgetTrophyDataUpdateEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetTrophyDataUpdateEvent.as
 *
 * Carries a trophy's engraving from FurnitureTrophyWidgetHandler to TrophyFurniWidget.
 * The three text fields come out of one tab-separated `furniture_data` string.
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetTrophyDataUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: RoomWidgetTrophyDataUpdateEvent.as::UPDATE_TROPHY_DATA
    public static readonly UPDATE_TROPHY_DATA: string = 'RWTDUE_TROPHY_DATA';

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::_color
    private _color: number;

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::_name
    private _name: string;

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::_SafeStr_6343
    private _date: string;

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::_SafeStr_5626
    private _message: string;

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::_SafeStr_8455
    private _viewType: number;

    /**
     * AS3: RoomWidgetTrophyDataUpdateEvent.as::RoomWidgetTrophyDataUpdateEvent()
     *
     * AS3's trailing `bubbles`/`cancelable` Event parameters are dropped: this port
     * dispatches update events through an EventEmitter (`desktopEvents.emit(type, event)`),
     * which has no capture/bubble phase for them to control.
     */
    constructor(type: string, color: number, name: string, date: string, message: string, viewType: number)
    {
        super(type);

        this._color = color;
        this._name = name;
        this._date = date;
        this._message = message;
        this._viewType = viewType;
    }

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::get color()
    public get color(): number
    {
        return this._color;
    }

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::get name()
    public get name(): string
    {
        return this._name;
    }

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::get date()
    public get date(): string
    {
        return this._date;
    }

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::get message()
    public get message(): string
    {
        return this._message;
    }

    // AS3: RoomWidgetTrophyDataUpdateEvent.as::get viewType()
    public get viewType(): number
    {
        return this._viewType;
    }
}
