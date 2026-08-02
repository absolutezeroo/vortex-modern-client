/**
 * DimmerFurniWidgetPresetItem
 *
 * The widget's own mutable copy of a preset. Distinct from
 * `RoomWidgetDimmerUpdateEventPresetItem`, which is read-only and carries the server's
 * version — this one is edited in place as the player drags sliders, and only written back
 * when a preset is saved.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/dimmer/DimmerFurniWidgetPresetItem.as
 */
export class DimmerFurniWidgetPresetItem
{
    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::DimmerFurniWidgetPresetItem()
    constructor(id: number, type: number, color: number, light: number)
    {
        this._id = id;
        this._type = type;
        this._color = color;
        this._light = light;
    }

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::_SafeStr_4872
    private _id: number = 0;

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::get id()
    public get id(): number
    {
        return this._id;
    }

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::_SafeStr_4778
    private _type: number = 0;

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::get type()
    public get type(): number
    {
        return this._type;
    }

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::set type()
    public set type(value: number)
    {
        this._type = value;
    }

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::_color
    private _color: number = 0;

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::get color()
    public get color(): number
    {
        return this._color;
    }

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::set color()
    public set color(value: number)
    {
        this._color = value;
    }

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::_SafeStr_6311
    private _light: number = 0;

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::get light()
    public get light(): number
    {
        return this._light;
    }

    // AS3: .../dimmer/DimmerFurniWidgetPresetItem.as::set light()
    public set light(value: number)
    {
        this._light = value;
    }
}
