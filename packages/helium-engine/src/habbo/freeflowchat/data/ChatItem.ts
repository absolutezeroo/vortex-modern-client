import type {RoomSessionChatEvent} from '@habbo/session/events/RoomSessionChatEvent';
import type {IVector3d} from '@room/utils/IVector3d';

/**
 * Chat message data model. Contains all the data for a single chat message
 * including the user, room, text, style, and optional forced rendering parameters.
 *
 * @see source_as_win63/habbo/freeflowchat/data/ChatItem.as
 */
export class ChatItem
{
	/**
	 * Creates a new ChatItem from a room session chat event.
	 *
	 * @param event The room session chat event
	 * @param timeStamp The timestamp (from getTimer / performance.now)
	 * @param userLocation Optional 3D location of the user in the room
	 * @param extraParam Optional extra parameter
	 * @param forcedScreenLocation Optional forced screen location for rendering
	 * @param forcedColor Optional forced text colour
	 * @param forcedFigure Optional forced avatar figure string
	 * @param forcedUserName Optional forced user name string
	 */
	constructor(
		event: RoomSessionChatEvent,
		timeStamp: number,
		userLocation: IVector3d | null = null,
		extraParam: number = 0,
		forcedScreenLocation: unknown = null,
		forcedColor: number | null = null,
		forcedFigure: string | null = null,
		forcedUserName: string | null = null
	)
	{
		this._timeStamp = timeStamp;
		this._userLocation = userLocation;
		this._userId = event.userId;

		if (event.session)
		{
			this._roomId = event.session.roomId;
		}
		else
		{
			this._roomId = 1;
		}

		this._text = event.text;
		this._chatType = event.chatType;
		this._style = event.styleId;
		this._links = event.links ? [...event.links] : [];
		this._forcedColor = forcedColor;
		this._forcedScreenLocation = forcedScreenLocation;
		this._forcedFigure = forcedFigure;
		this._forcedUserName = forcedUserName;
		this._extraParam = extraParam;
	}

	private _timeStamp: number = 0;

	get timeStamp(): number
	{
		return this._timeStamp;
	}

	private _userId: number = 0;

	get userId(): number
	{
		return this._userId;
	}

	private _roomId: number = 0;

	get roomId(): number
	{
		return this._roomId;
	}

	private _text: string = '';

	get text(): string
	{
		return this._text;
	}

	set text(value: string)
	{
		this._text = value;
	}

	private _chatType: number = 0;

	get chatType(): number
	{
		return this._chatType;
	}

	private _style: number = 0;

	get style(): number
	{
		return this._style;
	}

	private _links: string[];

	get links(): string[]
	{
		return this._links;
	}

	private _userLocation: IVector3d | null = null;

	get userLocation(): IVector3d | null
	{
		return this._userLocation;
	}

	private _forcedColor: number | null = null;

	get forcedColor(): number | null
	{
		return this._forcedColor;
	}

	private _forcedScreenLocation: unknown = null;

	get forcedScreenLocation(): unknown
	{
		return this._forcedScreenLocation;
	}

	private _forcedFigure: string | null = null;

	get forcedFigure(): string | null
	{
		return this._forcedFigure;
	}

	private _forcedUserName: string | null = null;

	get forcedUserName(): string | null
	{
		return this._forcedUserName;
	}

	private _extraParam: number = 0;

	get extraParam(): number
	{
		return this._extraParam;
	}
}
