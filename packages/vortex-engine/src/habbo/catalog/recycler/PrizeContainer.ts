import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {HabboCatalog} from '../HabboCatalog';
import {PrizeGridItem} from './PrizeGridItem';

/**
 * A single recycler prize (plain product, not a deal bundle).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeContainer.as
 */
export class PrizeContainer extends PrizeGridItem
{
    private _productItemType: string;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeContainer.as::get productItemType()
    get productItemType(): string
    {
        return this._productItemType;
    }

    private _productItemTypeId: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeContainer.as::get productItemTypeId()
    get productItemTypeId(): number
    {
        return this._productItemTypeId;
    }

    private _furnitureData: IFurnitureData | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeContainer.as::get gridItem()
    // AS3 names this `gridItem` and types it `PrizeGridItem` but only ever assigns it from a
    // constructor param it never actually receives (dead field in the source) - kept for fidelity.
    get gridItem(): PrizeGridItem | null
    {
        return null;
    }

    private _oddsLevelId: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeContainer.as::get oddsLevelId()
    get oddsLevelId(): number
    {
        return this._oddsLevelId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeContainer.as::PrizeContainer()
    constructor(productItemType: string, productItemTypeId: number, furnitureData: IFurnitureData | null, oddsLevelId: number, catalog: HabboCatalog)
    {
        super(catalog);
        this._productItemType = productItemType;
        this._productItemTypeId = productItemTypeId;
        this._furnitureData = furnitureData;
        this._oddsLevelId = oddsLevelId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeContainer.as::setIcon()
    setIcon(roomEngine: IRoomEngine | null): void
    {
        if(roomEngine == null) return;

        this.initProductIcon(roomEngine, this._productItemType, this._productItemTypeId);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeContainer.as::get title()
    get title(): string
    {
        if(this._furnitureData == null)
        {
            if(this._productItemType === 'chat_style')
            {
                const productData = this.catalog?.getProductData(`chat_bubble_${this._productItemTypeId}`) ?? null;

                return productData != null ? productData.name : '';
            }

            return '';
        }

        return this._furnitureData.localizedName;
    }
}
