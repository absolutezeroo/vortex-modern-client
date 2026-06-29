import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ChatRecordData} from './ChatRecordData';

/**
 * Parser for user chatlog messages.
 * Contains user info and a list of room chat records.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/UserChatlogEventParser.as
 */
export class UserChatlogMessageParser implements IMessageParser
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

	private _rooms: ChatRecordData[] = [];

	get rooms(): ChatRecordData[]
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

		const roomCount = wrapper.readInt();

		for (let i = 0; i < roomCount; i++)
		{
			this._rooms.push(new ChatRecordData(wrapper));
		}

		return true;
	}
}
