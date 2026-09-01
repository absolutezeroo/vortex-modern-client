import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * "Build your view of the stage now." Carries only the game type, which the handler does not read —
 * it calls `SnowWarEngine.initView()` and nothing else.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4431` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4431.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2StageLoadMessageEventParser.as
 */
export class Game2StageLoadMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4431.as::_SafeStr_6884
    private _gameType: number = -1;

    // AS3: _SafeCls_4431.as::get gameType()
    get gameType(): number
    {
        return this._gameType;
    }

    // AS3: _SafeCls_4431.as::flush()
    flush(): boolean
    {
        this._gameType = -1;

        return true;
    }

    // AS3: _SafeCls_4431.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._gameType = wrapper.readInt();

        return true;
    }
}
