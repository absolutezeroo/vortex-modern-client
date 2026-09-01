import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A player left the running arena, named twice — by user id and by game-object id.
 *
 * The handler only logs it; the object is actually removed by the `HumanLeftGameEvent` that comes
 * through the turn queue, which is why nothing here touches the stage.
 *
 * AS3's `flush()` assigns `NaN` to two `int` fields, which in AS3 coerces to 0. The port writes the
 * 0 rather than reproducing a `NaN` a TypeScript `number` would actually keep.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4092` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4092.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2PlayerExitedGameArenaMessageEventParser.as
 */
export class Game2PlayerExitedGameArenaMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4092.as::_SafeStr_5971
    private _userId: number = 0;

    // AS3: _SafeCls_4092.as::_SafeStr_8005
    private _playerGameObjectId: number = 0;

    // AS3: _SafeCls_4092.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: _SafeCls_4092.as::get playerGameObjectId()
    get playerGameObjectId(): number
    {
        return this._playerGameObjectId;
    }

    // AS3: _SafeCls_4092.as::flush()
    flush(): boolean
    {
        this._userId = 0;
        this._playerGameObjectId = 0;

        return true;
    }

    // AS3: _SafeCls_4092.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._userId = wrapper.readInt();
        this._playerGameObjectId = wrapper.readInt();

        return true;
    }
}
