import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session present event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionPresentEvent.as
 */
export class RoomSessionPresentEvent extends RoomSessionEvent
{
	public static readonly RSPE_PRESENT_OPENED = 'RSPE_PRESENT_OPENED';

	constructor(
		type: string,
		session: IRoomSession,
		classId: number,
		itemType: string,
		productCode: string,
		placedItemId: number,
		placedItemType: string,
		placedInRoom: boolean,
		petFigureString: string
	)
	{
		super(type, session);
		this._classId = classId;
		this._itemType = itemType;
		this._productCode = productCode;
		this._placedItemId = placedItemId;
		this._placedItemType = placedItemType;
		this._placedInRoom = placedInRoom;
		this._petFigureString = petFigureString;
	}

	private _classId: number;

	get classId(): number
	{
		return this._classId;
	}

	private _itemType: string;

	get itemType(): string
	{
		return this._itemType;
	}

	private _productCode: string;

	get productCode(): string
	{
		return this._productCode;
	}

	private _placedItemId: number;

	get placedItemId(): number
	{
		return this._placedItemId;
	}

	private _placedItemType: string;

	get placedItemType(): string
	{
		return this._placedItemType;
	}

	private _placedInRoom: boolean;

	get placedInRoom(): boolean
	{
		return this._placedInRoom;
	}

	private _petFigureString: string;

	get petFigureString(): string
	{
		return this._petFigureString;
	}
}
