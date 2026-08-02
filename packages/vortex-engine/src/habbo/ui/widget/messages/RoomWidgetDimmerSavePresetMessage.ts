import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * RoomWidgetDimmerSavePresetMessage
 *
 * Stores one of the moodlight's three presets. `apply` distinguishes the two callers: the
 * Apply button sends true (save *and* switch to it), while tabbing away from a preset sends
 * false, which persists the edit without changing what the room shows.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetDimmerSavePresetMessage.as
 */
export class RoomWidgetDimmerSavePresetMessage extends RoomWidgetMessage
{
    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::WIDGET_MESSAGE_SAVE_DIMMER_PRESET
    public static readonly WIDGET_MESSAGE_SAVE_DIMMER_PRESET: string = 'RWSDPM_SAVE_PRESET';

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::RoomWidgetDimmerSavePresetMessage()
    constructor(
        presetNumber: number,
        effectTypeId: number,
        color: number,
        brightness: number,
        apply: boolean,
        objectId: number
    )
    {
        super(RoomWidgetDimmerSavePresetMessage.WIDGET_MESSAGE_SAVE_DIMMER_PRESET);

        this._presetNumber = presetNumber;
        this._effectTypeId = effectTypeId;
        this._color = color;
        this._brightness = brightness;
        this._apply = apply;
        this._objectId = objectId;
    }

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::_presetNumber
    private _presetNumber: number;

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::get presetNumber()
    public get presetNumber(): number
    {
        return this._presetNumber;
    }

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::_SafeStr_9920
    private _effectTypeId: number;

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::get effectTypeId()
    public get effectTypeId(): number
    {
        return this._effectTypeId;
    }

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::_color
    private _color: number;

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::get color()
    public get color(): number
    {
        return this._color;
    }

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::_SafeStr_7330
    private _brightness: number;

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::get brightness()
    public get brightness(): number
    {
        return this._brightness;
    }

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::_SafeStr_9949
    private _apply: boolean;

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::get apply()
    public get apply(): boolean
    {
        return this._apply;
    }

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::_SafeStr_4841
    private _objectId: number;

    // AS3: .../messages/RoomWidgetDimmerSavePresetMessage.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }
}
