/**
 * An item a `ThumbListManager` can draw into its strip: an icon and a selected flag.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/IThumbListDrawableItem.as
 */
export interface IThumbListDrawableItem
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/IThumbListDrawableItem.as::get iconImage()
    iconImage: ImageBitmap | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/IThumbListDrawableItem.as::get isSelected()
    isSelected: boolean;
}
