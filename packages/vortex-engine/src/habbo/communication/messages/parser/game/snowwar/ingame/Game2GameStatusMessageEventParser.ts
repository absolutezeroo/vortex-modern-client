import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GameStatusData} from '../data/GameStatusData';

/**
 * One turn: its number, its checksum, and the events the server replayed on it. This is the
 * message the whole lock-step loop runs on — it arrives every turn and nothing else advances the
 * arena.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4227` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4228/_SafeCls_4227.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/ingame/Game2GameStatusMessageEventParser.as
 */
export class Game2GameStatusMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4227.as::_status
    private _status: GameStatusData | null = null;

    // AS3: _SafeCls_4227.as::get status()
    get status(): GameStatusData | null
    {
        return this._status;
    }

    // AS3: _SafeCls_4227.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: _SafeCls_4227.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._status = new GameStatusData(wrapper);

        return true;
    }
}
