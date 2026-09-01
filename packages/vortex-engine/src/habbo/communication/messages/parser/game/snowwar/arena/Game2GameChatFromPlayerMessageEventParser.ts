import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A line of chat from inside the arena. It goes to `SnowWarEngine.addChatMessage()`, which turns it
 * into a `GameChatEvent` on the game manager's bus for the free-flow chat to render.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4175` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4175.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2GameChatFromPlayerMessageEventParser.as
 */
export class Game2GameChatFromPlayerMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4175.as::_SafeStr_5971
    private _userId: number = -1;

    // AS3: _SafeCls_4175.as::_chatMessage
    private _chatMessage: string = '';

    // AS3: _SafeCls_4175.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: _SafeCls_4175.as::get chatMessage()
    get chatMessage(): string
    {
        return this._chatMessage;
    }

    // AS3: _SafeCls_4175.as::flush()
    flush(): boolean
    {
        this._userId = -1;
        this._chatMessage = '';

        return true;
    }

    // AS3: _SafeCls_4175.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._userId = wrapper.readInt();
        this._chatMessage = wrapper.readString();

        return true;
    }
}
