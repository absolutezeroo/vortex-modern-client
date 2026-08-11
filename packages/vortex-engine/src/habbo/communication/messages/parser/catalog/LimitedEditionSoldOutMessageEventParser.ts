import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A limited-edition item sold out before this purchase completed (header 533).
 *
 * Carries no payload — the arrival is the whole message. AS3's parser body is `return true` and
 * `vortex-emulator`'s serializer writes nothing, so the two agree that this is a pure signal.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3332.as
 */
export class LimitedEditionSoldOutMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_3332.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_3332.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
