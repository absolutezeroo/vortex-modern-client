import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * How long this player is blocked from starting games, in the same unit the directory status uses.
 * The games main window shows it as a countdown.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2UserBlockedMessageParser.as
 */
export class Game2UserBlockedMessageParser implements IMessageParser
{
    // AS3: Game2UserBlockedMessageParser.as::_SafeStr_7821
    private _playerBlockLength: number = 0;

    // AS3: Game2UserBlockedMessageParser.as::get playerBlockLength()
    get playerBlockLength(): number
    {
        return this._playerBlockLength;
    }

    // AS3: Game2UserBlockedMessageParser.as::flush()
    flush(): boolean
    {
        this._playerBlockLength = 0;

        return true;
    }

    // AS3: Game2UserBlockedMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._playerBlockLength = wrapper.readInt();

        return true;
    }
}
