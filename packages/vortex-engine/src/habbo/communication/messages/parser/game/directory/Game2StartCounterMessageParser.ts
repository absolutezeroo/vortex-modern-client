import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Starts the lobby countdown, in seconds.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2StartCounterMessageParser.as
 */
export class Game2StartCounterMessageParser implements IMessageParser
{
    // AS3: Game2StartCounterMessageParser.as::_SafeStr_9183
    private _countDownLength: number = 0;

    // AS3: Game2StartCounterMessageParser.as::get countDownLength()
    get countDownLength(): number
    {
        return this._countDownLength;
    }

    // AS3: Game2StartCounterMessageParser.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: Game2StartCounterMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._countDownLength = wrapper.readInt();

        return true;
    }
}
