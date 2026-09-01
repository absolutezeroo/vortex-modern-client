import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A player left the lobby. The id is the *user* id, not the game-object id — the lobby list is
 * keyed by user, the arena by game object.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2UserLeftGameMessageParser.as
 */
export class Game2UserLeftGameMessageParser implements IMessageParser
{
    // AS3: Game2UserLeftGameMessageParser.as::_SafeStr_5971
    private _userId: number = 0;

    // AS3: Game2UserLeftGameMessageParser.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: Game2UserLeftGameMessageParser.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: Game2UserLeftGameMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._userId = wrapper.readInt();

        return true;
    }
}
