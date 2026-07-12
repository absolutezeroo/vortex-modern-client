import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {HabboCatalog} from '../HabboCatalog';
import {HabboCatalogUtils} from '../HabboCatalogUtils';
import type {PrizeMessageSubProduct} from '@habbo/communication/messages/incoming/catalog/PrizeMessageSubProduct';
import {PrizeContainer} from './PrizeContainer';

/**
 * A recycler "deal" prize: a bundle of several sub-products shown as one grid item.
 *
 * AS3 also loads a "gridItem" XML layout asset into a private field here (`_gridItemLayout`) but
 * never reads it anywhere in the class - dead code from the decompiled source, not ported.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/DealPrizeContainer.as
 */
export class DealPrizeContainer extends PrizeContainer
{
    private _subProducts: PrizeMessageSubProduct[];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/DealPrizeContainer.as::get subProducts()
    get subProducts(): PrizeMessageSubProduct[]
    {
        return this._subProducts;
    }

    private _furnitureDatas: (IFurnitureData | null)[];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/DealPrizeContainer.as::get furnitureDatas()
    get furnitureDatas(): (IFurnitureData | null)[]
    {
        return this._furnitureDatas;
    }

    private _dealIconNarrow: ImageBitmap | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/DealPrizeContainer.as::DealPrizeContainer()
    constructor(subProducts: PrizeMessageSubProduct[], oddsLevelId: number, catalog: HabboCatalog)
    {
        super('deal', -1, null, oddsLevelId, catalog);

        this._subProducts = subProducts;
        this._furnitureDatas = subProducts.map((sub) => catalog.getFurnitureData(sub.productItemTypeId, sub.productItemType));

        const asset = catalog.assets?.getAssetByName('ctlg_pic_deal_icon_narrow') ?? null;

        this._dealIconNarrow = (asset?.content as ImageBitmap | null) ?? null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/DealPrizeContainer.as::setIcon()
    override setIcon(_roomEngine: IRoomEngine | null): void
    {
        const image = this.view.findChildByName('image') as unknown as IBitmapWrapperWindow | null;

        if(image != null && this._dealIconNarrow != null)
        {
            HabboCatalogUtils.replaceCenteredImage(image, this._dealIconNarrow);
        }

        const counter = this.view.findChildByName('bundleCounter') as unknown as ITextWindow | null;

        if(counter != null) counter.text = this._subProducts.length.toString();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/DealPrizeContainer.as::get title()
    override get title(): string
    {
        return '';
    }
}
