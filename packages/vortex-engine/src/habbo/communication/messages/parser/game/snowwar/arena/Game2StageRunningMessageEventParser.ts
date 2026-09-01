import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The stage is live, and this is how long it lasts. A value of 0 or less is how the server says
 * "already over" — `SnowWarEngine.stageRunning()` goes straight to the ending state on it.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4422` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4422.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2StageRunningMessageEventParser.as
 */
export class Game2StageRunningMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4422.as::_SafeStr_8106
    private _timeToStageEnd: number = -1;

    // AS3: _SafeCls_4422.as::get timeToStageEnd()
    get timeToStageEnd(): number
    {
        return this._timeToStageEnd;
    }

    // AS3: _SafeCls_4422.as::flush()
    flush(): boolean
    {
        this._timeToStageEnd = -1;

        return true;
    }

    // AS3: _SafeCls_4422.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._timeToStageEnd = wrapper.readInt();

        return true;
    }
}
