/**
 * One habbicon as the hub draws it — the shop row and the player's relationship to it, flattened
 * into the booleans the views actually test.
 *
 * The flags are not independent: `HabbiconView.buildEntry()` derives all four from `state`, so
 * `favorite` implies `owned`, and `purchasable` is only ever true at state 0 with a price attached.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconEntryModel.as
 */
export class HabbiconEntryModel
{
    // AS3: HabbiconEntryModel.as::id
    id: string = '';

    // AS3: HabbiconEntryModel.as::habbiconId
    habbiconId: number = 0;

    // AS3: HabbiconEntryModel.as::collectionId
    collectionId: number = 0;

    // AS3: HabbiconEntryModel.as::collectionName
    collectionName: string = '';

    // AS3: HabbiconEntryModel.as::collectionTitle
    collectionTitle: string = '';

    // AS3: HabbiconEntryModel.as::name
    name: string = '';

    // AS3: HabbiconEntryModel.as::description
    description: string = '';

    // AS3: HabbiconEntryModel.as::_SafeStr_10184 (name derived: its slot in the set's grid)
    index: number = 0;

    // AS3: HabbiconEntryModel.as::state
    state: number = 0;

    // AS3: HabbiconEntryModel.as::owned
    owned: boolean = false;

    // AS3: HabbiconEntryModel.as::favorite
    favorite: boolean = false;

    // AS3: HabbiconEntryModel.as::claimable
    claimable: boolean = false;

    // AS3: HabbiconEntryModel.as::purchasable
    purchasable: boolean = false;

    // AS3: HabbiconEntryModel.as::isReward
    isReward: boolean = false;

    // AS3: HabbiconEntryModel.as::priceCredits
    priceCredits: number = 0;

    // AS3: HabbiconEntryModel.as::priceActivityPoints
    priceActivityPoints: number = 0;

    // AS3: HabbiconEntryModel.as::activityPointType
    activityPointType: number = 0;

    // AS3: HabbiconEntryModel.as::color
    color: number = 0;
}
