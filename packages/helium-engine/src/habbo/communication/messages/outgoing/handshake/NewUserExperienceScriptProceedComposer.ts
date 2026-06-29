import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Signal progression through the new user experience (NUX) tutorial.
 *
 * Sends an empty array - just a confirmation signal with no data payload.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/handshake/NewUserExperienceScriptProceedComposer.as
 */
export class NewUserExperienceScriptProceedComposer extends MessageComposer<[]>
{
	private _data: [] = [];

	constructor()
	{
		super();
	}

	getMessageArray(): []
	{
		return this._data;
	}
}
