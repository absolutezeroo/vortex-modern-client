/**
 * ITrophyView
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/trophy/ITrophyView.as
 *
 * The view half of the trophy widget. TrophyFurniWidget owns exactly one at a time and
 * swaps it whenever the engraving's view type changes.
 */
export interface ITrophyView
{
    // AS3: ITrophyView.as::dispose()
    dispose(): void;

    // AS3: ITrophyView.as::disposeInterface()
    disposeInterface(): void;

    // AS3: ITrophyView.as::showInterface()
    showInterface(): boolean;
}
