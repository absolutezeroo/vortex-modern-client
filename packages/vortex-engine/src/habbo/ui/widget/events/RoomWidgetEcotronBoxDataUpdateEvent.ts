/**
 * RoomWidgetEcotronBoxDataUpdateEvent
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetEcotronBoxDataUpdateEvent.as
 *
 * Two phases on one class. `RWEBDUE_PACKAGEINFO` opens the card for a box the user clicked;
 * `RWEBDUE_CONTENTS` fills it in once the server says what was inside and the icon has loaded.
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetEcotronBoxDataUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::UPDATE_PACKAGEINFO
    public static readonly UPDATE_PACKAGEINFO: string = 'RWEBDUE_PACKAGEINFO';

    /**
     * Obfuscated in every available tree; the member name is DERIVED from its value.
     */
    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::_SafeStr_10424
    public static readonly UPDATE_CONTENTS: string = 'RWEBDUE_CONTENTS';

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::_text
    private _text: string;

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::_furniTypeName
    private _furniTypeName: string;

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::_SafeStr_4593
    private _controller: boolean;

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::_SafeStr_9190
    private _iconBitmapData: ImageBitmap | null;

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::RoomWidgetEcotronBoxDataUpdateEvent()
    constructor(
        // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::RoomWidgetEcotronBoxDataUpdateEvent() param1
        type: string,
        // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::RoomWidgetEcotronBoxDataUpdateEvent() param2
        objectId: number,
        // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::RoomWidgetEcotronBoxDataUpdateEvent() param3
        text: string,
        // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::RoomWidgetEcotronBoxDataUpdateEvent() param4
        furniTypeName: string,
        // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::RoomWidgetEcotronBoxDataUpdateEvent() param5
        controller: boolean = false,
        // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::RoomWidgetEcotronBoxDataUpdateEvent() param6
        iconBitmapData: ImageBitmap | null = null
    )
    {
        super(type);

        this._objectId = objectId;
        this._text = text;
        this._furniTypeName = furniTypeName;
        this._controller = controller;
        this._iconBitmapData = iconBitmapData;
    }

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::get text()
    public get text(): string
    {
        return this._text;
    }

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::get furniTypeName()
    public get furniTypeName(): string
    {
        return this._furniTypeName;
    }

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::get controller()
    public get controller(): boolean
    {
        return this._controller;
    }

    // AS3: RoomWidgetEcotronBoxDataUpdateEvent.as::get iconBitmapData()
    public get iconBitmapData(): ImageBitmap | null
    {
        return this._iconBitmapData;
    }
}
