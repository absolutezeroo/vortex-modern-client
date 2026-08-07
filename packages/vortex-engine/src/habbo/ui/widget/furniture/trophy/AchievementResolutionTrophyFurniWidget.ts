import type EventEmitter from 'eventemitter3';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IRoomWidgetHandler} from '../../../IRoomWidgetHandler';
import {RoomWidgetBase} from '../../RoomWidgetBase';
import {RoomWidgetAchievementResolutionTrophyDataUpdateEvent} from '../../events/RoomWidgetAchievementResolutionTrophyDataUpdateEvent';
import type {ITrophyFurniWidget} from './ITrophyFurniWidget';
import type {ITrophyView} from './ITrophyView';
import {TrophyTheme} from './TrophyTheme';
import {TrophyView} from './TrophyView';

/**
 * The trophy shown for an achievement resolution and for a badge-display furni — one widget, two
 * callers, distinguished only by the data the handler puts in the event.
 *
 * It reuses `TrophyView` wholesale; everything that makes a badge display look different from a
 * plain trophy is carried in the four optional fields of the update event.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/trophy/AchievementResolutionTrophyFurniWidget.as
 */
export class AchievementResolutionTrophyFurniWidget extends RoomWidgetBase implements ITrophyFurniWidget
{
    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::DEFAULT_BACKGROUND_COLOR
    // Name DERIVED: AS3 writes 16777215 (white) inline, both as the initial value and as the
    // fallback when the event carries 0.
    private static readonly DEFAULT_BACKGROUND_COLOR: number = 16777215;

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_name
    private _name: string = '';

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_date
    private _date: string = '';

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_message
    private _message: string = '';

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_frameTitle
    private _frameTitle: string = '';

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_headerColor
    private _headerColor: number = TrophyTheme.getHeaderColor(TrophyTheme.GOLD);

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_backgroundTheme
    private _backgroundTheme: number = TrophyTheme.GOLD;

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_backgroundColor
    private _backgroundColor: number = AchievementResolutionTrophyFurniWidget.DEFAULT_BACKGROUND_COLOR;

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_configuration
    private _configuration: IHabboConfigurationManager | null;

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_view
    private _view: ITrophyView | null = null;

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::_viewType
    // Assigned from the event and read exactly once, into a local that is then unused — see
    // `updateInterface()`.
    private _viewType: number = 0;

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::AchievementResolutionTrophyFurniWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        configuration: IHabboConfigurationManager | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._configuration = configuration;
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::get date()
    get date(): string
    {
        return this._date;
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::get message()
    get message(): string
    {
        return this._message;
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::get color()
    // Returns the *background* colour, not the `color` field the event carries — `color` there is
    // only ever used to derive the theme.
    get color(): number
    {
        return this._backgroundColor;
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::get frameTitle()
    get frameTitle(): string
    {
        return this._frameTitle;
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::get headerColor()
    get headerColor(): number
    {
        return this._headerColor;
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::get backgroundTheme()
    get backgroundTheme(): number
    {
        return this._backgroundTheme;
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::get configuration()
    get configuration(): IHabboConfigurationManager | null
    {
        return this._configuration;
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::registerUpdateEvents()
    override registerUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.on(RoomWidgetAchievementResolutionTrophyDataUpdateEvent.UPDATE_TROPHY_DATA, this.onObjectUpdate);

        super.registerUpdateEvents(events);
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::unregisterUpdateEvents()
    // No super call, as in AS3.
    override unregisterUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.off(RoomWidgetAchievementResolutionTrophyDataUpdateEvent.UPDATE_TROPHY_DATA, this.onObjectUpdate);
    }

    // AS3: .../furniture/trophy/AchievementResolutionTrophyFurniWidget.as::dispose()
    override dispose(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        this._configuration = null;

        super.dispose();
    }

    /**
     * Each of the four optional fields falls back when the event leaves it at its sentinel: an
     * unset `backgroundTheme` (-1) derives from `color - 1`, an empty frame title becomes the
     * generic "Trophy", a zero header colour comes from the theme, and a zero background becomes
     * white.
     *
     * That is how one event serves both callers — the achievement-resolution path sends only the
     * first four fields and gets a plain gold trophy out of it.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/trophy/AchievementResolutionTrophyFurniWidget.as::onObjectUpdate()
    private onObjectUpdate = (event: RoomWidgetAchievementResolutionTrophyDataUpdateEvent): void =>
    {
        this._name = event.name;
        this._date = event.date;
        this._message = event.message;
        this._viewType = event.viewType;

        this._backgroundTheme = TrophyTheme.normalize(
            event.backgroundTheme >= 0 ? event.backgroundTheme : Math.trunc(event.color) - 1
        );

        this._frameTitle = event.frameTitle !== ''
            ? event.frameTitle
            : (this.localizations?.getLocalization('widget.furni.trophy.title', 'Trophy') ?? 'Trophy');

        this._headerColor = event.headerColor !== 0
            ? event.headerColor
            : TrophyTheme.getHeaderColor(this._backgroundTheme);

        this._backgroundColor = event.backgroundColor !== 0
            ? event.backgroundColor
            : AchievementResolutionTrophyFurniWidget.DEFAULT_BACKGROUND_COLOR;

        this.updateInterface();
    };

    /**
     * AS3 reads `_viewType` into a local here and then never uses it — the view is always a
     * `TrophyView`. Kept as a read so the field is not dead, and so the intent (a second view
     * type that was never built) stays visible.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/trophy/AchievementResolutionTrophyFurniWidget.as::updateInterface()
    private updateInterface(): void
    {
        if(this._view !== null) this._view.dispose();

        void this._viewType;

        this._view = new TrophyView(this);
        this._view.showInterface();
    }
}
