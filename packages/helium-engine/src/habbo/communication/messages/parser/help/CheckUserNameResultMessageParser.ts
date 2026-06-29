import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for check user name result messages.
 * Contains the result code, checked name, and name suggestions.
 *
 * @see source_as_win63/habbo/communication/messages/parser/avatar/CheckUserNameResultMessageEventParser.as
 */
export class CheckUserNameResultMessageParser implements IMessageParser
{
	private _resultCode: number = -1;

	get resultCode(): number
	{
		return this._resultCode;
	}

	private _name: string = '';

	get name(): string
	{
		return this._name;
	}

	private _nameSuggestions: string[] = [];

	get nameSuggestions(): string[]
	{
		return this._nameSuggestions;
	}

	flush(): boolean
	{
		this._resultCode = -1;
		this._name = '';
		this._nameSuggestions = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._resultCode = wrapper.readInt();
		this._name = wrapper.readString();

		const count = wrapper.readInt();

		this._nameSuggestions = [];

		for (let i = 0; i < count; i++)
		{
			this._nameSuggestions.push(wrapper.readString());
		}

		return true;
	}
}
