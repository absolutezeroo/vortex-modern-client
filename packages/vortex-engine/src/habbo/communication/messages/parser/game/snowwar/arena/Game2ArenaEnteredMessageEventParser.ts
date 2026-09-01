import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {Game2PlayerData} from '../data/Game2PlayerData';

/**
 * One player finished entering the arena.
 *
 * The handler reads `player` into a local and does nothing with it — that is AS3's own body, not an
 * omission here, and it is why the port's handler will look equally pointless.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4179` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4179.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2ArenaEnteredMessageEventParser.as
 */
export class Game2ArenaEnteredMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4179.as::_SafeStr_4735
    private _player: Game2PlayerData | null = null;

    // AS3: _SafeCls_4179.as::get player()
    get player(): Game2PlayerData | null
    {
        return this._player;
    }

    // AS3: _SafeCls_4179.as::flush()
    flush(): boolean
    {
        if(this._player)
        {
            this._player.dispose();
            this._player = null;
        }

        return true;
    }

    // AS3: _SafeCls_4179.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._player = new Game2PlayerData();
        this._player.parse(wrapper);

        return true;
    }
}
