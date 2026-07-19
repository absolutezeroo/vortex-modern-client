import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the current CFH status.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/help/GetCfhStatusMessageComposer.as
 */
export class GetCfhStatusMessageComposer extends MessageComposer<ConstructorParameters<typeof GetCfhStatusMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetCfhStatusMessageComposer>;

    constructor(openHelp: boolean)
    {
        super();
        this._data = [openHelp];
    }

    getMessageArray()
    {
        return this._data;
    }
}
