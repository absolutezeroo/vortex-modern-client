import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {OfficialRoomEntryData, OfficialRoomsData, PromotedRoomsData} from '../../incoming/navigator';

/**
 * Parser for official rooms message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/OfficialRoomsEventParser.as
 */
export class OfficialRoomsMessageParser implements IMessageParser
{
	private _data: OfficialRoomsData | null = null;

	get data(): OfficialRoomsData | null
	{
		return this._data;
	}

	private _adRoom: OfficialRoomEntryData | null = null;

	get adRoom(): OfficialRoomEntryData | null
	{
		return this._adRoom;
	}

	private _promotedRooms: PromotedRoomsData | null = null;

	get promotedRooms(): PromotedRoomsData | null
	{
		return this._promotedRooms;
	}

	flush(): boolean
	{
		this._data = null;
		this._adRoom = null;
		this._promotedRooms = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._data = new OfficialRoomsData(wrapper);

		const adRoomCount = wrapper.readInt();
		if (adRoomCount > 0)
		{
			this._adRoom = new OfficialRoomEntryData(wrapper);
		}

		this._promotedRooms = new PromotedRoomsData(wrapper);

		return true;
	}
}
