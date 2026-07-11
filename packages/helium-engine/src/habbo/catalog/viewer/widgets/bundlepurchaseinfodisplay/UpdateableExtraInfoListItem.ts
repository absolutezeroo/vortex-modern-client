import type {BundlePurchaseExtraInfoWidget} from '../BundlePurchaseExtraInfoWidget';
import type {ExtraInfoItemData} from './ExtraInfoItemData';
import {ExtraInfoListItem} from './ExtraInfoListItem';

/**
 * An ExtraInfoListItem that can refresh its data/display in place instead of being recreated.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/UpdateableExtraInfoListItem.as
 */
export class UpdateableExtraInfoListItem extends ExtraInfoListItem
{
    constructor(
        widget: BundlePurchaseExtraInfoWidget | null,
        id: number,
        data: ExtraInfoItemData,
        alignment: number = 0,
        alwaysOnTop: boolean = false
    )
    {
        super(widget, id, data, alignment, alwaysOnTop);
    }

    update(data: ExtraInfoItemData): void
    {
        this.data = data;
    }
}
