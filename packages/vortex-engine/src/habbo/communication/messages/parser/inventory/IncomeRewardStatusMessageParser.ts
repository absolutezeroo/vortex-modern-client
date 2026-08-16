import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {IncomeRewardData} from '@habbo/communication/messages/incoming/inventory/IncomeRewardData';

/**
 * Everything the vault currently owes the player — header 3976
 * (`_SafeCls_2046.as::_events[3976]`, corroborated by vortex-emulator's
 * `IncomeRewardStatusMessageComposer`).
 *
 * **The two counts are bytes and the amount is an int**, in that order; reading the category as an
 * int would eat the type and desync every row after the first.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3468/_SafeCls_3503.as
 */
export class IncomeRewardStatusMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3503.as::_SafeStr_4556 (name derived: the reward rows)
    private _data: IncomeRewardData[] = [];

    // AS3: _SafeCls_3503.as::get data()
    get data(): IncomeRewardData[]
    {
        return this._data;
    }

    // AS3: _SafeCls_3503.as::flush()
    flush(): boolean
    {
        this._data = [];

        return true;
    }

    // AS3: _SafeCls_3503.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._data.push(new IncomeRewardData(
                wrapper.readByte(),
                wrapper.readByte(),
                wrapper.readInt(),
                wrapper.readString()
            ));
        }

        return true;
    }
}
