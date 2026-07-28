/**
 * RoomWidgetStickieDataUpdateEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetStickieDataUpdateEvent.as
 *
 * Carries a sticky note's contents from FurnitureStickieWidgetHandler to StickieFurniWidget.
 * `colorHex` and `text` come out of one space-separated `furniture_itemdata` string.
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetStickieDataUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: RoomWidgetStickieDataUpdateEvent.as::UPDATE_STICKIE_DATA
    public static readonly UPDATE_STICKIE_DATA: string = 'RWSDUE_STICKIE_DATA';

    // AS3: RoomWidgetStickieDataUpdateEvent.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: RoomWidgetStickieDataUpdateEvent.as::_SafeStr_6938
    private _objectType: string;

    // AS3: RoomWidgetStickieDataUpdateEvent.as::_text
    private _text: string;

    // AS3: RoomWidgetStickieDataUpdateEvent.as::_SafeStr_5209
    private _colorHex: string;

    // AS3: RoomWidgetStickieDataUpdateEvent.as::_SafeStr_4593
    private _controller: boolean;

    /**
     * AS3: RoomWidgetStickieDataUpdateEvent.as::RoomWidgetStickieDataUpdateEvent()
     *
     * AS3's trailing `bubbles`/`cancelable` Event parameters are dropped, as in the other ported
     * update events: this port dispatches through an EventEmitter, which has no capture phase.
     */
    constructor(type: string, objectId: number, objectType: string, text: string, colorHex: string, controller: boolean)
    {
        super(type);

        this._objectId = objectId;
        this._objectType = objectType;
        this._text = text;
        this._colorHex = colorHex;
        this._controller = controller;
    }

    // AS3: RoomWidgetStickieDataUpdateEvent.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: RoomWidgetStickieDataUpdateEvent.as::get objectType()
    public get objectType(): string
    {
        return this._objectType;
    }

    // AS3: RoomWidgetStickieDataUpdateEvent.as::get text()
    public get text(): string
    {
        return this._text;
    }

    // AS3: RoomWidgetStickieDataUpdateEvent.as::get colorHex()
    public get colorHex(): string
    {
        return this._colorHex;
    }

    /**
     * AS3: RoomWidgetStickieDataUpdateEvent.as::get controller()
     *
     * True when the viewer may edit or delete the note — room owner, or any-room controller.
     */
    public get controller(): boolean
    {
        return this._controller;
    }
}
