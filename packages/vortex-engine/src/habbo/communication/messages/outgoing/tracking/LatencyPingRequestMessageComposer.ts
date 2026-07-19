import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request a latency ping test from the server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/tracking/LatencyPingRequestMessageComposer.as
 */
export class LatencyPingRequestMessageComposer extends MessageComposer<ConstructorParameters<typeof LatencyPingRequestMessageComposer>>
{
    private _data: ConstructorParameters<typeof LatencyPingRequestMessageComposer>;

    constructor(requestId: number)
    {
        super();
        this._data = [requestId];
    }

    getMessageArray()
    {
        return this._data;
    }
}
