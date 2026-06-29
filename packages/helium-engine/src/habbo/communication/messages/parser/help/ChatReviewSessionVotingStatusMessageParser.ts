import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses chat review session voting status data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionVotingStatusMessageEventParser.as
 */
export class ChatReviewSessionVotingStatusMessageParser implements IMessageParser
{
	public static readonly STATUS_NO_VOTE: number = 0;
	public static readonly STATUS_VOTE_RECEIVED: number = 1;
	public static readonly STATUS_PROCESSING: number = 2;
	public static readonly STATUS_VOTE_FINAL: number = 3;
	public static readonly STATUS_TIMEOUT: number = 4;
	public static readonly STATUS_ABORTED: number = 5;

	private _status: Array<number> = [];

	get status(): Array<number>
	{
		return this._status;
	}

	flush(): boolean
	{
		this._status = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._status = [];
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._status.push(wrapper.readInt());
		}

		return true;
	}
}
