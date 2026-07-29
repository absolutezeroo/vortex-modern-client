import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the mystery-box wait being called off.
 *
 * Empty payload. Sent to the *other* participant when one side presses cancel (or walks away), so
 * the receiving client just closes whatever mystery-box dialog it has open.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/mysterybox/CancelMysteryBoxWaitMessageEventParser.as
 *
 * WIN63 primary carries this obfuscated as the parser behind
 * `src/unknowns/_SafePkg_2222/_SafeCls_3997.as`; the class name comes from the win63_version tree.
 */
export class CancelMysteryBoxWaitMessageParser implements IMessageParser
{
    // AS3: CancelMysteryBoxWaitMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: CancelMysteryBoxWaitMessageEventParser.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
