import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Where in the arena queue this player is standing. The lobby window shows it and nothing else
 * reads it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2InArenaQueueMessageParser.as
 */
export class Game2InArenaQueueMessageParser implements IMessageParser
{
    // AS3: Game2InArenaQueueMessageParser.as::_SafeStr_6812
    private _position: number = 0;

    // AS3: Game2InArenaQueueMessageParser.as::get position()
    get position(): number
    {
        return this._position;
    }

    // AS3: Game2InArenaQueueMessageParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: Game2InArenaQueueMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._position = wrapper.readInt();

        return true;
    }
}
