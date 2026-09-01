import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Loading progress for the whole arena, plus the ids of the players who are already done — the
 * loading screen ticks them off as they arrive.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4414` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4414.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2StageStillLoadingMessageEventParser.as
 */
export class Game2StageStillLoadingMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4414.as::_SafeStr_9596
    private _percentage: number = 0;

    // AS3: _SafeCls_4414.as::_SafeStr_8454
    private _finishedPlayers: number[] = [];

    // AS3: _SafeCls_4414.as::get percentage()
    get percentage(): number
    {
        return this._percentage;
    }

    // AS3: _SafeCls_4414.as::get finishedPlayers()
    get finishedPlayers(): number[]
    {
        return this._finishedPlayers;
    }

    // AS3: _SafeCls_4414.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: _SafeCls_4414.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._percentage = wrapper.readInt();
        this._finishedPlayers = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._finishedPlayers.push(wrapper.readInt());
        }

        return true;
    }
}
