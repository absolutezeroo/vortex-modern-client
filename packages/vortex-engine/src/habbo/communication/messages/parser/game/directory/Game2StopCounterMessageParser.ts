import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The lobby countdown was stopped. The message is its own payload — AS3's `parse()` reads nothing
 * and returns false, and the handler takes no parser at all.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2StopCounterMessageParser.as
 */
export class Game2StopCounterMessageParser implements IMessageParser
{
    // AS3: Game2StopCounterMessageParser.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: Game2StopCounterMessageParser.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return false;
    }
}
