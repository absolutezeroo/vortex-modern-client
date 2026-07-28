/**
 * TrophyFurniWidget
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/trophy/TrophyFurniWidget.as
 *
 * Holds one trophy's engraving and owns the view that renders it. The widget itself never
 * touches a window: it stores what FurnitureTrophyWidgetHandler decoded out of the room
 * object's model and hands it to whichever ITrophyView the view type selects.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetTrophyDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetTrophyDataUpdateEvent';
import type {ITrophyFurniWidget} from './ITrophyFurniWidget';
import type {ITrophyView} from './ITrophyView';
import {NikoTrophyView} from './NikoTrophyView';
import {TrophyTheme} from './TrophyTheme';
import {TrophyView} from './TrophyView';

export class TrophyFurniWidget extends RoomWidgetBase implements ITrophyFurniWidget
{
    // AS3: TrophyFurniWidget.as::VIEW_NIKO_SILVER
    public static readonly VIEW_NIKO_SILVER: number = 10;

    // AS3: TrophyFurniWidget.as::VIEW_NIKO_GOLD
    public static readonly VIEW_NIKO_GOLD: number = 20;

    private _name: string = '';
    private _date: string = '';
    private _message: string = '';
    private _backgroundTheme: number = 0;
    private _configuration: IHabboConfigurationManager | null;
    private _view: ITrophyView | null = null;
    private _viewType: number = 0;

    // AS3: TrophyFurniWidget.as::TrophyFurniWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null,
        configuration: IHabboConfigurationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._configuration = configuration;
    }

    // AS3: TrophyFurniWidget.as::get name()
    public get name(): string
    {
        return this._name;
    }

    // AS3: TrophyFurniWidget.as::get date()
    public get date(): string
    {
        return this._date;
    }

    // AS3: TrophyFurniWidget.as::get message()
    public get message(): string
    {
        return this._message;
    }

    /**
     * AS3: TrophyFurniWidget.as::get color()
     *
     * AS3 really does return the constant white tint and ignore the event's `color`, which
     * carries the *theme* instead (see onObjectUpdate). Not a stub.
     */
    public get color(): number
    {
        return TrophyTheme.DEFAULT_BACKGROUND_TINT;
    }

    // AS3: TrophyFurniWidget.as::get frameTitle()
    public get frameTitle(): string
    {
        return this.localizations?.getLocalization('widget.furni.trophy.title', 'Trophy') ?? 'Trophy';
    }

    // AS3: TrophyFurniWidget.as::get headerColor()
    public get headerColor(): number
    {
        return TrophyTheme.getHeaderColor(this._backgroundTheme);
    }

    // AS3: TrophyFurniWidget.as::get backgroundTheme()
    public get backgroundTheme(): number
    {
        return this._backgroundTheme;
    }

    // AS3: TrophyFurniWidget.as::get configuration()
    public get configuration(): IHabboConfigurationManager | null
    {
        return this._configuration;
    }

    // AS3: TrophyFurniWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.on(RoomWidgetTrophyDataUpdateEvent.UPDATE_TROPHY_DATA, this.onObjectUpdate, this);

        super.registerUpdateEvents(dispatcher);
    }

    // AS3: TrophyFurniWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(!dispatcher) return;

        dispatcher.off(RoomWidgetTrophyDataUpdateEvent.UPDATE_TROPHY_DATA, this.onObjectUpdate, this);
    }

    /**
     * AS3: TrophyFurniWidget.as::onObjectUpdate()
     *
     * The event's `color` is the raw `furniture_color`, which is 1-based: AS3 subtracts one
     * before normalizing, so colour 1 is gold.
     */
    private onObjectUpdate(event: RoomWidgetTrophyDataUpdateEvent): void
    {
        this._name = event.name;
        this._date = event.date;
        this._message = event.message;
        this._backgroundTheme = TrophyTheme.normalize(event.color - 1);
        this._viewType = event.viewType;

        this.updateInterface();
    }

    /**
     * AS3: TrophyFurniWidget.as::updateInterface()
     *
     * AS3 disposes the previous view but does *not* null the field before overwriting it, and
     * switches on `viewType - 10` so that only 10 (silver) and 20 (gold) reach NikoTrophyView.
     */
    private updateInterface(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
        }

        switch(this._viewType - 10)
        {
            case 0:
            case 10:
                this._view = new NikoTrophyView(this, this._viewType);
                break;
            default:
                this._view = new TrophyView(this);
        }

        this._view.showInterface();
    }

    // AS3: TrophyFurniWidget.as::dispose()
    public override dispose(): void
    {
        if(this.disposed) return;

        if(this._view)
        {
            this._view.dispose();
            this._view = null;
        }

        this._configuration = null;

        super.dispose();
    }
}
