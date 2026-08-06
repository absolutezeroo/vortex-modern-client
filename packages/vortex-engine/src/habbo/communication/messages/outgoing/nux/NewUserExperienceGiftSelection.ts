/**
 * The user's pick for one NUX step: which gift, for which day and step.
 *
 * `NuxGiftSelectionView` builds one per step as the user clicks through, and hands the whole
 * collection to `NewUserExperienceGetGiftsMessageComposer` once the last step is answered.
 *
 * `giftIndex` is the option's **row index in the list window**, not a product id — AS3 takes it
 * from `getListItemIndex()` on the clicked button's parent.
 *
 * **Derived name.** The class is obfuscated in every tree: `_SafeCls_3003` in WIN63, `class_2597`
 * in win63_version, and PRODUCTION has no outgoing `nux` package at all. Only its three members
 * are readable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_3003.as
 */
export class NewUserExperienceGiftSelection
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_3003.as::_SafeStr_9089
    private _dayIndex: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_3003.as::_SafeStr_9011
    private _stepIndex: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_3003.as::_SafeStr_9860
    private _giftIndex: number;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_3003.as::_SafeCls_3003()
    constructor(dayIndex: number, stepIndex: number, giftIndex: number)
    {
        this._dayIndex = dayIndex;
        this._stepIndex = stepIndex;
        this._giftIndex = giftIndex;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_3003.as::get dayIndex()
    get dayIndex(): number
    {
        return this._dayIndex;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_3003.as::get stepIndex()
    get stepIndex(): number
    {
        return this._stepIndex;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2937/_SafeCls_3003.as::get giftIndex()
    get giftIndex(): number
    {
        return this._giftIndex;
    }
}
