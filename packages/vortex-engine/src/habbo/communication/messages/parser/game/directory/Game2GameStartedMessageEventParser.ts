import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GameLobbyData} from '../snowwar/data/GameLobbyData';

/**
 * The lobby is done waiting: this is the roster the loading screen is built from.
 *
 * One of three messages carrying a whole `GameLobbyData` — the other two are *created* and *long
 * data*, and each names the getter differently (`lobbyData` here, `gameLobbyData` there). The port
 * keeps both names rather than unifying them, because the handler reads them by name.
 *
 * Name recovered from `win63_version`'s readable filename; the class is `_SafeCls_4302` in the
 * primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/_SafeCls_4302.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/directory/Game2GameStartedMessageEventParser.as
 */
export class Game2GameStartedMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4302.as::_SafeStr_7890
    private _lobbyData: GameLobbyData | null = null;

    // AS3: _SafeCls_4302.as::get lobbyData()
    get lobbyData(): GameLobbyData | null
    {
        return this._lobbyData;
    }

    // AS3: _SafeCls_4302.as::flush()
    flush(): boolean
    {
        this._lobbyData = null;

        return true;
    }

    // AS3: _SafeCls_4302.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._lobbyData = new GameLobbyData(wrapper);

        return true;
    }
}
