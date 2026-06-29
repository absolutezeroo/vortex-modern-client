import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the user's credit balance.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/inventory/purse/GetCreditsInfoComposer.as
 */
export class GetCreditsInfoComposer extends MessageComposer<[]>
{
    private _data: [] = [];

    getMessageArray(): []
    {
        return this._data;
    }
}
