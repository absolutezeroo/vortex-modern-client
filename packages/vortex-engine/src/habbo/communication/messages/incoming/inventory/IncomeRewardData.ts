/**
 * One line of the vault: a category, what kind of currency it is, how much, and — for a furniture
 * reward — which product.
 *
 * **The status message sends one of these per (category, type) pair**, not one per category, so a
 * category that owes both credits and duckets arrives as two rows. `EarningsView` sums them itself.
 *
 * Name RECOVERED from vortex-emulator's `IncomeRewardStatusMessageComposer` (3976); the members kept
 * their real names through obfuscation.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3468/_SafeCls_3776.as
 */
export class IncomeRewardData
{
    // AS3: _SafeCls_3776.as::_SafeStr_8286 (name derived: backs rewardCategory)
    private _rewardCategory: number;

    // AS3: _SafeCls_3776.as::_SafeStr_6986 (name derived: backs rewardType)
    private _rewardType: number;

    // AS3: _SafeCls_3776.as::_amount
    private _amount: number;

    // AS3: _SafeCls_3776.as::_productCode
    private _productCode: string;

    // AS3: _SafeCls_3776.as::_SafeCls_3776()
    constructor(rewardCategory: number, rewardType: number, amount: number, productCode: string)
    {
        this._rewardCategory = rewardCategory;
        this._rewardType = rewardType;
        this._amount = amount;
        this._productCode = productCode;
    }

    // AS3: _SafeCls_3776.as::get rewardCategory()
    get rewardCategory(): number
    {
        return this._rewardCategory;
    }

    /**
	 * 0 is duckets, 1 is credits — the two branches `EarningsView.onIncomeRewardDataReceived()` sums
	 * separately. AS3 names neither.
	 */
    // AS3: _SafeCls_3776.as::get rewardType()
    get rewardType(): number
    {
        return this._rewardType;
    }

    // AS3: _SafeCls_3776.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: _SafeCls_3776.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }
}
