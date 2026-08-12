import type {IInventoryModel} from '../IInventoryModel';

/**
 * The inventory half of the recycler.
 *
 * AS3 declares no `IRecyclerModel` — `RecyclerModel` is referenced by its concrete type
 * everywhere. This interface exists so the port's `HabboInventory` can expose the model without
 * importing the class, matching how the other category models are surfaced.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/recycler/RecyclerModel.as
 */
export interface IRecyclerModel extends IInventoryModel
{
    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::get running()
    readonly running: boolean;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::get state()
    state: number;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::startRecycler()
    startRecycler(): void;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::stopRecycler()
    stopRecycler(): void;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::lockSelectedFurni()
    lockSelectedFurni(): number;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::releaseFurni()
    releaseFurni(itemId: number): boolean;

    // AS3: .../src/com/sulake/habbo/inventory/recycler/RecyclerModel.as::getOwnItemsInRecycler()
    getOwnItemsInRecycler(): number[];
}
