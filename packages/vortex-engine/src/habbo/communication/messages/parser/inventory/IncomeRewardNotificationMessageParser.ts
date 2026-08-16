import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * "Something new landed in your vault" — header 1914, corroborated by vortex-emulator's
 * `IncomeRewardNotificationMessageComposer`.
 *
 * It carries the category and nothing else; the controller answers by re-asking for the full status
 * rather than trusting the push, so the single byte is only ever a trigger.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3468/_SafeCls_4029.as
 */
export class IncomeRewardNotificationMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4029.as::_SafeStr_8286 (name derived: backs rewardCategory)
    private _rewardCategory: number = 0;

    // AS3: _SafeCls_4029.as::get rewardCategory()
    get rewardCategory(): number
    {
        return this._rewardCategory;
    }

    // AS3: _SafeCls_4029.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4029.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._rewardCategory = wrapper.readByte();

        return true;
    }
}
