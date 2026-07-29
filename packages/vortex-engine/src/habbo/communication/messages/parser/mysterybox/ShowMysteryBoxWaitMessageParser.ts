import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the "start waiting" half of a mystery-box open flow.
 *
 * Empty payload — the message is the signal. Both participants receive it: the owner who used the
 * box and the key holder whose key went into the lock, which is why the dialog it opens picks its
 * captions from `isOwnerOfFurniture()` rather than from anything on the wire.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/mysterybox/ShowMysteryBoxWaitMessageEventParser.as
 *
 * WIN63 primary carries this obfuscated as the parser behind
 * `src/unknowns/_SafePkg_2222/_SafeCls_3631.as`; the class name comes from the win63_version tree.
 */
export class ShowMysteryBoxWaitMessageParser implements IMessageParser
{
    // AS3: ShowMysteryBoxWaitMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: ShowMysteryBoxWaitMessageEventParser.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
