import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A perk unlocked by a talent-track level.
 *
 * **The name is DERIVED.** Obfuscated in all three trees (`_SafeCls_4371` here, `class_4056` in
 * `win63_version`, and PRODUCTION has no counterpart at all); named for its single member and for
 * the `rewardPerks` collection that holds it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2740/_SafeCls_4371.as
 */
export class TalentTrackRewardPerk
{
    // AS3: _SafeCls_4371.as::get perkId()
    public readonly perkId: string;

    // AS3: _SafeCls_4371.as::_SafeCls_4371()
    constructor(wrapper: IMessageDataWrapper)
    {
        this.perkId = wrapper.readString();
    }
}
