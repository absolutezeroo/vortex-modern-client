/**
 * The one thing a `Badge` thumbnail calls back into when it is clicked.
 *
 * `BadgesModel` implements it. AS3 hands `Badge` the whole model; the narrow contract keeps
 * the data class from importing the model that owns it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/Badge.as
 */
export interface IBadgeSelectionTarget
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/badges/BadgesModel.as::setBadgeSelected()
    setBadgeSelected(badgeId: string): void;
}
