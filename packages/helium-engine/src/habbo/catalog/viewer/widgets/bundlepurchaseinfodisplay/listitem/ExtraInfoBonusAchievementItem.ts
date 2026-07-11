import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ExtraInfoItemData} from '../ExtraInfoItemData';
import {ExtraInfoListItem} from '../ExtraInfoListItem';

/**
 * Bonus-achievement row. Renders nothing (getRenderedWindow() returns null in AS3 too) - inert
 * wherever it's actually constructed (ExtraInfoViewManager.addItem() case 4, never triggered by
 * BundlePurchaseExtraInfoWidget itself - see that widget's port notes).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoBonusAchievementItem.as
 */
export class ExtraInfoBonusAchievementItem extends ExtraInfoListItem
{
    constructor(id: number, data: ExtraInfoItemData)
    {
        super(null, id, data, 0);
    }

    override getRenderedWindow(): IWindowContainer | null
    {
        return null;
    }
}
