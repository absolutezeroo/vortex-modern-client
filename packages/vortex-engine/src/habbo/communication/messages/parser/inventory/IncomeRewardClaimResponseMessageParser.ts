import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The answer to a claim — header 2984, corroborated by vortex-emulator's
 * `IncomeRewardClaimResponseMessageComposer`.
 *
 * `rewardCategory` is -1 when the player used "claim all", which is what tells the view to reset
 * every row rather than one.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3468/_SafeCls_3467.as
 */
export class IncomeRewardClaimResponseMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3467.as::_SafeStr_8286 (name derived: backs rewardCategory)
    private _rewardCategory: number = 0;

    // AS3: _SafeCls_3467.as::_SafeStr_5699 (name derived: backs result)
    private _result: boolean = false;

    // AS3: _SafeCls_3467.as::get rewardCategory()
    get rewardCategory(): number
    {
        return this._rewardCategory;
    }

    // AS3: _SafeCls_3467.as::get result()
    get result(): boolean
    {
        return this._result;
    }

    /**
	 * AS3's `flush()` returns true without resetting either field — transcribed, because a failed
	 * parse would otherwise leave the previous claim's values readable and the view would re-enable
	 * the wrong button.
	 */
    // AS3: _SafeCls_3467.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_3467.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._rewardCategory = wrapper.readByte();
        this._result = wrapper.readBoolean();

        return true;
    }
}
