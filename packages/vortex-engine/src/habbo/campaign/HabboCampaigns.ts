import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';
import {
    CampaignCalendarDataMessageEvent
} from '@habbo/communication/messages/incoming/campaign/CampaignCalendarDataMessageEvent';
import {
    CampaignCalendarDoorOpenedMessageEvent
} from '@habbo/communication/messages/incoming/campaign/CampaignCalendarDoorOpenedMessageEvent';
import type {
    CampaignCalendarDataMessageParser
} from '@habbo/communication/messages/parser/campaign/CampaignCalendarDataMessageParser';
import type {
    CampaignCalendarDoorOpenedMessageParser
} from '@habbo/communication/messages/parser/campaign/CampaignCalendarDoorOpenedMessageParser';
import type {CampaignCalendarData} from '@habbo/communication/messages/parser/campaign/CampaignCalendarData';
import {
    OpenCampaignCalendarDoorComposer
} from '@habbo/communication/messages/outgoing/campaign/OpenCampaignCalendarDoorComposer';
import {
    OpenCampaignCalendarDoorAsStaffComposer
} from '@habbo/communication/messages/outgoing/campaign/OpenCampaignCalendarDoorAsStaffComposer';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import {CalendarView} from './calendar/CalendarView';

const log = Logger.getLogger('habbo.campaign.HabboCampaigns');

/**
 * Campaign calendar manager
 *
 * Handles campaign calendar data, door opening, and deep-link routing
 * via ILinkEventTracker ("openView/calendar").
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/campaign/HabboCampaigns.as
 */
export class HabboCampaigns extends Component implements ILinkEventTracker
{
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    /**
     * Declared and injected by AS3, read by nothing in the class. Kept so the dependency set
     * matches — dropping it would change what this component waits for at DI time.
     */
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::_catalog
    private _catalog: IHabboCatalog | null = null;

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::_SafeStr_5697 (the calendar view)
    private _calendarView: CalendarView | null = null;

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::_SafeStr_6732 (day awaiting its reply)
    private _lastOpenedDay: number = -1;

