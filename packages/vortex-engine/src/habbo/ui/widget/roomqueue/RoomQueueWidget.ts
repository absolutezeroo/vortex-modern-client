import type EventEmitter from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import {Logger} from '@core/utils/Logger';
import type {IRoomWidgetHandler} from '../../IRoomWidgetHandler';
import {RoomWidgetBase} from '../RoomWidgetBase';
import {RoomWidgetRoomQueueUpdateEvent} from '../events/RoomWidgetRoomQueueUpdateEvent';
import {RoomWidgetRoomQueueMessage} from '../messages/RoomWidgetRoomQueueMessage';

const log = Logger.getLogger('habbo.ui.widget.roomqueue.RoomQueueWidget');

/**
 * The "you are Nth in line" window shown while waiting to get into a full room.
 *
 * Both leaving the queue and switching queues **destroy the window** rather than hiding it — the
 * next status update rebuilds it. That is what makes the widget stateless between visits.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/roomqueue/RoomQueueWidget.as
 */
export class RoomQueueWidget extends RoomWidgetBase
{
    // AS3: .../RoomQueueWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../RoomQueueWidget.as::_config
    // Held and read by nothing, in AS3 too — kept so the constructor's shape matches.
    private _config: IHabboConfigurationManager | null;

    // AS3: .../RoomQueueWidget.as::_position
    private _position: number = 0;

    // AS3: .../RoomQueueWidget.as::_hasHabboClub
    private _hasHabboClub: boolean = false;

    // AS3: .../RoomQueueWidget.as::_queueType
    // Name DERIVED (`_SafeStr_8419`): the last *active* status type, which decides both the
    // caption and which queue the change button switches to.
    private _queueType: string = '';

    // AS3: .../RoomQueueWidget.as::_isClubQueue
    private _isClubQueue: boolean = false;

