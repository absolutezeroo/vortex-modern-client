import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomVisitData} from './RoomVisitData';

/**
 * Parser for room visits messages.
 * Contains user info and a list of visited rooms.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/RoomVisitsEventParser.as
 */
export class RoomVisitsMessageParser implements IMessageParser
{
	private _userId: number = 0;

	get userId(): number
	{
		return this._userId;
	}

	private _userName: string = '';

	get userName(): string
	{
		return this._userName;
	}

	private _rooms: RoomVisitData[] = [];

	get rooms(): RoomVisitData[]
	{
		return this._rooms;
	}

	flush(): boolean
	{
		this._userId = 0;
		this._userName = '';
		this._rooms = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._userId = wrapper.readInt();
		this._userName = wrapper.readString();

		const visitCount = wrapper.readInt();

		for (let i = 0; i < visitCount; i++)
		{
			this._rooms.push(new RoomVisitData(wrapper));
		}

		return true;
	}
}
