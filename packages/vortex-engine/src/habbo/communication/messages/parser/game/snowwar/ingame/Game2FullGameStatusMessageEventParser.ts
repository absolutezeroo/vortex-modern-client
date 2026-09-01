import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {FullGameStatusData} from '../data/FullGameStatusData';

/**
 * The whole arena, sent when the client admits it has lost sync. It carries every game object plus
 * one `GameStatusData`, and the handler rebuilds the stage from scratch off it.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4363` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4228/_SafeCls_4363.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/ingame/Game2FullGameStatusMessageEventParser.as
 */
export class Game2FullGameStatusMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4363.as::_SafeStr_9882
    private _fullStatus: FullGameStatusData | null = null;

    // AS3: _SafeCls_4363.as::get fullStatus()
    get fullStatus(): FullGameStatusData | null
    {
        return this._fullStatus;
    }

    // AS3: _SafeCls_4363.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: _SafeCls_4363.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._fullStatus = new FullGameStatusData(wrapper);

        return true;
    }
}
