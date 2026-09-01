import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * How long until the next state. Zero means there is no next stage and the game session is torn
 * down there and then.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4160` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4160.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2StageEndingMessageEventParser.as
 */
export class Game2StageEndingMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4160.as::_SafeStr_7773
    private _timeToNextState: number = -1;

    // AS3: _SafeCls_4160.as::get timeToNextState()
    get timeToNextState(): number
    {
        return this._timeToNextState;
    }

    // AS3: _SafeCls_4160.as::flush()
    flush(): boolean
    {
        this._timeToNextState = -1;

        return true;
    }

    // AS3: _SafeCls_4160.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._timeToNextState = wrapper.readInt();

        return true;
    }
}
