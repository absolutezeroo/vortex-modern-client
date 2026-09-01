import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Someone pressed "play again" — the ending panel ticks that player as staying.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4428` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4428.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2PlayerRematchesMessageEventParser.as
 */
export class Game2PlayerRematchesMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4428.as::_SafeStr_5971
    private _userId: number = 0;

    // AS3: _SafeCls_4428.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: _SafeCls_4428.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4428.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._userId = wrapper.readInt();

        return true;
    }
}
