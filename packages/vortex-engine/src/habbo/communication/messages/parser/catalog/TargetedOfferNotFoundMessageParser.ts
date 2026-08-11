import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * "No targeted offer for you" (header 2013). Payload-free — the message *is* the answer.
 *
 * It is not a dead end: `OfferController` treats it as the cue to fall back to the Habbo Mall
 * offer that the surrounding page hands over through the ExternalInterface bridge.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_4151.as
 * (obfuscated; identified as this parser by `_SafeCls_3069`, the event registered as
 * `_SafeStr_4546[2013]` in
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, whose
 * `getParser()` returns it. `vortex-emulator` corroborates the header:
 * `Revision20260701/Headers.cs::TargetedOfferNotFoundComposer = 2013`.)
 */
export class TargetedOfferNotFoundMessageParser implements IMessageParser
{
    // AS3: .../src/unknowns/_SafePkg_1714/_SafeCls_4151.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_1714/_SafeCls_4151.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
