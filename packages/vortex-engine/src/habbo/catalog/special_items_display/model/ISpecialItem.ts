import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';

/**
 * One entry in a special-items set.
 *
 * **Name DERIVED** — the AS3 interface is `_SafeCls_2380` and no tree recovers it. Named for what
 * it is: the item interface `AbstractSpecialItem` implements and `SpecialItemsView` renders.
 * It extends `IProductDisplayInfo` so a `ProductImageWidget` can draw it directly.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/special_items_display/model/_SafeCls_2380.as
 */
export interface ISpecialItem extends IProductDisplayInfo
{
    // AS3: _SafeCls_2380.as::get index()
    readonly index: number;

    // AS3: _SafeCls_2380.as::get itemKey()
    readonly itemKey: string;

    // AS3: _SafeCls_2380.as::get name()
    readonly name: string;

    // AS3: _SafeCls_2380.as::get description()
    readonly description: string;

    // AS3: _SafeCls_2380.as::get isValid()
    readonly isValid: boolean;
}
