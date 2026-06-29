import type {IMessageDataWrapper} from '@core/communication';

/**
 * Chat mode constants
 */
export const RoomChatMode = {
	FREE_FLOW: 0,
	LINE_BY_LINE: 1,
} as const;

/**
 * Chat bubble width constants
 */
export const RoomChatBubbleWidth = {
	NORMAL: 0,
	THIN: 1,
	WIDE: 2,
} as const;

/**
 * Chat scroll speed constants
 */
export const RoomChatScrollSpeed = {
	FAST: 0,
	NORMAL: 1,
	SLOW: 2,
} as const;

/**
 * Flood sensitivity constants
 */
export const RoomFloodSensitivity = {
	OFF: 0,
	STRICT: 1,
	NORMAL: 2,
} as const;

/**
 * Room chat settings
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.roomsettings.class_1732
 */
export class RoomChatSettings
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._mode = wrapper.readInt();
		this._bubbleWidth = wrapper.readInt();
		this._scrollSpeed = wrapper.readInt();
		this._fullHearRange = wrapper.readInt();
		this._floodSensitivity = wrapper.readInt();
	}

	private _mode: number = 0;

	get mode(): number
	{
		return this._mode;
	}

	private _bubbleWidth: number = 1;

	get bubbleWidth(): number
	{
		return this._bubbleWidth;
	}

	private _scrollSpeed: number = 1;

	get scrollSpeed(): number
	{
		return this._scrollSpeed;
	}

	private _fullHearRange: number = 14;

	get fullHearRange(): number
	{
		return this._fullHearRange;
	}

	private _floodSensitivity: number = 1;

	get floodSensitivity(): number
	{
		return this._floodSensitivity;
	}
}
