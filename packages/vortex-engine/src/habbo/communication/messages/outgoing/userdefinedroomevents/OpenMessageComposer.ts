import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Sent in reply to an OpenEvent to request/open the wired configuration for a given stuff (furni)
 * id (WIN63 header 1869).
 *
 * Name recovered from vortex-flash-client: OpenMessageComposer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/_SafeCls_3966.as
 */
export class OpenMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    // AS3: _SafeCls_3966.as::_SafeCls_3966()
    constructor(stuffId: number)
    {
        super();
        this._data = [stuffId];
    }

    // AS3: _SafeCls_3966.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
