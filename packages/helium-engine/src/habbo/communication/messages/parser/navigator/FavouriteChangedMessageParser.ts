import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for favourite changed message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/FavouriteChangedEventParser.as
 */
export class FavouriteChangedMessageParser implements IMessageParser
{
	private _flatId: number = 0;

	get flatId(): number
	{
		return this._flatId;
	}

	private _added: boolean = false;

	get added(): boolean
	{
		return this._added;
	}

	flush(): boolean
	{
		this._flatId = 0;
		this._added = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._flatId = wrapper.readInt();
		this._added = wrapper.readBoolean();
		return true;
	}
}
