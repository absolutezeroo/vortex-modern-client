import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomHandlerListener} from '../IRoomHandlerListener';
import {BaseHandler} from './BaseHandler';

// Message events
import {PollContentsEvent} from '../../communication/messages/incoming/poll/PollContentsEvent';
import {PollOfferEvent} from '../../communication/messages/incoming/poll/PollOfferEvent';
import {PollErrorEvent} from '../../communication/messages/incoming/poll/PollErrorEvent';

// Parsers
import type {PollContentsEventParser} from '../../communication/messages/parser/poll/PollContentsEventParser';
import type {PollOfferEventParser} from '../../communication/messages/parser/poll/PollOfferEventParser';

// Events
import {RoomSessionPollEvent} from '../events/RoomSessionPollEvent';

/**
 * Poll handler
 *
 * Handles poll offer, error and content events and dispatches RoomSessionPollEvent.
 *
 * @see source_as_win63/habbo/session/handler/PollHandler.as
 */
export class PollHandler extends BaseHandler
{
    private _messageEvents: IMessageEvent[] = [];

    constructor(connection: IConnection | null, listener: IRoomHandlerListener)
    {
        super(connection, listener);

        if(connection === null)
        {
            return;
        }

        this.addMessageEvent(connection, new PollContentsEvent(this.onPollContentsEvent.bind(this)));
        this.addMessageEvent(connection, new PollOfferEvent(this.onPollOfferEvent.bind(this)));
        this.addMessageEvent(connection, new PollErrorEvent(this.onPollErrorEvent.bind(this)));
    }

    override dispose(): void
    {
        if(this.connection)
        {
            for(const event of this._messageEvents)
            {
                this.connection.removeMessageEvent(event);
            }
        }
        this._messageEvents = [];

        super.dispose();
    }

    private addMessageEvent(connection: IConnection, event: IMessageEvent): void
    {
        connection.addMessageEvent(event);
        this._messageEvents.push(event);
    }

    private onPollOfferEvent(event: IMessageEvent): void
    {
        if(!event) return;

        const session = this.listener.getSession(this.roomId);
        if(session === null) return;

        const parser = (event as PollOfferEvent).parser as PollOfferEventParser;

        const pollEvent = new RoomSessionPollEvent(RoomSessionPollEvent.OFFER, session, parser.id);
        pollEvent.headline = parser.headline;
        pollEvent.summary = parser.summary;

        this.listener.sessionEvents.emit(RoomSessionPollEvent.OFFER, pollEvent);
    }

    private onPollErrorEvent(event: IMessageEvent): void
    {
        if(!event) return;

        const session = this.listener.getSession(this.roomId);
        if(session === null) return;

        const pollEvent = new RoomSessionPollEvent(RoomSessionPollEvent.ERROR, session, -1);
        pollEvent.headline = '???';
        pollEvent.summary = '???';

        this.listener.sessionEvents.emit(RoomSessionPollEvent.ERROR, pollEvent);
    }

    private onPollContentsEvent(event: IMessageEvent): void
    {
        if(!event) return;

        const session = this.listener.getSession(this.roomId);
        if(session === null) return;

        const parser = (event as PollContentsEvent).parser as PollContentsEventParser;

        const pollEvent = new RoomSessionPollEvent(RoomSessionPollEvent.CONTENT, session, parser.id);
        pollEvent.startMessage = parser.startMessage;
        pollEvent.endMessage = parser.endMessage;
        pollEvent.numQuestions = parser.numQuestions;
        pollEvent.questionArray = parser.questionArray;
        pollEvent.npsPoll = parser.npsPoll;

        this.listener.sessionEvents.emit(RoomSessionPollEvent.CONTENT, pollEvent);
    }
}
