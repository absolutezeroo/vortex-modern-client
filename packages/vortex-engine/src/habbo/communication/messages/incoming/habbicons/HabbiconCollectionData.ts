import type {HabbiconShopItemData} from './HabbiconShopItemData';

/**
 * A shop collection: its habbicons, a bundle price for buying the lot, and the reward habbicon that
 * completing it unlocks.
 *
 * **`rewardHabbiconId` and `rewardState` are named from behaviour, not recovered.** The dump calls
 * them `_SafeStr_5049`/`_SafeStr_7245` and no tree carries the real names — habbicons postdate the
 * 2016 build and `win63_version` has none. `HabbiconController.markCollectionRewardClaimable()`
 * settles what they are: it keys the *owned-habbicon* dictionary by `_SafeStr_5049` and writes
 * `HabbiconState.CLAIMABLE` into `_SafeStr_7245`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1920/_SafeCls_3291.as
 */
export class HabbiconCollectionData
{
    // AS3: _SafeCls_3291.as::collectionId
    collectionId: number = 0;

    // AS3: _SafeCls_3291.as::name
    name: string = '';

    // AS3: _SafeCls_3291.as::completed
    completed: boolean = false;

    // AS3: _SafeCls_3291.as::_SafeStr_5049 (name derived: the reward habbicon's id)
    rewardHabbiconId: number = 0;

    // AS3: _SafeCls_3291.as::_SafeStr_7245 (name derived: the reward habbicon's state)
    rewardState: number = 0;

    // AS3: _SafeCls_3291.as::priceCredits
    priceCredits: number = 0;

    // AS3: _SafeCls_3291.as::priceActivityPoints
    priceActivityPoints: number = 0;

    // AS3: _SafeCls_3291.as::activityPointType
    activityPointType: number = 0;

    // AS3: _SafeCls_3291.as::habbicons
    habbicons: HabbiconShopItemData[] = [];
}
