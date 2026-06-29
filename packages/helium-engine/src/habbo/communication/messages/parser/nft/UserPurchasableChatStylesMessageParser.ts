import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for purchasable chat styles.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/nft/UserPurchasableChatStylesMessageEventParser.as
 */
export class UserPurchasableChatStylesMessageParser implements IMessageParser
{
	private _chatStyleIds: number[] = [];

	get chatStyleIds(): number[]
	{
		return this._chatStyleIds;
	}

	flush(): boolean
	{
		this._chatStyleIds = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		const count = wrapper.readInt();

		this._chatStyleIds = [];

		for (let i = 0; i < count; i++)
		{
			this._chatStyleIds.push(wrapper.readInt());
		}

		return true;
	}
}
