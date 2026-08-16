import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

import type {HabbiconCollectionData} from '@habbo/communication/messages/incoming/habbicons/HabbiconCollectionData';
import {readHabbiconCollection} from './HabbiconRowReaders';

/**
 * The whole shop, collection by collection — header 3765
 * (`_SafeCls_2046.as::_events[3765]`). Asked for once and cached; the controller re-asks only after
 * a purchase.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4082/_SafeCls_4183.as
 */
export class HabbiconShopDataMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4183.as::_SafeStr_6299 (name derived: the collection rows)
    private _collections: HabbiconCollectionData[] = [];

    // AS3: _SafeCls_4183.as::get collections()
    get collections(): HabbiconCollectionData[]
    {
        return this._collections;
    }

    // AS3: _SafeCls_4183.as::flush()
    flush(): boolean
    {
        this._collections = [];

        return true;
    }

    // AS3: _SafeCls_4183.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._collections = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._collections.push(readHabbiconCollection(wrapper));
        }

        return true;
    }
}
