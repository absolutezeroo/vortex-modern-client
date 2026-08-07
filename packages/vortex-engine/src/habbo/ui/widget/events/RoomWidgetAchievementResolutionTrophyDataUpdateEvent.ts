import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * Everything an achievement-resolution or badge-display trophy needs to draw itself.
 *
 * The first four fields are the trophy proper; the last four are the badge-display extension,
 * defaulted so the achievement-resolution path can leave them out and get the plain gold trophy.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as
 */
export class RoomWidgetAchievementResolutionTrophyDataUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::UPDATE_TROPHY_DATA
    public static readonly UPDATE_TROPHY_DATA: string = 'RWARTDUE_TROPHY_DATA';

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::_color
    private _color: number;

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::_name
    private _name: string;

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::_date
    private _date: string;

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::_message
    private _message: string;

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::_viewType
    // Read by the widget and then discarded — see AchievementResolutionTrophyFurniWidget.
    private _viewType: number;

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::_frameTitle
    private _frameTitle: string;

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::_headerColor
    private _headerColor: number;

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::_backgroundTheme
    // -1 means "not set", which makes the widget fall back to `color - 1`.
    private _backgroundTheme: number;

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::_backgroundColor
    private _backgroundColor: number;

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::RoomWidgetAchievementResolutionTrophyDataUpdateEvent()
    constructor(
        type: string,
        color: number,
        name: string,
        date: string,
        message: string,
        viewType: number,
        frameTitle: string = '',
        headerColor: number = 0,
        backgroundTheme: number = -1,
        backgroundColor: number = 0
    )
    {
        super(type);

        this._color = color;
        this._name = name;
        this._date = date;
        this._message = message;
        this._viewType = viewType;
        this._frameTitle = frameTitle;
        this._headerColor = headerColor;
        this._backgroundTheme = backgroundTheme;
        this._backgroundColor = backgroundColor;
    }

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::get color()
    get color(): number
    {
        return this._color;
    }

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::get date()
    get date(): string
    {
        return this._date;
    }

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::get message()
    get message(): string
    {
        return this._message;
    }

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::get viewType()
    get viewType(): number
    {
        return this._viewType;
    }

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::get frameTitle()
    get frameTitle(): string
    {
        return this._frameTitle;
    }

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::get headerColor()
    get headerColor(): number
    {
        return this._headerColor;
    }

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::get backgroundTheme()
    get backgroundTheme(): number
    {
        return this._backgroundTheme;
    }

    // AS3: .../widget/events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent.as::get backgroundColor()
    get backgroundColor(): number
    {
        return this._backgroundColor;
    }
}
