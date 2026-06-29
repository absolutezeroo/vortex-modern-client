import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session queue event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionQueueEvent.as
 */
export class RoomSessionQueueEvent extends RoomSessionEvent
{
	public static readonly QUEUE_STATUS = 'RSQE_QUEUE_STATUS';
	public static readonly QUEUE_TYPE_NORMAL = 'd';
	private _queues: Map<string, number> = new Map();

	constructor(session: IRoomSession, name: string, target: number, isActive: boolean = false)
	{
		super(RoomSessionQueueEvent.QUEUE_STATUS, session);
		this._queueSetName = name;
		this._queueSetTarget = target;
		this._isActive = isActive;
	}

	private _queueSetName: string;

	get queueSetName(): string
	{
		return this._queueSetName;
	}

	private _queueSetTarget: number;

	get queueSetTarget(): number
	{
		return this._queueSetTarget;
	}

	private _isActive: boolean;

	get isActive(): boolean
	{
		return this._isActive;
	}

	get queueTypes(): string[]
	{
		return Array.from(this._queues.keys());
	}

	addQueue(type: string, size: number): void
	{
		this._queues.set(type, size);
	}

	getQueueSize(type: string): number
	{
		return this._queues.get(type) ?? 0;
	}
}
