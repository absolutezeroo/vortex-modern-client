import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for purchasable chat style change.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/nft/UserPurchasableChatStyleChangedMessageEventParser.as
 */
export class UserPurchasableChatStyleChangedMessageParser implements IMessageParser
{
	private _added: boolean = false;
	private _styleId: number = 0;

	get added(): boolean
	{
		return this._added;
	}

	get styleId(): number
	{
		return this._styleId;
	}

	flush(): boolean
	{
		this._added = false;
		this._styleId = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._added = wrapper.readBoolean();
		this._styleId = wrapper.readInt();
		return true;
	}
}
