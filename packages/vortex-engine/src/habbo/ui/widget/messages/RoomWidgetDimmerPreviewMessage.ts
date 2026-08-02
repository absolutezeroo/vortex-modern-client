import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * RoomWidgetDimmerPreviewMessage
 *
 * Local-only: the handler applies it straight to the room engine and sends nothing. This is
 * what makes dragging the brightness slider recolour the room live, before Apply.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetDimmerPreviewMessage.as
 */
export class RoomWidgetDimmerPreviewMessage extends RoomWidgetMessage
{
    // AS3: .../messages/RoomWidgetDimmerPreviewMessage.as::PREVIEW
    public static readonly PREVIEW: string = 'RWDPM_PREVIEW_DIMMER_PRESET';

    // AS3: .../messages/RoomWidgetDimmerPreviewMessage.as::RoomWidgetDimmerPreviewMessage()
    constructor(color: number, brightness: number, bgOnly: boolean)
    {
        super(RoomWidgetDimmerPreviewMessage.PREVIEW);

        this._color = color;
        this._brightness = brightness;
        this._bgOnly = bgOnly;
    }

    // AS3: .../messages/RoomWidgetDimmerPreviewMessage.as::_color
    private _color: number;

    // AS3: .../messages/RoomWidgetDimmerPreviewMessage.as::get color()
    public get color(): number
    {
        return this._color;
    }

    // AS3: .../messages/RoomWidgetDimmerPreviewMessage.as::_SafeStr_7330
    private _brightness: number;

    // AS3: .../messages/RoomWidgetDimmerPreviewMessage.as::get brightness()
    public get brightness(): number
    {
        return this._brightness;
    }

    /** True for effect type 2, where only the room background is tinted, not the objects. */
    // AS3: .../messages/RoomWidgetDimmerPreviewMessage.as::_SafeStr_9193
    private _bgOnly: boolean;

    // AS3: .../messages/RoomWidgetDimmerPreviewMessage.as::get bgOnly()
    public get bgOnly(): boolean
    {
        return this._bgOnly;
    }
}
