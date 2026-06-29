import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session poll event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPollEvent.as
 */
export class RoomSessionPollEvent extends RoomSessionEvent
{
	public static readonly OFFER = 'RSPE_POLL_OFFER';
	public static readonly ERROR = 'RSPE_POLL_ERROR';
	public static readonly CONTENT = 'RSPE_POLL_CONTENT';

	constructor(type: string, session: IRoomSession, id: number)
	{
		super(type, session);
		this._id = id;
	}

	private _id: number;

	get id(): number
	{
		return this._id;
	}

	private _headline: string = '';

	get headline(): string
	{
		return this._headline;
	}

	set headline(value: string)
	{
		this._headline = value;
	}

	private _summary: string = '';

	get summary(): string
	{
		return this._summary;
	}

	set summary(value: string)
	{
		this._summary = value;
	}

	private _numQuestions: number = 0;

	get numQuestions(): number
	{
		return this._numQuestions;
	}

	set numQuestions(value: number)
	{
		this._numQuestions = value;
	}

	private _startMessage: string = '';

	get startMessage(): string
	{
		return this._startMessage;
	}

	set startMessage(value: string)
	{
		this._startMessage = value;
	}

	private _endMessage: string = '';

	get endMessage(): string
	{
		return this._endMessage;
	}

	set endMessage(value: string)
	{
		this._endMessage = value;
	}

	private _questionArray: unknown[] | null = null;

	get questionArray(): unknown[] | null
	{
		return this._questionArray;
	}

	set questionArray(value: unknown[] | null)
	{
		this._questionArray = value;
	}

	private _npsPoll: boolean = false;

	get npsPoll(): boolean
	{
		return this._npsPoll;
	}

	set npsPoll(value: boolean)
	{
		this._npsPoll = value;
	}
}
