import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One reward line of a daily task.
 *
 * **The class name is derived, not recovered.** The type is obfuscated in every available tree
 * (`_SafeCls_4416` in the primary dump, `class_3743` in `win63_version`, absent from the 2016
 * PRODUCTION build), so only its member names survive. `DailyTaskRewardData` follows this
 * folder's own `*Data` convention for parser-side DTOs.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as
 */
export class DailyTaskRewardData
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as::_SafeCls_4416()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._productItemTypeId = wrapper.readShort();
        this._rewardTypeId = wrapper.readString();
        this._extraParams = wrapper.readString();
        this._amount = wrapper.readInt();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as::productItemTypeId
    private _productItemTypeId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as::get productItemTypeId()
    get productItemTypeId(): number
    {
        return this._productItemTypeId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as::rewardTypeId
    private _rewardTypeId: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as::get rewardTypeId()
    get rewardTypeId(): string
    {
        return this._rewardTypeId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as::extraParams
    private _extraParams: string = '';

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as::get extraParams()
    get extraParams(): string
    {
        return this._extraParams;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as::amount
    private _amount: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2992/_SafeCls_4416.as::get amount()
    get amount(): number
    {
        return this._amount;
    }
}
