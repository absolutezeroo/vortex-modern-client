import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send SSO ticket for authentication
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/handshake/SSOTicketMessageComposer.as
 */
export class SSOTicketMessageComposer extends MessageComposer<ConstructorParameters<typeof SSOTicketMessageComposer>>
{
    private static readonly _startTime: number = Date.now();

    private _data: ConstructorParameters<typeof SSOTicketMessageComposer>;

    constructor(ssoTicket: string, time: number = SSOTicketMessageComposer.getTimer())
    {
        super();

        this._data = [ssoTicket, time];
    }

    private static getTimer(): number
    {
        if(typeof performance !== 'undefined')
        {
            return Math.floor(performance.now());
        }

        return Date.now() - SSOTicketMessageComposer._startTime;
    }

    getMessageArray()
    {
        return this._data;
    }
}
