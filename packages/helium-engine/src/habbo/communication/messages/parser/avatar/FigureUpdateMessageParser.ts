import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for figure update message
 * Sent when user's avatar appearance changes
 *
 * @see source_as_win63/habbo/communication/messages/parser/avatar/FigureUpdateEventParser.as
 */
export class FigureUpdateMessageParser implements IMessageParser
{
	private _figure: string = '';

	get figure(): string
	{
		return this._figure;
	}

	private _gender: string = '';

	get gender(): string
	{
		return this._gender;
	}

	flush(): boolean
	{
		this._figure = '';
		this._gender = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._figure = wrapper.readString();
		this._gender = wrapper.readString();
		if (this._gender)
		{
			this._gender = this._gender.toUpperCase();
		}
		return true;
	}
}
