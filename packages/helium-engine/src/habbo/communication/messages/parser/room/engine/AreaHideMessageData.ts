/**
 * AreaHideMessageData
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.AreaHideMessageData
 *
 * Data for area hide furniture zones.
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class AreaHideMessageData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._furniId = wrapper.readInt();
		this._on = wrapper.readBoolean();
		this._rootX = wrapper.readInt();
		this._rootY = wrapper.readInt();
		this._width = wrapper.readInt();
		this._length = wrapper.readInt();
		this._invert = wrapper.readBoolean();
	}

	private _furniId: number;

	get furniId(): number
	{
		return this._furniId;
	}

	private _on: boolean;

	get on(): boolean
	{
		return this._on;
	}

	private _rootX: number;

	get rootX(): number
	{
		return this._rootX;
	}

	private _rootY: number;

	get rootY(): number
	{
		return this._rootY;
	}

	private _width: number;

	get width(): number
	{
		return this._width;
	}

	private _length: number;

	get length(): number
	{
		return this._length;
	}

	private _invert: boolean;

	get invert(): boolean
	{
		return this._invert;
	}
}
