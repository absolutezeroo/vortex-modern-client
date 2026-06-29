/**
 * HeightMapMessageParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.engine.HeightMapMessageEventParser
 *
 * Parser for room height map data.
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class HeightMapMessageParser implements IMessageParser
{
	private _tileHeightMask: number = 16383;
	private _data: number[] = [];

	private _stackingBlockedMaskBit: number = 16384;

	set stackingBlockedMaskBit(value: number)
	{
		this._stackingBlockedMaskBit = 1 << value;
		this._tileHeightMask = this._stackingBlockedMaskBit - 1;
	}

	private _width: number = 0;

	get width(): number
	{
		return this._width;
	}

	private _height: number = 0;

	get height(): number
	{
		return this._height;
	}

	static decodeTileHeight(value: number, mask: number): number
	{
		return value === -1 ? -1 : (value & mask) / 256;
	}

	static decodeIsStackingBlocked(value: number, mask: number): boolean
	{
		return Boolean(value & mask);
	}

	static decodeIsRoomTile(value: number): boolean
	{
		return value !== -1;
	}

	decodeTileHeight(value: number): number
	{
		return HeightMapMessageParser.decodeTileHeight(value, this._tileHeightMask);
	}

	decodeIsStackingBlocked(value: number): boolean
	{
		return HeightMapMessageParser.decodeIsStackingBlocked(value, this._stackingBlockedMaskBit);
	}

	getTileHeight(x: number, y: number): number
	{
		if (x < 0 || x >= this._width || y < 0 || y >= this._height)
		{
			return -1;
		}

		return this.decodeTileHeight(this._data[y * this._width + x]);
	}

	getStackingBlocked(x: number, y: number): boolean
	{
		if (x < 0 || x >= this._width || y < 0 || y >= this._height)
		{
			return true;
		}

		return this.decodeIsStackingBlocked(this._data[y * this._width + x]);
	}

	isRoomTile(x: number, y: number): boolean
	{
		if (x < 0 || x >= this._width || y < 0 || y >= this._height)
		{
			return false;
		}

		return HeightMapMessageParser.decodeIsRoomTile(this._data[y * this._width + x]);
	}

	flush(): boolean
	{
		this._data = [];
		this._width = 0;
		this._height = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper === null)
		{
			return false;
		}

		this._width = wrapper.readInt();
		const total = wrapper.readInt();
		this._height = total / this._width;
		this._data = new Array(total);

		for (let i = 0; i < total; i++)
		{
			this._data[i] = wrapper.readShort();
		}

		return true;
	}
}
