import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The game was cancelled. Payload-free, like `Game2StopCounterMessageParser`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2GameCancelledMessageParser.as
 */
export class Game2GameCancelledMessageParser implements IMessageParser
{
    // AS3: Game2GameCancelledMessageParser.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: Game2GameCancelledMessageParser.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return false;
    }
}
