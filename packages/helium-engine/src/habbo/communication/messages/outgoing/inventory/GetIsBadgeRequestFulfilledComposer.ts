import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks whether a badge request has already been fulfilled.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/inventory/badges/GetIsBadgeRequestFulfilledComposer.as
 */
export class GetIsBadgeRequestFulfilledComposer extends MessageComposer<ConstructorParameters<typeof GetIsBadgeRequestFulfilledComposer>>
{
    private _data: ConstructorParameters<typeof GetIsBadgeRequestFulfilledComposer>;

    constructor(requestCode: string)
    {
        super();
        this._data = [requestCode];
    }

    getMessageArray(): [string]
    {
        return this._data;
    }
}
