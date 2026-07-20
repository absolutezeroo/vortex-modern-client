import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the "wired saved successfully" push. The message has no body; its arrival is the
 * signal (consumed by IncomingMessages.onSaveSuccess -> wiredCtrl.onSaveSuccess()).
 *
 * Name derived: the AS3 parser is obfuscated (WIN63 `_SafeCls_4293`) and the older
 * vortex-flash-client never imports a save-success parser class (its event used the default).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_4293.as
 */
export class WiredSaveSuccessMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4293.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4293.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
