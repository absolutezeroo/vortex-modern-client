/**
 * RoomSpriteMouseEvent
 *
 * Based on AS3: com.sulake.room.events.RoomSpriteMouseEvent
 *
 * Mouse event data for room sprite interactions.
 */
export class RoomSpriteMouseEvent
{
	constructor(
		type: string,
		eventId: string,
		canvasId: string,
		spriteTag: string,
		screenX: number,
		screenY: number,
		localX: number = 0,
		localY: number = 0,
		ctrlKey: boolean = false,
		altKey: boolean = false,
		shiftKey: boolean = false,
		buttonDown: boolean = false
	)
	{
		this._type = type;
		this._eventId = eventId;
		this._canvasId = canvasId;
		this._spriteTag = spriteTag;
		this._screenX = screenX;
		this._screenY = screenY;
		this._localX = localX;
		this._localY = localY;
		this._ctrlKey = ctrlKey;
		this._altKey = altKey;
		this._shiftKey = shiftKey;
		this._buttonDown = buttonDown;
	}

	private _type: string = '';

	get type(): string
	{
		return this._type;
	}

	private _eventId: string = '';

	get eventId(): string
	{
		return this._eventId;
	}

	private _canvasId: string = '';

	get canvasId(): string
	{
		return this._canvasId;
	}

	private _spriteTag: string = '';

	get spriteTag(): string
	{
		return this._spriteTag;
	}

	private _screenX: number = 0;

	get screenX(): number
	{
		return this._screenX;
	}

	private _screenY: number = 0;

	get screenY(): number
	{
		return this._screenY;
	}

	private _localX: number = 0;

	get localX(): number
	{
		return this._localX;
	}

	private _localY: number = 0;

	get localY(): number
	{
		return this._localY;
	}

	private _ctrlKey: boolean = false;

	get ctrlKey(): boolean
	{
		return this._ctrlKey;
	}

	private _altKey: boolean = false;

	get altKey(): boolean
	{
		return this._altKey;
	}

	private _shiftKey: boolean = false;

	get shiftKey(): boolean
	{
		return this._shiftKey;
	}

	private _buttonDown: boolean = false;

	get buttonDown(): boolean
	{
		return this._buttonDown;
	}

	private _spriteOffsetX: number = 0;

	get spriteOffsetX(): number
	{
		return this._spriteOffsetX;
	}

	set spriteOffsetX(value: number)
	{
		this._spriteOffsetX = value;
	}

	private _spriteOffsetY: number = 0;

	get spriteOffsetY(): number
	{
		return this._spriteOffsetY;
	}

	set spriteOffsetY(value: number)
	{
		this._spriteOffsetY = value;
	}
}
