/**
 * RoomObjectRoomMaskUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectRoomMaskUpdateMessage.as
 *
 * Update message for room masks (doors, windows, holes).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';

export class RoomObjectRoomMaskUpdateMessage extends RoomObjectUpdateMessage
{
	public static readonly ADD_MASK = 'RORMUM_ADD_MASK';
	public static readonly REMOVE_MASK = 'RORMUM_REMOVE_MASK';
	public static readonly MASK_TYPE_DOOR = 'door';
	public static readonly MASK_CATEGORY_WINDOW = 'window';
	public static readonly MASK_CATEGORY_HOLE = 'hole';

	constructor(
		type: string,
		maskId: string,
		maskType: string | null = null,
		maskLocation: IVector3d | null = null,
		maskCategory: string = 'window'
	)
	{
		super(null, null);
		this._type = type;
		this._maskId = maskId;
		this._maskType = maskType;

		if (maskLocation != null)
		{
			this._maskLocation = new Vector3d(maskLocation.x, maskLocation.y, maskLocation.z);
		}

		this._maskCategory = maskCategory;
	}

	private _type: string = '';

	get type(): string
	{
		return this._type;
	}

	private _maskId: string = '';

	get maskId(): string
	{
		return this._maskId;
	}

	private _maskType: string | null = '';

	get maskType(): string | null
	{
		return this._maskType;
	}

	private _maskLocation: Vector3d | null = null;

	get maskLocation(): IVector3d | null
	{
		return this._maskLocation;
	}

	private _maskCategory: string = 'window';

	get maskCategory(): string
	{
		return this._maskCategory;
	}
}
