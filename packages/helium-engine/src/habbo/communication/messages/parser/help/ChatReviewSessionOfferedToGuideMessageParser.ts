import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses chat review session offered to guide data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/help/ChatReviewSessionOfferedToGuideMessageEventParser.as
 */
export class ChatReviewSessionOfferedToGuideMessageParser implements IMessageParser
{
	private _acceptanceTimeout: number = -1;

	get acceptanceTimeout(): number
	{
		return this._acceptanceTimeout;
	}

	flush(): boolean
	{
		this._acceptanceTimeout = -1;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._acceptanceTimeout = wrapper.readInt();
		return true;
	}
}
