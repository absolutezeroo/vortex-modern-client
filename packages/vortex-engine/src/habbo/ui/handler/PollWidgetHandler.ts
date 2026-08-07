import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import {RoomWidgetPollMessage} from '../widget/messages/RoomWidgetPollMessage';
import {RoomWidgetPollUpdateEvent} from '../widget/events/RoomWidgetPollUpdateEvent';
import {RoomSessionPollEvent} from '@habbo/session/events/RoomSessionPollEvent';

/**
 * Both directions of a poll: the session's three events out to the widget, and the widget's
 * three buttons back to the server.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/PollWidgetHandler.as
 */
export class PollWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/PollWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/PollWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/PollWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/PollWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_ROOM_POLL';
    }

    // AS3: .../handler/PollWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/PollWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[]
    {
        return [RoomWidgetPollMessage.ANSWER, RoomWidgetPollMessage.REJECT, RoomWidgetPollMessage.START];
    }

    /**
     * AS3: .../handler/PollWidgetHandler.as::processWidgetMessage()
     *
     * The cast is checked first, which matters here: `UiHelpBubbleWidgetHandler` registers the
     * same `RWPM_ANSWER` type with a different message class, and both handlers are called for
     * it. Each is disambiguated only by the cast failing.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/PollWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(!(message instanceof RoomWidgetPollMessage)) return null;

        const session = this._container?.roomSession ?? null;

        if(session === null) return null;

        switch(message.type)
        {
            case RoomWidgetPollMessage.START:
                session.sendPollStartMessage(message.id);
                break;

            case RoomWidgetPollMessage.REJECT:
                session.sendPollRejectMessage(message.id);
                break;

            case RoomWidgetPollMessage.ANSWER:
                session.sendPollAnswerMessage(message.id, message.questionId, message.answers ?? []);
                break;
        }

        return null;
    }

    // AS3: .../handler/PollWidgetHandler.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [RoomSessionPollEvent.OFFER, RoomSessionPollEvent.ERROR, RoomSessionPollEvent.CONTENT];
    }

    /**
     * AS3: .../handler/PollWidgetHandler.as::processEvent()
     *
     * Offer and error carry the same two strings and differ only in type; content carries the
     * questions. Nothing is dispatched for any other type — the event stays null and returns.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/PollWidgetHandler.as::processEvent()
    processEvent(event: RoomSessionPollEvent): void
    {
        if(this._container === null) return;

        if(!(event instanceof RoomSessionPollEvent)) return;

        let update: RoomWidgetPollUpdateEvent | null = null;

        switch(event.type)
        {
            case RoomSessionPollEvent.OFFER:
                update = new RoomWidgetPollUpdateEvent(event.id, RoomWidgetPollUpdateEvent.OFFER);
                update.summary = event.summary;
                update.headline = event.headline;
                break;

            case RoomSessionPollEvent.ERROR:
                update = new RoomWidgetPollUpdateEvent(event.id, RoomWidgetPollUpdateEvent.ERROR);
                update.summary = event.summary;
                update.headline = event.headline;
                break;

            case RoomSessionPollEvent.CONTENT:
                update = new RoomWidgetPollUpdateEvent(event.id, RoomWidgetPollUpdateEvent.CONTENT);
                update.startMessage = event.startMessage;
                update.endMessage = event.endMessage;
                update.numQuestions = event.numQuestions;
                update.questionArray = event.questionArray as RoomWidgetPollUpdateEvent['questionArray'];
                update.npsPoll = event.npsPoll;
                break;
        }

        if(update === null) return;

        this._container.desktopEvents.emit(update.type, update);
    }

    // AS3: .../handler/PollWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../handler/PollWidgetHandler.as::dispose()
    dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}
