/**
 * One habbicon as the shop describes it — the collection it belongs to, its state for this player,
 * and the two prices (credits, and an activity-point currency named by `activityPointType`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1920/_SafeCls_2626.as
 */
export class HabbiconShopItemData
{
    // AS3: _SafeCls_2626.as::habbiconId
    habbiconId: number = 0;

    // AS3: _SafeCls_2626.as::name
    name: string = '';

    // AS3: _SafeCls_2626.as::collectionId
    collectionId: number = 0;

    // AS3: _SafeCls_2626.as::state
    state: number = 0;

    // AS3: _SafeCls_2626.as::priceCredits
    priceCredits: number = 0;

    // AS3: _SafeCls_2626.as::priceActivityPoints
    priceActivityPoints: number = 0;

    // AS3: _SafeCls_2626.as::activityPointType
    activityPointType: number = 0;
}
