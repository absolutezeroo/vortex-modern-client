/**
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecyclerVisualization.as
 */
export interface IRecyclerVisualization
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecyclerVisualization.as::updateUI()
    updateUI(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecyclerVisualization.as::updateSlots()
    updateSlots(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecyclerVisualization.as::updateRecycleButton()
    updateRecycleButton(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/IRecyclerVisualization.as::get disposed()
    readonly disposed: boolean;
}
