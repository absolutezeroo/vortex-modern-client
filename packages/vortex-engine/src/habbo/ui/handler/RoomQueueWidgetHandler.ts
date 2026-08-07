import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import {RoomWidgetRoomQueueMessage} from '../widget/messages/RoomWidgetRoomQueueMessage';
import {RoomWidgetRoomQueueUpdateEvent} from '../widget/events/RoomWidgetRoomQueueUpdateEvent';
import {RoomSessionQueueEvent} from '@habbo/session/events/RoomSessionQueueEvent';

/**
 * Turns the session's queue status into the widget's, and the widget's buttons into session calls.
 *
 * The interesting part is the position: the server reports a queue *size*, and the handler adds
 * one to it — you are the next one after everybody already waiting.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/RoomQueueWidgetHandler.as
 */
export class RoomQueueWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../RoomQueueWidgetHandler.as::QUEUE_TYPE_CLUB
    // Name DERIVED: AS3 writes the two single-letter queue ids inline. "c" is the club queue,
    // "d" the default one — `RoomSessionQueueEvent.QUEUE_TYPE_NORMAL` already carries the latter.
    private static readonly QUEUE_TYPE_CLUB: string = 'c';

    // AS3: .../RoomQueueWidgetHandler.as::TARGET_SPECTATOR
    // Name DERIVED: AS3 switches on `queueSetTarget - 1`, so 1 is the spectator queue and 2 the
    // visitor one; the same two numbers go back to `changeQueue()`.
    private static readonly TARGET_SPECTATOR: number = 1;

    // AS3: .../RoomQueueWidgetHandler.as::TARGET_VISITOR
    private static readonly TARGET_VISITOR: number = 2;

    private _disposed: boolean = false;

    // AS3: .../RoomQueueWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../RoomQueueWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../RoomQueueWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_ROOM_QUEUE';
    }

    // AS3: .../RoomQueueWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../RoomQueueWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[]
    {
        return [
            RoomWidgetRoomQueueMessage.EXIT_QUEUE,
            RoomWidgetRoomQueueMessage.CHANGE_TO_SPECTATOR_QUEUE,
            RoomWidgetRoomQueueMessage.CHANGE_TO_VISITOR_QUEUE,
            RoomWidgetRoomQueueMessage.CLUB_LINK
        ];
    }

    /**
     * AS3: .../RoomQueueWidgetHandler.as::processWidgetMessage()
     *
     * Leaving the queue is `roomSession.quit()` — the same call as leaving a room, because a
     * queued visitor is already in a session.
     */
    processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(this._container === null || this._container.roomSession === null) return null;

        // AS3 casts first and bails when the message is not one of its own, before the switch.
        if(!(message instanceof RoomWidgetRoomQueueMessage)) return null;

        switch(message.type)
        {
            case RoomWidgetRoomQueueMessage.EXIT_QUEUE:
                this._container.roomSession.quit();
                break;

            case RoomWidgetRoomQueueMessage.CHANGE_TO_SPECTATOR_QUEUE:
                this._container.roomSession.changeQueue(RoomQueueWidgetHandler.TARGET_SPECTATOR);
                break;

            case RoomWidgetRoomQueueMessage.CHANGE_TO_VISITOR_QUEUE:
                this._container.roomSession.changeQueue(RoomQueueWidgetHandler.TARGET_VISITOR);
                break;

            case RoomWidgetRoomQueueMessage.CLUB_LINK:
                this._container.catalog?.openClubCenter();
                break;
        }

        return null;
    }

    // AS3: .../RoomQueueWidgetHandler.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [RoomSessionQueueEvent.QUEUE_STATUS];
    }

    /**
     * AS3: .../RoomQueueWidgetHandler.as::processEvent()
     *
     * Which queue's size counts depends on club membership: with more than one queue open, a club
     * member waits in the "c" queue and everyone else in "d". The `isClubQueue` flag that comes
     * out of this is what switches the window's caption to its `.hc` variant.
     *
     * A `queueSetTarget` outside 1-2 produces no event at all — AS3 leaves the status string null
     * and returns.
     */
    processEvent(event: RoomSessionQueueEvent): void
    {
        if(this._container === null) return;

        if(event.type !== RoomSessionQueueEvent.QUEUE_STATUS) return;

        let statusType: string | null = null;

        if(event.queueSetTarget === RoomQueueWidgetHandler.TARGET_SPECTATOR)
        {
            statusType = RoomWidgetRoomQueueUpdateEvent.SPECTATOR_QUEUE_STATUS;
        }
        else if(event.queueSetTarget === RoomQueueWidgetHandler.TARGET_VISITOR)
        {
            statusType = RoomWidgetRoomQueueUpdateEvent.VISITOR_QUEUE_STATUS;
        }

        if(statusType === null) return;

        // AS3 defaults to true and only asks the inventory when there is one — no inventory means
        // the club upsell stays hidden rather than being shown to everyone.
        let hasHabboClub = true;

        if(this._container.inventory !== null) hasHabboClub = this._container.inventory.clubDays > 0;

        const queueTypes = event.queueTypes;
        let isClubQueue = false;
        let position: number;

        if(queueTypes.length > 1)
        {
            if(hasHabboClub && queueTypes.indexOf(RoomQueueWidgetHandler.QUEUE_TYPE_CLUB) !== -1)
            {
                position = event.getQueueSize(RoomQueueWidgetHandler.QUEUE_TYPE_CLUB) + 1;
                isClubQueue = true;
            }
            else
            {
                position = event.getQueueSize(RoomSessionQueueEvent.QUEUE_TYPE_NORMAL) + 1;
            }
        }
        else
        {
            position = event.getQueueSize(queueTypes[0]) + 1;
        }

        this._container.desktopEvents.emit(
            statusType,
            new RoomWidgetRoomQueueUpdateEvent(statusType, position, hasHabboClub, event.isActive, isClubQueue)
        );
    }

    // AS3: .../RoomQueueWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../RoomQueueWidgetHandler.as::dispose()
    dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}
