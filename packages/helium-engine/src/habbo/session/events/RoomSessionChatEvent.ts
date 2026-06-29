import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session chat event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionChatEvent
 */
export class RoomSessionChatEvent extends RoomSessionEvent
{
	public static readonly RSCE_CHAT_EVENT = 'RSCE_CHAT_EVENT';
	public static readonly RSCE_FLOOD_EVENT = 'RSCE_FLOOD_EVENT';

	// Chat types
	public static readonly CHAT_TYPE_SPEAK = 0;
	public static readonly CHAT_TYPE_WHISPER = 1;
	public static readonly CHAT_TYPE_SHOUT = 2;
	public static readonly CHAT_TYPE_RESPECT = 3;
	public static readonly CHAT_TYPE_PET_RESPECT = 4;
	public static readonly CHAT_TYPE_HAND_ITEM_RECEIVED = 5;
	public static readonly CHAT_TYPE_PET_TREAT = 6;
	public static readonly CHAT_TYPE_PET_REVIVE = 7;
	public static readonly CHAT_TYPE_PET_REBREED = 8;
	public static readonly CHAT_TYPE_PET_SPEED = 9;
	public static readonly CHAT_TYPE_MUTE_REMAINING = 10;

	constructor(
		type: string,
		session: IRoomSession,
		userId: number,
		text: string,
		chatType: number,
		styleId: number,
		links: string[] | null = null,
		extraParam: number = -1
	)
	{
		super(type, session);
		this._userId = userId;
		this._text = text;
		this._chatType = chatType;
		this._styleId = styleId;
		this._links = links;
		this._extraParam = extraParam;
	}

	private _userId: number;

	get userId(): number
	{
		return this._userId;
	}

	private _text: string;

	get text(): string
	{
		return this._text;
	}

	private _chatType: number;

	get chatType(): number
	{
		return this._chatType;
	}

	private _styleId: number;

	get styleId(): number
	{
		return this._styleId;
	}

	private _links: string[] | null;

	get links(): string[] | null
	{
		return this._links;
	}

	private _extraParam: number;

	get extraParam(): number
	{
		return this._extraParam;
	}
}