    constructor(context: IContext)
    {
        super(context);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/campaign/HabboCampaigns.as::_calendarData
    private _calendarData: CampaignCalendarData | null = null;

    /**
	 * Get the current calendar data
	 */
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::get calendarData()
    get calendarData(): CampaignCalendarData | null
    {
        return this._calendarData;
    }

    /**
	 * ILinkEventTracker - link pattern prefix
	 */
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::get linkPattern()
    get linkPattern(): string
    {
        return 'openView/';
    }

    /**
     * AS3 marks only the communication manager as required (`true`); the other five resolve when
     * they can. That ordering matters here — the window manager attaches after this component, and
     * a hard dependency on an IID nothing provides yet locks the component with no log at all.
     */
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communicationManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) =>
                {
                    this._sessionDataManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizationManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: IHabboCatalog | null) =>
                {
                    this._catalog = catalog;
                }
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (engine: IRoomEngine | null) =>
                {
                    this._roomEngine = engine;
                }
            ),
        ];
    }

    /**
	 * Open a calendar door as a regular user
	 */
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::openPackage()
    openPackage(dayIndex: number): void
    {
        if(!this._calendarData) return;

        this._lastOpenedDay = dayIndex;

        this._communicationManager!.connection!.send(
            new OpenCampaignCalendarDoorComposer(this._calendarData.campaignName, dayIndex)
        );
    }

    /**
	 * Open a calendar door as staff
	 */
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::openPackageAsStaff()
    openPackageAsStaff(dayIndex: number): void
    {
        if(!this._calendarData) return;

        this._lastOpenedDay = dayIndex;

        this._communicationManager!.connection!.send(
            new OpenCampaignCalendarDoorAsStaffComposer(this._calendarData.campaignName, dayIndex)
        );
    }

    /**
	 * ILinkEventTracker - handle received link
	 */
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');
        if(parts.length < 2) return;

        if(parts[1] === 'calendar')
        {
            this.showCalendar();
        }
    }

    /**
	 * The window is built lazily and only once, and only if the server has already told us what
	 * campaign is running — with no data there are no days to lay out.
	 */
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::showCalendar()
    private showCalendar(): void
    {
        if(!this._calendarView && this._calendarData)
        {
            if(!this._windowManager)
            {
                log.warn('Calendar link received before the window manager resolved — nothing shown.');

                return;
            }

            this._calendarView = new CalendarView(this, this._windowManager);
        }
    }

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::hideCalendar()
    hideCalendar(): void
    {
        if(this._calendarView)
        {
            this._calendarView.dispose();
            this._calendarView = null;
        }
    }

    /**
	 * Puts the prize in the cell that was just opened.
	 *
	 * Note where AS3 records the day as opened: inside the `productData != null` branch, not in the
	 * message handler. A prize whose product code the session data manager cannot resolve leaves
	 * the calendar untouched.
	 *
	 * The two image routes are exclusive — a gallery image wins, and only in its absence is the
	 * furniture icon rendered out of the room engine.
	 */
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::showProductNotification()
    private showProductNotification(productCode: string, customImage: string, furnitureClassName: string): void
    {
        const productData = this._sessionDataManager?.getProductData(productCode) ?? null;

        if(productData === null) return;

        this._calendarData?.openedDays.push(this._lastOpenedDay);
        this._lastOpenedDay = -1;

        if(!this._calendarView) return;

        if(customImage && customImage !== '')
        {
            this._calendarView.setReceivedProduct(productData, this.getImageGalleryUrl() + customImage);
        }
        else if(furnitureClassName && furnitureClassName !== '')
        {
            this._calendarView.setReceivedProduct(productData);
            this.requestIconFromRoomEngine(this._calendarView, furnitureClassName);
        }
    }

    /**
	 * Floor item first, wall item as the fallback — the same order the catalog uses to turn a
	 * class name into an icon. An icon already in cache comes back on `result.data`, which is why
	 * AS3 calls `imageReady()` itself rather than waiting for a callback that will never fire.
	 */
    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::requestIconFromRoomEngine()
    private requestIconFromRoomEngine(listener: IGetImageListener, className: string): ImageResult | null
    {
        let result: ImageResult | null = null;

        let furnitureData = this._sessionDataManager?.getFloorItemDataByName(className) ?? null;

        if(furnitureData)
        {
            result = this._roomEngine?.getFurnitureIcon(furnitureData.id, listener) ?? null;
        }
        else
        {
            furnitureData = this._sessionDataManager?.getWallItemDataByName(className) ?? null;

            if(furnitureData)
            {
                result = this._roomEngine?.getWallItemIcon(furnitureData.id, listener) ?? null;
            }
        }

        if(result && result.data)
        {
            listener.imageReady(result.id, result.data);
        }

        return result;
    }

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::getImageGalleryUrl()
    private getImageGalleryUrl(): string
    {
        return this.getProperty('image.library.url');
    }

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::get isAnyRoomController()
    get isAnyRoomController(): boolean
    {
        return this._sessionDataManager?.isAnyRoomController ?? false;
    }

    // AS3: .../src/com/sulake/habbo/campaign/HabboCampaigns.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    dispose(): void
    {
        if(this._disposed) return;

        this.context.removeLinkEventTracker(this);

        this.hideCalendar();

        this._calendarData = null;
        this._communicationManager = null;
        this._sessionDataManager = null;
        this._windowManager = null;
        this._localizationManager = null;
        this._catalog = null;
        this._roomEngine = null;

        super.dispose();
    }

    protected override initComponent(): void
    {
        this._communicationManager!.addMessageEvent(
            new CampaignCalendarDataMessageEvent(this.onCampaignCalendarData.bind(this))
        );
        this._communicationManager!.addMessageEvent(
            new CampaignCalendarDoorOpenedMessageEvent(this.onCampaignCalendarDoorOpened.bind(this))
        );

        this.context.addLinkEventTracker(this);

        log.debug('Campaign manager initialized');
    }

    /**
	 * Handle campaign calendar data from server
	 */
    private onCampaignCalendarData(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as CampaignCalendarDataMessageParser;

        if(!parser) return;

        this._calendarData = parser.cloneData();

        log.trace('Campaign calendar data received:', this._calendarData?.campaignName);
    }

    /**
	 * Handle campaign calendar door opened response
	 */
    private onCampaignCalendarDoorOpened(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as CampaignCalendarDoorOpenedMessageParser;

        if(!parser) return;

        if(parser.doorOpened)
        {
            log.debug('Calendar door opened - product:', parser.productName);

            this.showProductNotification(
                parser.productName, parser.customImage, parser.furnitureClassName
            );
        }
    }
}
