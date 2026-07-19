import type {PrizeLevelMessageData} from '@habbo/communication/messages/incoming/catalog/PrizeLevelMessageData';
import type {HabboCatalog} from '../HabboCatalog';
import {DealPrizeContainer} from './DealPrizeContainer';
import {PrizeContainer} from './PrizeContainer';

/**
 * One prize level (star tier) of the recycler prize table, holding every prize at that tier.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeLevelContainer.as
 */
export class PrizeLevelContainer
{
    private _prizeLevelId: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeLevelContainer.as::get prizeLevelId()
    get prizeLevelId(): number
    {
        return this._prizeLevelId;
    }

    private _prizes: PrizeContainer[];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeLevelContainer.as::get prizes()
    get prizes(): PrizeContainer[]
    {
        return this._prizes;
    }

    private _probabilityDenominator: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeLevelContainer.as::get probabilityDenominator()
    get probabilityDenominator(): number
    {
        return this._probabilityDenominator;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/recycler/PrizeLevelContainer.as::PrizeLevelContainer()
    constructor(data: PrizeLevelMessageData, catalog: HabboCatalog)
    {
        this._prizeLevelId = data.prizeLevelId;
        this._probabilityDenominator = data.probabilityDenominator;

        this._prizes = [];

        for(const prize of data.prizes)
        {
            if(prize.isDeal)
            {
                this._prizes.push(new DealPrizeContainer(prize.subProducts, this._prizeLevelId, catalog));
            }
            else
            {
                const furnitureData = catalog.getFurnitureData(prize.productItemTypeId, prize.productItemType);

                this._prizes.push(new PrizeContainer(prize.productItemType, prize.productItemTypeId, furnitureData, this._prizeLevelId, catalog));
            }
        }
    }
}
