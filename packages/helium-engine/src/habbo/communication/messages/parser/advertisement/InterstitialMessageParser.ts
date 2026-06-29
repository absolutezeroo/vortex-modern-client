import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for interstitial ad availability message
 *
 * @see source_as_win63/habbo/communication/messages/parser/advertisement/InterstitialMessageEventParser.as
 */
export class InterstitialMessageParser implements IMessageParser
{
	private _canShowInterstitial: boolean = false;

	get canShowInterstitial(): boolean
	{
		return this._canShowInterstitial;
	}

	flush(): boolean
	{
		this._canShowInterstitial = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._canShowInterstitial = wrapper.readBoolean();

		return true;
	}
}
