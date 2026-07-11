import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboCatalog} from '../../../../HabboCatalog';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ExtraInfoItemData} from '../ExtraInfoItemData';
import {ExtraInfoListItem} from '../ExtraInfoListItem';

/**
 * Bonus-badge row. Renders nothing (getRenderedWindow() returns null in AS3 too) - the badge
 * image-ready/failed callbacks are likewise empty in the primary source, so this type is inert
 * wherever it's actually constructed (ExtraInfoViewManager.addItem() case 3, never triggered by
 * BundlePurchaseExtraInfoWidget itself - see that widget's port notes).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/bundlepurchaseinfodisplay/listitem/ExtraInfoBonusBadgeItem.as
 */
export class ExtraInfoBonusBadgeItem extends ExtraInfoListItem implements IGetImageListener
{
    private _catalog: HabboCatalog;

    constructor(id: number, data: ExtraInfoItemData, catalog: HabboCatalog)
    {
        super(null, id, data, 0);
        this._catalog = catalog;
    }

    override getRenderedWindow(): IWindowContainer | null
    {
        return null;
    }

    imageReady(_id: number, _data: ImageBitmap | null): void
    {
    }

    imageFailed(_id: number): void
    {
    }
}
