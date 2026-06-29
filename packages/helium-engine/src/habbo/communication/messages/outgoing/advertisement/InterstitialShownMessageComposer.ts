import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Notify server that interstitial ad was shown
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/advertisement/InterstitialShownMessageComposer.as
 */
export class InterstitialShownMessageComposer extends MessageComposer<ConstructorParameters<typeof InterstitialShownMessageComposer>>
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
