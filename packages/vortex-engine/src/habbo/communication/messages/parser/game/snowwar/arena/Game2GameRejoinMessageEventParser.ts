import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The room the player came from, so the client can put them back after the game.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4448` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4448.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2GameRejoinMessageEventParser.as
 */
export class Game2GameRejoinMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4448.as::_roomBeforeGame
    private _roomBeforeGame: number = -1;

    // AS3: _SafeCls_4448.as::get roomBeforeGame()
    get roomBeforeGame(): number
    {
        return this._roomBeforeGame;
    }

    // AS3: _SafeCls_4448.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: _SafeCls_4448.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomBeforeGame = wrapper.readInt();

        return true;
    }
}
