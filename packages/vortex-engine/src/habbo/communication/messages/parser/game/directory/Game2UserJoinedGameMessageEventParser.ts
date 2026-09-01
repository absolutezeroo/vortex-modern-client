import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GameLobbyPlayerData} from '../snowwar/data/GameLobbyPlayerData';

/**
 * A player joined the lobby, plus a flag saying whether the server moved them to the other team to
 * balance it. Nothing in this client reads that flag — `SnowWarEngine.userJoined()` takes the
 * player alone — but it is on the wire and must be consumed, or every field after it shifts.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4412` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/_SafeCls_4412.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/directory/Game2UserJoinedGameMessageEventParser.as
 */
export class Game2UserJoinedGameMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4412.as::_SafeStr_10126
    private _user: GameLobbyPlayerData | null = null;

    // AS3: _SafeCls_4412.as::_SafeStr_9303
    private _wasTeamSwitched: boolean = false;

    // AS3: _SafeCls_4412.as::get user()
    get user(): GameLobbyPlayerData | null
    {
        return this._user;
    }

    // AS3: _SafeCls_4412.as::get wasTeamSwitched()
    get wasTeamSwitched(): boolean
    {
        return this._wasTeamSwitched;
    }

    // AS3: _SafeCls_4412.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: _SafeCls_4412.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._user = new GameLobbyPlayerData(wrapper);
        this._wasTeamSwitched = wrapper.readBoolean();

        return true;
    }
}
