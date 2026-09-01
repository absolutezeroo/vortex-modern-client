import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GameLobbyData} from '../snowwar/data/GameLobbyData';

/**
 * A lobby now exists — the client opens the lobby window on it, or folds it into the ending panel
 * if a game just finished.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4355` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/_SafeCls_4355.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/directory/Game2GameCreatedMessageEventParser.as
 */
export class Game2GameCreatedMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4355.as::_SafeStr_8930
    private _gameLobbyData: GameLobbyData | null = null;

    // AS3: _SafeCls_4355.as::get gameLobbyData()
    get gameLobbyData(): GameLobbyData | null
    {
        return this._gameLobbyData;
    }

    // AS3: _SafeCls_4355.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: _SafeCls_4355.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._gameLobbyData = new GameLobbyData(wrapper);

        return true;
    }
}
