import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Report chat lag warnings to the server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/tracking/LagWarningReportMessageComposer.as
 */
export class LagWarningReportMessageComposer extends MessageComposer<ConstructorParameters<typeof LagWarningReportMessageComposer>>
{
    private _data: ConstructorParameters<typeof LagWarningReportMessageComposer>;

    constructor(warningCount: number)
    {
        super();
        this._data = [warningCount];
    }

    getMessageArray()
    {
        return this._data;
    }
}
