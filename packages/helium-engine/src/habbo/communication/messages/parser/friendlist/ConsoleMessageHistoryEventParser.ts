import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class for a single history message entry.
 * Represents one message in a conversation history fragment.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/friendlist/class_3449.as
 */
export class HistoryMessageEntry
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._senderId = wrapper.readInt();
		this._senderName = wrapper.readString();
		this._senderFigure = wrapper.readString();
		this._message = wrapper.readString();
		this._secondsSinceSent = wrapper.readInt();
		this._messageId = wrapper.readString();
	}

	private _senderId: number;

	get senderId(): number
	{
		return this._senderId;
	}

	private _senderName: string;

	get senderName(): string
	{
		return this._senderName;
	}

	private _senderFigure: string;

	get senderFigure(): string
	{
		return this._senderFigure;
	}

	private _message: string;

	get message(): string
	{
		return this._message;
	}

	private _secondsSinceSent: number;

	get secondsSinceSent(): number
	{
		return this._secondsSinceSent;
	}

	private _messageId: string;

	get messageId(): string
	{
		return this._messageId;
	}
}

/**
 * Parser for console message history events.
 * Contains a fragment of conversation history for a given chat.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/ConsoleMessageHistoryEventParser.as
 */
export class ConsoleMessageHistoryEventParser implements IMessageParser
{
	private _chatId: number = 0;

	get chatId(): number
	{
		return this._chatId;
	}

	private _historyFragment: HistoryMessageEntry[] = [];

	get historyFragment(): HistoryMessageEntry[]
	{
		return this._historyFragment;
	}

	flush(): boolean
	{
		this._chatId = 0;
		this._historyFragment = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._chatId = wrapper.readInt();
		this._historyFragment = [];

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._historyFragment.push(new HistoryMessageEntry(wrapper));
		}

		return true;
	}
}
