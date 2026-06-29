import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data for a lifted room in the new navigator
 *
 * Based on AS3 class_1695
 */
export class NavigatorLiftedRoomData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._flatId = wrapper.readInt();
		this._areaId = wrapper.readInt();
		this._image = wrapper.readString();
		this._caption = wrapper.readString();
	}

	private _flatId: number;

	get flatId(): number
	{
		return this._flatId;
	}

	private _areaId: number;

	get areaId(): number
	{
		return this._areaId;
	}

	private _image: string;

	get image(): string
	{
		return this._image;
	}

	private _caption: string;

	get caption(): string
	{
		return this._caption;
	}
}
