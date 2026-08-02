/**
 * RoomWidgetDimmerUpdateEventPresetItem
 *
 * One stored moodlight preset as it arrives from the server: colour, effect type and
 * brightness.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetDimmerUpdateEventPresetItem.as
 */
export class RoomWidgetDimmerUpdateEventPresetItem
{
    // AS3: .../events/RoomWidgetDimmerUpdateEventPresetItem.as::RoomWidgetDimmerUpdateEventPresetItem()
    constructor(id: number, type: number, color: number, light: number)
    {
        this._id = id;
        this._type = type;
        this._color = color;
        this._light = light;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEventPresetItem.as::_SafeStr_4872
    private _id: number;

    // AS3: .../events/RoomWidgetDimmerUpdateEventPresetItem.as::get id()
    public get id(): number
    {
        return this._id;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEventPresetItem.as::_SafeStr_4778
    private _type: number;

    // AS3: .../events/RoomWidgetDimmerUpdateEventPresetItem.as::get type()
    public get type(): number
    {
        return this._type;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEventPresetItem.as::_color
    private _color: number;

    // AS3: .../events/RoomWidgetDimmerUpdateEventPresetItem.as::get color()
    public get color(): number
    {
        return this._color;
    }

    // AS3: .../events/RoomWidgetDimmerUpdateEventPresetItem.as::_SafeStr_6311
    private _light: number;

    // AS3: .../events/RoomWidgetDimmerUpdateEventPresetItem.as::get light()
    public get light(): number
    {
        return this._light;
    }
}