    // AS3: .../RoomQueueWidget.as::RoomQueueWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null = null,
        localizations: IHabboLocalizationManager | null = null,
        config: IHabboConfigurationManager | null = null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._config = config;
    }

    // AS3: .../RoomQueueWidget.as::get mainWindow()
    // AS3 does not override `mainWindow` here — the queue window is its own top-level frame and
    // the desktop never reparents it.
    override get mainWindow(): IWindow | null
    {
        return this._window;
    }

    // AS3: .../RoomQueueWidget.as::registerUpdateEvents()
    override registerUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.on(RoomWidgetRoomQueueUpdateEvent.VISITOR_QUEUE_STATUS, this.onQueueStatus);
        events.on(RoomWidgetRoomQueueUpdateEvent.SPECTATOR_QUEUE_STATUS, this.onQueueStatus);

        super.registerUpdateEvents(events);
    }

    // AS3: .../RoomQueueWidget.as::unregisterUpdateEvents()
    // No super call here either, as in AS3.
    override unregisterUpdateEvents(events: EventEmitter | null): void
    {
        if(events === null) return;

        events.off(RoomWidgetRoomQueueUpdateEvent.VISITOR_QUEUE_STATUS, this.onQueueStatus);
        events.off(RoomWidgetRoomQueueUpdateEvent.SPECTATOR_QUEUE_STATUS, this.onQueueStatus);
    }

    // AS3: .../RoomQueueWidget.as::dispose()
    override dispose(): void
    {
        this.removeWindow();
        this._config = null;

        super.dispose();
    }

    /**
     * AS3: .../RoomQueueWidget.as::onQueueStatus()
     *
     * Only an **active** status updates the position and the queue type; an inactive one still
     * refreshes the club flags and redraws. All four localisation keys are registered every time,
     * not just the one about to be shown, because the caption is chosen after.
     */
    private onQueueStatus = (event: RoomWidgetRoomQueueUpdateEvent): void =>
    {
        if(event === null || event === undefined) return;

        if(event.isActive)
        {
            this._queueType = event.type;
            this._position = event.position;
        }

        this._hasHabboClub = event.hasHabboClub;
        this._isClubQueue = event.isClubQueue;

        const position = this._position.toString();

        for(const key of [
            'room.queue.position',
            'room.queue.position.hc',
            'room.queue.spectator.position',
            'room.queue.spectator.position.hc'
        ])
        {
            this.localizations?.registerParameter(key, 'position', position);
        }

        this.showInterface();
    };

    // AS3: .../RoomQueueWidget.as::createWindow()
    private createWindow(): boolean
    {
        if(this._window !== null) return true;

        this._window = this.windowManager.buildWidgetLayout('room_queue') as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            log.warn('room_queue did not build — the queue position cannot be shown');
            this._window = null;

            return false;
        }

        this._window.visible = false;

        const close = this._window.findChildByTag('close');

        if(close !== null) close.addEventListener('WME_CLICK', this.exitQueue);

        const cancel = this._window.findChildByName('cancel_button');

        if(cancel !== null) cancel.addEventListener('WME_CLICK', this.exitQueue);

        const link = this._window.findChildByName('link_text');

        if(link !== null) link.addEventListener('WME_CLICK', this.openLink);

        const change = this._window.findChildByName('change_button');

        if(change !== null) change.addEventListener('WME_CLICK', this.changeQueue);

        return true;
    }

    /**
     * AS3: .../RoomQueueWidget.as::showInterface()
     *
     * The club half of the window is shown to people who do **not** have Habbo Club — it is the
     * upsell, so the flag is inverted.
     */
    private showInterface(): void
    {
        if(!this.createWindow() || this._window === null) return;

        const infoText = this._window.findChildByName('info_text') as ITextWindow | null;

        if(infoText !== null)
        {
            if(this._queueType === RoomWidgetRoomQueueUpdateEvent.VISITOR_QUEUE_STATUS)
            {
                infoText.caption = this._isClubQueue ? '${room.queue.position.hc}' : '${room.queue.position}';
            }
            else if(this._queueType === RoomWidgetRoomQueueUpdateEvent.SPECTATOR_QUEUE_STATUS)
            {
                infoText.caption = this._isClubQueue
                    ? '${room.queue.spectator.position.hc}'
                    : '${room.queue.spectator.position}';
            }
        }

        const clubContainer = this._window.findChildByName('club_container');

        if(clubContainer !== null) clubContainer.visible = !this._hasHabboClub;

        this._window.visible = true;
    }

    // AS3: .../RoomQueueWidget.as::removeWindow()
    private removeWindow(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // AS3: .../RoomQueueWidget.as::exitQueue()
    private exitQueue = (): void =>
    {
        if(this.messageListener === null) return;

        this.messageListener.processWidgetMessage(
            new RoomWidgetRoomQueueMessage(RoomWidgetRoomQueueMessage.EXIT_QUEUE)
        );
        this.removeWindow();
    };

    // AS3: .../RoomQueueWidget.as::openLink()
    // The only one of the three with no null guard on the listener, in AS3 too.
    private openLink = (): void =>
    {
        this.messageListener?.processWidgetMessage(
            new RoomWidgetRoomQueueMessage(RoomWidgetRoomQueueMessage.CLUB_LINK)
        );
    };

    // AS3: .../RoomQueueWidget.as::changeQueue()
    // Switches to whichever queue you are not in, and closes — the answer arrives as a new status.
    private changeQueue = (): void =>
    {
        if(this.messageListener === null) return;

        const type = this._queueType === RoomWidgetRoomQueueUpdateEvent.VISITOR_QUEUE_STATUS
            ? RoomWidgetRoomQueueMessage.CHANGE_TO_SPECTATOR_QUEUE
            : RoomWidgetRoomQueueMessage.CHANGE_TO_VISITOR_QUEUE;

        this.messageListener.processWidgetMessage(new RoomWidgetRoomQueueMessage(type));
        this.removeWindow();
    };
}
