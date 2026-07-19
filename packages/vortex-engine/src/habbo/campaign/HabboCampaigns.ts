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

const log = Logger.getLogger('Campaign');

/**
 * Campaign calendar manager
 *
 * Handles campaign calendar data, door opening, and deep-link routing
 * via ILinkEventTracker ("openView/calendar").
 *
 * @see source_as_win63/habbo/campaign/HabboCampaigns.as
 */
export class HabboCampaigns extends Component implements ILinkEventTracker
{
    private _communicationManager: IHabboCommunicationManager | null = null;
    private _lastOpenedDay: number = -1;

    constructor(context: IContext)
    {
        super(context);
    }

    private _calendarData: CampaignCalendarData | null = null;

    /**
	 * Get the current calendar data
	 */
    get calendarData(): CampaignCalendarData | null
    {
        return this._calendarData;
    }

    /**
	 * ILinkEventTracker - link pattern prefix
	 */
    get linkPattern(): string
    {
        return 'openView/';
    }

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
        ];
    }

    /**
	 * Open a calendar door as a regular user
	 */
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
    linkReceived(link: string): void
    {
        const parts = link.split('/');
        if(parts.length < 2) return;

        if(parts[1] === 'calendar')
        {
            log.debug('Calendar link received');
            // Calendar UI will be handled by SolidJS
        }
    }

    dispose(): void
    {
        if(this._disposed) return;

        this.context.removeLinkEventTracker(this);

        this._calendarData = null;
        this._communicationManager = null;

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

        log.debug('Campaign calendar data received:', this._calendarData?.campaignName);
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

            if(this._calendarData && this._lastOpenedDay >= 0)
            {
                this._calendarData.openedDays.push(this._lastOpenedDay);
                this._lastOpenedDay = -1;
            }
        }
    }
}
