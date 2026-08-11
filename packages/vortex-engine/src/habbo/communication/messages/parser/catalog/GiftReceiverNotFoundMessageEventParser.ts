import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The player a gift was addressed to does not exist (header 2735).
 *
 * Carries no payload — the arrival is the whole message. AS3's parser body is `return true` and
 * `vortex-emulator`'s serializer writes nothing, so the two agree that this is a pure signal.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_2879.as
 */
export class GiftReceiverNotFoundMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_2879.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_2879.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
