/**
 * "Do I own this sellable clothing item?"
 *
 * TS-only: AS3 passes the whole `IHabboInventory` to `CategoryData.hasInvalidSellableItems()` and
 * `stripInvalidSellableItems()`, which call exactly one method on it. Narrowed to that method
 * because this port's `IHabboInventory` **does not have it yet**:
 *
 * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/HabboInventory.as
 * ::hasFigureSetIdInInventory() — AS3 backs it with a `Vector.<int>` of owned figure-set ids, fed
 * by a setter at HabboInventory.as:1086. Neither the list nor the setter is ported, so nothing can
 * currently answer this truthfully; a caller passing `null` gets "not owned" for everything, which
 * hides every sellable item rather than showing an unowned one. Port the list with the clothing
 * slice and have `HabboInventory` implement this interface then.
 */
export interface IFigureSetOwnership
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/_SafeCls_588.as::hasFigureSetIdInInventory()
    hasFigureSetIdInInventory(figureSetId: number): boolean;
}
