import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room invite error messages.
 * Contains the error code and list of failed recipient IDs.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/RoomInviteErrorMessageParser.as
 */
export class RoomInviteErrorMessageParser implements IMessageParser
{
	private _errorCode: number = 0;

	get errorCode(): number
	{
		return this._errorCode;
	}

	private _failedRecipients: number[] = [];

	get failedRecipients(): number[]
	{
		return this._failedRecipients;
	}

	flush(): boolean
	{
		this._errorCode = 0;
		this._failedRecipients = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._errorCode = wrapper.readInt();

		if (this._errorCode === 1)
		{
			const count = wrapper.readInt();

			for (let i = 0; i < count; i++)
			{
				this._failedRecipients.push(wrapper.readInt());
			}
		}

		return true;
	}
}
