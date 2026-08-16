import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

import type {HabbiconShopItemData} from '@habbo/communication/messages/incoming/habbicons/HabbiconShopItemData';
import {readHabbiconShopItem} from './HabbiconRowReaders';

/**
 * One habbicon's shop row, answering a `GetHabbiconInfoMessageComposer` — header 3714
 * (`_SafeCls_2046.as::_events[3714]`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4082/_SafeCls_4081.as
 */
export class HabbiconInfoMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4081.as::_SafeStr_8081 (name derived: the habbicon read)
    private _habbicon: HabbiconShopItemData | null = null;

    // AS3: _SafeCls_4081.as::get habbicon()
    get habbicon(): HabbiconShopItemData | null
    {
        return this._habbicon;
    }

    // AS3: _SafeCls_4081.as::flush()
    flush(): boolean
    {
        this._habbicon = null;

        return true;
    }

    // AS3: _SafeCls_4081.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._habbicon = readHabbiconShopItem(wrapper);

        return true;
    }
}
