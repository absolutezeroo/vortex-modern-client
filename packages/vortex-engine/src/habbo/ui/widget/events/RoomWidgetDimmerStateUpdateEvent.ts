import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * RoomWidgetDimmerStateUpdateEvent
 *
 * The moodlight's live state, as the room engine reports it — on/off, which preset is
 * active, and the colour it is currently showing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetDimmerStateUpdateEvent.as
 */
export class RoomWidgetDimmerStateUpdateEvent extends RoomWidgetUpdateEvent
{
    /** The identifier is obfuscated in every tree (`_SafeStr_10267`); only the value is recovered, and this name is derived from it. */
    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::_SafeStr_10267
    public static readonly DIMMER_STATE: string = 'RWDSUE_DIMMER_STATE';

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::RoomWidgetDimmerStateUpdateEvent()
    constructor(
        objectId: number,
        state: number,
        presetId: number,
        effectId: number,
        color: number,
        brightness: number
    )
    {
        super(RoomWidgetDimmerStateUpdateEvent.DIMMER_STATE);

        this._objectId = objectId;
        this._state = state;
        this._presetId = presetId;
        this._effectId = effectId;
        this._color = color;
        this._brightness = brightness;
    }

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::_SafeStr_4841
    private _objectId: number;

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::_SafeStr_4597
    private _state: number;

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::get state()
    public get state(): number
    {
        return this._state;
    }

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::_SafeStr_9483
    private _presetId: number;

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::get presetId()
    public get presetId(): number
    {
        return this._presetId;
    }

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::_SafeStr_7207
    private _effectId: number;

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::get effectId()
    public get effectId(): number
    {
        return this._effectId;
    }

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::_color
    private _color: number;

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::get color()
    public get color(): number
    {
        return this._color;
    }

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::_SafeStr_7330
    private _brightness: number;

    // AS3: .../events/RoomWidgetDimmerStateUpdateEvent.as::get brightness()
    public get brightness(): number
    {
        return this._brightness;
    }
}
