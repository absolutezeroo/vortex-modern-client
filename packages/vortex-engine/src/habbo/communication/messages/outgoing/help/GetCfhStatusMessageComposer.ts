import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for the state of this user's own pending call for help (header 3458).
 *
 * No body. The port previously declared an `openHelp` boolean, which no revision of this message
 * carries — the client decides on its own whether to open the help window when the answer arrives.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/help/GetCfhStatusMessageComposer.as
 * (obfuscated in the primary dump; `_composers[3458] = _SafeCls_2209` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and the
 * class name is recovered from
 * sources/win63_version/habbo/communication/messages/outgoing/help/GetCfhStatusMessageComposer.as).
 */
export class GetCfhStatusMessageComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_2209.as::GetCfhStatusMessageComposer()
    constructor()
    {
        super();
    }

    // AS3: _SafeCls_2209.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
