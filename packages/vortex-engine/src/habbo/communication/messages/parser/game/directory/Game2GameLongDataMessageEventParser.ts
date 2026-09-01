import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GameLobbyData} from '../snowwar/data/GameLobbyData';

/**
 * The same `GameLobbyData` as *game created*, on its own header. The handler treats the two
 * identically — both end in `SnowWarEngine.createLobby()` — and byte for byte they are the same
 * message; only the id differs.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4343` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/_SafeCls_4343.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/directory/Game2GameLongDataMessageEventParser.as
 */
export class Game2GameLongDataMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4343.as::_SafeStr_8930
    private _gameLobbyData: GameLobbyData | null = null;

    // AS3: _SafeCls_4343.as::get gameLobbyData()
    get gameLobbyData(): GameLobbyData | null
    {
        return this._gameLobbyData;
    }

    // AS3: _SafeCls_4343.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: _SafeCls_4343.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._gameLobbyData = new GameLobbyData(wrapper);

        return true;
    }
}
