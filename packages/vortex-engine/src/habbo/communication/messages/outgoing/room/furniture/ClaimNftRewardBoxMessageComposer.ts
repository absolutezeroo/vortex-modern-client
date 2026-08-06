import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Open an NFT reward box, after the user confirms (ROFCAE_NFT_REWARD_BOX).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1741/_SafeCls_3198.as
 *
 * Header 3422, from WIN63's registry (`_SafeCls_2046.as::_composers[3422]`).
 *
 * **The class name is DERIVED, not recovered.** `_SafeCls_3198` is obfuscated in every available
 * tree, postdates the 2016 PRODUCTION build, and `vortex-emulator` has no constant on 3422 — so
 * there is no second source to take a real name from. The name here comes from its only call site:
 * `useObject()`'s `ROFCAE_NFT_REWARD_BOX` case, gated behind a
 * `${collectibles.reward_box.confirm_title}` dialog.
 *
 * Server support is absent for the same reason 3422 has no emulator constant: sending this today
 * reaches nothing.
 */
export class ClaimNftRewardBoxMessageComposer extends MessageComposer<ConstructorParameters<typeof ClaimNftRewardBoxMessageComposer>>
{
    private _data: ConstructorParameters<typeof ClaimNftRewardBoxMessageComposer>;

    constructor(objectId: number)
    {
        super();
        this._data = [objectId];
    }

    // AS3: .../src/unknowns/_SafePkg_1741/_SafeCls_3198.as::getMessageArray()
    getMessageArray()
    {
        return this._data;
    }
}
