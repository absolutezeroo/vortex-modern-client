import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomHandlerListener} from '../IRoomHandlerListener';
import {BaseHandler} from './BaseHandler';

// Message events
import {QuestionEvent} from '../../communication/messages/incoming/poll/QuestionEvent';
import {QuestionAnsweredEvent} from '../../communication/messages/incoming/poll/QuestionAnsweredEvent';
import {QuestionFinishedEvent} from '../../communication/messages/incoming/poll/QuestionFinishedEvent';

// Parsers
import type {QuestionEventParser} from '../../communication/messages/parser/poll/QuestionEventParser';
import type {QuestionAnsweredEventParser} from '../../communication/messages/parser/poll/QuestionAnsweredEventParser';
import type {QuestionFinishedEventParser} from '../../communication/messages/parser/poll/QuestionFinishedEventParser';

// Events
import {RoomSessionWordQuizEvent} from '../events/RoomSessionWordQuizEvent';

/**
 * Word quiz handler
 *
 * Handles word quiz question events and dispatches RoomSessionWordQuizEvent.
 *
 * @see source_as_win63/habbo/session/handler/WordQuizHandler.as
 */
export class WordQuizHandler extends BaseHandler
{
	private _messageEvents: IMessageEvent[] = [];

	constructor(connection: IConnection | null, listener: IRoomHandlerListener)
	{
		super(connection, listener);

		if (connection === null)
		{
			return;
		}

		this.addMessageEvent(connection, new QuestionEvent(this.onQuestionStatus.bind(this)));
		this.addMessageEvent(connection, new QuestionAnsweredEvent(this.onQuestionAnsweredEvent.bind(this)));
		this.addMessageEvent(connection, new QuestionFinishedEvent(this.onQuestionFinishedEvent.bind(this)));
	}

	override dispose(): void
	{
		if (this.connection)
		{
			for (const event of this._messageEvents)
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

	private onQuestionStatus(event: IMessageEvent): void
	{
		if (!event) return;

		const session = this.listener.getSession(this.roomId);
		if (session === null) return;

		const parser = (event as QuestionEvent).parser as QuestionEventParser;

		const quizEvent = new RoomSessionWordQuizEvent(
			RoomSessionWordQuizEvent.RWPUW_NEW_QUESTION,
			session,
			parser.pollId
		);
		quizEvent.question = parser.question;
		quizEvent.duration = parser.duration;
		quizEvent.pollType = parser.pollType;
		quizEvent.questionId = parser.questionId;
		quizEvent.pollId = parser.pollId;

		this.listener.sessionEvents.emit(RoomSessionWordQuizEvent.RWPUW_NEW_QUESTION, quizEvent);
	}

	private onQuestionAnsweredEvent(event: IMessageEvent): void
	{
		if (!event) return;

		const session = this.listener.getSession(this.roomId);
		if (session === null) return;

		const parser = (event as QuestionAnsweredEvent).parser as QuestionAnsweredEventParser;

		const quizEvent = new RoomSessionWordQuizEvent(
			RoomSessionWordQuizEvent.RWPUW_QUESTION_ANSWERED,
			session,
			parser.userId
		);
		quizEvent.value = parser.value;
		quizEvent.userId = parser.userId;
		quizEvent.answerCounts = parser.answerCounts;

		this.listener.sessionEvents.emit(RoomSessionWordQuizEvent.RWPUW_QUESTION_ANSWERED, quizEvent);
	}

	private onQuestionFinishedEvent(event: IMessageEvent): void
	{
		if (!event) return;

		const session = this.listener.getSession(this.roomId);
		if (session === null) return;

		const parser = (event as QuestionFinishedEvent).parser as QuestionFinishedEventParser;

		const quizEvent = new RoomSessionWordQuizEvent(
			RoomSessionWordQuizEvent.RWPUW_QUESTION_FINISHED,
			session
		);
		quizEvent.questionId = parser.questionId;
		quizEvent.answerCounts = parser.answerCounts;

		this.listener.sessionEvents.emit(RoomSessionWordQuizEvent.RWPUW_QUESTION_FINISHED, quizEvent);
	}
}
