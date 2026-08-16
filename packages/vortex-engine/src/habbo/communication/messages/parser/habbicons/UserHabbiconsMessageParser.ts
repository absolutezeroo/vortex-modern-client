import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

import type {OwnedHabbiconData} from '@habbo/communication/messages/incoming/habbicons/OwnedHabbiconData';
import {readOwnedHabbicon} from './HabbiconRowReaders';

/**
 * Everything the player owns, plus the most recently used ids — header 3728
 * (`_SafeCls_2046.as::_events[3728]`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4082/_SafeCls_4256.as
 */
export class UserHabbiconsMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4256.as::_SafeStr_6374 (name derived: the owned rows)
    private _habbicons: OwnedHabbiconData[] = [];

    // AS3: _SafeCls_4256.as::_SafeStr_5260 (name derived: the recent ids)
    private _recentHabbiconIds: number[] = [];

    // AS3: _SafeCls_4256.as::get habbicons()
    get habbicons(): OwnedHabbiconData[]
    {
        return this._habbicons;
    }

    // AS3: _SafeCls_4256.as::get recentHabbiconIds()
    get recentHabbiconIds(): number[]
    {
        return this._recentHabbiconIds;
    }

    // AS3: _SafeCls_4256.as::flush()
    flush(): boolean
    {
        this._habbicons = [];
        this._recentHabbiconIds = [];

        return true;
    }

    // AS3: _SafeCls_4256.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._habbicons = [];
        this._recentHabbiconIds = [];

        let count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._habbicons.push(readOwnedHabbicon(wrapper));
        }

        count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._recentHabbiconIds.push(wrapper.readInt());
        }

        return true;
    }
}
