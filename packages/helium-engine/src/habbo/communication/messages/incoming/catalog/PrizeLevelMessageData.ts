import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PrizeMessageData} from './PrizeMessageData';

/**
 * One prize level (star tier) of the recycler prize table, holding every prize won at that tier.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/PrizeLevelMessageData.as
 */
export class PrizeLevelMessageData
{
    private _prizeLevelId: number = 0;

    get prizeLevelId(): number
    {
        return this._prizeLevelId;
    }

    private _probabilityDenominator: number = 0;

    get probabilityDenominator(): number
    {
        return this._probabilityDenominator;
    }

    private _prizes: PrizeMessageData[] = [];

    get prizes(): PrizeMessageData[]
    {
        return this._prizes;
    }

    constructor(wrapper: IMessageDataWrapper)
    {
        this._prizeLevelId = wrapper.readInt();
        this._probabilityDenominator = wrapper.readInt();

        this._prizes = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._prizes.push(new PrizeMessageData(wrapper));
        }

        // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/PrizeLevelMessageData.as::PrizeLevelMessageData()
        // sorts prizes by productCode after parsing.
        this._prizes.sort((a, b) => a.productCode.localeCompare(b.productCode));
    }
}
