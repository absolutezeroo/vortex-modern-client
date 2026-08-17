import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A furniture or subscription product handed out by a talent-track level.
 *
 * **The name is DERIVED** — obfuscated in every tree (`_SafeCls_4370` / `class_3878`); named for
 * the `rewardProducts` collection that holds it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2740/_SafeCls_4370.as
 */
export class TalentTrackRewardProduct
{
    // AS3: _SafeCls_4370.as::get productCode()
    public readonly productCode: string;

    /** Non-zero only for a subscription reward. */
    // AS3: _SafeCls_4370.as::get vipDays()
    public readonly vipDays: number;

    // AS3: _SafeCls_4370.as::_SafeCls_4370()
    constructor(wrapper: IMessageDataWrapper)
    {
        this.productCode = wrapper.readString();
        this.vipDays = wrapper.readInt();
    }
}
