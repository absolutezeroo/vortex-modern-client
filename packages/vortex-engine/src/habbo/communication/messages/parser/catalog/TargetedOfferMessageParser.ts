import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {TargetedOfferData} from '../../incoming/catalog/TargetedOfferData';

/**
 * The one targeted offer the server has picked for this player (header 2155).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_3151.as
 * (obfuscated; identified as this parser by `_SafeCls_3741`, the event registered as
 * `_SafeStr_4546[2155]` in
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, whose
 * `getParser()` returns it. `vortex-emulator` corroborates the header:
 * `Revision20260701/Headers.cs::TargetedOfferComposer = 2155`.)
 */
export class TargetedOfferMessageParser implements IMessageParser
{
    // AS3: .../src/unknowns/_SafePkg_1714/_SafeCls_3151.as::_SafeStr_4556 (name from `get data()`)
    private _data: TargetedOfferData | null = null;

    // AS3: .../src/unknowns/_SafePkg_1714/_SafeCls_3151.as::get data()
    get data(): TargetedOfferData | null
    {
        return this._data;
    }

    // AS3: .../src/unknowns/_SafePkg_1714/_SafeCls_3151.as::flush()
    flush(): boolean
    {
        this._data = null;

        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_1714/_SafeCls_3151.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new TargetedOfferData().parse(wrapper);

        return true;
    }
}
