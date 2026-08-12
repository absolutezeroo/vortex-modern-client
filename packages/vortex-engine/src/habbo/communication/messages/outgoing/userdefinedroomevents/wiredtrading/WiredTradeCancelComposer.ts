import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Cancels the open wired trade (WIN63 header 2646). No payload — the room and the player are
 * already known to the server.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3348`), named for
 * `WiredTradingModel.requestCancelTrading()`, its only sender.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3044/_SafeCls_3348.as
 */
export class WiredTradeCancelComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3348.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
