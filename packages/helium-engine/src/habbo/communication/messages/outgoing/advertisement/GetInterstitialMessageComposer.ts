import {MessageComposer} from '@core/communication/messages/MessageComposer';
import {InterstitialShownMessageComposer} from "./InterstitialShownMessageComposer";

/**
 * Request interstitial ad availability from server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/advertisement/GetInterstitialMessageComposer.as
 */
export class GetInterstitialMessageComposer extends MessageComposer<ConstructorParameters<typeof InterstitialShownMessageComposer>>
{
	private _data: ConstructorParameters<typeof InterstitialShownMessageComposer>;

	constructor()
	{
		super();

		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}
}
