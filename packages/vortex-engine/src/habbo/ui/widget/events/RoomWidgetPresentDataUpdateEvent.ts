import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * RoomWidgetPresentDataUpdateEvent
 *
 * Every step of opening a gift rides on this one event, distinguished by type: the closed
 * card (`RWPDUE_PACKAGEINFO`), then whatever came out — an ordinary item (`RWPDUE_CONTENTS`),
 * a floor/landscape/wallpaper roll, HC time, or a late-arriving icon
 * (`RWPDUE_CONTENTS_IMAGE`) for contents whose image had to be rendered first.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetPresentDataUpdateEvent.as
 */
export class RoomWidgetPresentDataUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::UPDATE_PACKAGEINFO
    public static readonly UPDATE_PACKAGEINFO: string = 'RWPDUE_PACKAGEINFO';

    /** The identifier is obfuscated in every tree (`_SafeStr_10424`); only the value is recovered, and this name is derived from it. */
    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_10424
    public static readonly UPDATE_CONTENTS: string = 'RWPDUE_CONTENTS';

    /** The identifier is obfuscated in every tree (`_SafeStr_10692`); only the value is recovered, and this name is derived from it. */
    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_10692
    public static readonly UPDATE_CONTENTS_CLUB: string = 'RWPDUE_CONTENTS_CLUB';

    /** The identifier is obfuscated in every tree (`_SafeStr_11393`); only the value is recovered, and this name is derived from it. */
    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_11393
    public static readonly UPDATE_CONTENTS_FLOOR: string = 'RWPDUE_CONTENTS_FLOOR';

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::UPDATE_CONTENTS_LANDSCAPE
    public static readonly UPDATE_CONTENTS_LANDSCAPE: string = 'RWPDUE_CONTENTS_LANDSCAPE';

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::UPDATE_CONTENTS_WALLPAPER
    public static readonly UPDATE_CONTENTS_WALLPAPER: string = 'RWPDUE_CONTENTS_WALLPAPER';

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::UPDATE_CONTENTS_IMAGE
    public static readonly UPDATE_CONTENTS_IMAGE: string = 'RWPDUE_CONTENTS_IMAGE';

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::RoomWidgetPresentDataUpdateEvent()
    constructor(
        type: string,
        objectId: number,
        text: string,
        controller: boolean = false,
        iconBitmapData: ImageBitmap | null = null,
        purchaserName: string | null = null,
        purchaserFigure: string | null = null,
        trustedSender: boolean = false
    )
    {
        super(type);

        this._objectId = objectId;
        this._text = text;
        this._controller = controller;
        this._iconBitmapData = iconBitmapData;
        this._purchaserName = purchaserName;
        this._purchaserFigure = purchaserFigure;
        this._trustedSender = trustedSender;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get objectId()
    public get objectId(): number
    {
        return this._objectId;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_5613
    private _classId: number = 0;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get classId()
    public get classId(): number
    {
        return this._classId;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::set classId()
    public set classId(value: number)
    {
        this._classId = value;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_5296
    private _itemType: string = '';

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get itemType()
    public get itemType(): string
    {
        return this._itemType;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::set itemType()
    public set itemType(value: string)
    {
        this._itemType = value;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_text
    private _text: string;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get text()
    public get text(): string
    {
        return this._text;
    }

    /** Whether the viewer may open it — the box's owner, or a room controller. */
    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_4593
    private _controller: boolean;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get controller()
    public get controller(): boolean
    {
        return this._controller;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_9190
    private _iconBitmapData: ImageBitmap | null;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get iconBitmapData()
    public get iconBitmapData(): ImageBitmap | null
    {
        return this._iconBitmapData;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_purchaserName
    private _purchaserName: string | null;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get purchaserName()
    public get purchaserName(): string | null
    {
        return this._purchaserName;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_9478
    private _purchaserFigure: string | null;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get purchaserFigure()
    public get purchaserFigure(): string | null
    {
        return this._purchaserFigure;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_4731
    private _placedItemId: number = -1;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get placedItemId()
    public get placedItemId(): number
    {
        return this._placedItemId;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::set placedItemId()
    public set placedItemId(value: number)
    {
        this._placedItemId = value;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_placedInRoom
    private _placedInRoom: boolean = false;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get placedInRoom()
    public get placedInRoom(): boolean
    {
        return this._placedInRoom;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::set placedInRoom()
    public set placedInRoom(value: boolean)
    {
        this._placedInRoom = value;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_5481
    private _placedItemType: string = '';

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get placedItemType()
    public get placedItemType(): string
    {
        return this._placedItemType;
    }

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::set placedItemType()
    public set placedItemType(value: string)
    {
        this._placedItemType = value;
    }

    /** Set from the furni's `furniture_trusted_sender` model variable; the card shows the sender only when true. */
    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::_SafeStr_7084
    private _trustedSender: boolean;

    // AS3: .../events/RoomWidgetPresentDataUpdateEvent.as::get trustedSender()
    public get trustedSender(): boolean
    {
        return this._trustedSender;
    }
}
