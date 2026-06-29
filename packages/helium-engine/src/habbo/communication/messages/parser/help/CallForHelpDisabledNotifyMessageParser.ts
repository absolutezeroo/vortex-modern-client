import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for call for help disabled notification.
 * Contains a URL for additional information when CFH is disabled.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/CallForHelpDisabledNotifyMessageEventParser.as
 */
export class CallForHelpDisabledNotifyMessageParser implements IMessageParser
{
	private _infoUrl: string = '';

	get infoUrl(): string
	{
		return this._infoUrl;
	}

	flush(): boolean
	{
		this._infoUrl = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._infoUrl = wrapper.readString();

		return true;
	}
}
