import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {StuffDataFactory} from '@habbo/room/object/data';
import {MarketPlaceOfferEntry} from './MarketPlaceOfferEntry';

/**
 * The win63_version copy of this parser (MarketPlaceOffersEventParser.as) is
 * decompiler-corrupted (constructs its offer object with all-zero/empty
 * literals instead of the just-read locals, then pushes `null` instead of the
 * constructed object, and its loop condition never terminates on the read
 * count) - this port follows the primary tree's `_SafeCls_2885`, which is
 * complete and internally consistent.
 *
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1932/_SafeCls_2885.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketPlaceOffersEventParser.as)
 */
export class MarketPlaceOffersEventParser implements IMessageParser
{
    private static readonly MAX_OFFERS: number = 500;

    private _offers: MarketPlaceOfferEntry[] = [];

    private _totalItemsFound: number = 0;

    get offers(): MarketPlaceOfferEntry[]
    {
        return this._offers;
    }

    get totalItemsFound(): number
    {
        return this._totalItemsFound;
    }

    flush(): boolean
    {
        this._offers = [];

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._offers = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            let stuffData: IStuffData | null = null;
            let extraData = '';
            let isUsable = false;
            let isUsed = false;

            const offerId = wrapper.readInt();
            const status = wrapper.readInt();
            let furniType = wrapper.readInt();
            let furniId: number;

            if(furniType === 1 || furniType === 4)
            {
                furniId = wrapper.readInt();
                stuffData = StuffDataFactory.getStuffDataForType(wrapper.readInt());
                stuffData?.initializeFromIncomingMessage(wrapper);
                isUsable = furniType === 4;

                if(isUsable)
                {
                    isUsed = wrapper.readBoolean();
                    furniType = 1;
                }
            }
            else if(furniType === 2)
            {
                furniId = wrapper.readInt();
                extraData = wrapper.readString();
            }
            else if(furniType === 3)
            {
                furniId = wrapper.readInt();
                stuffData = StuffDataFactory.getStuffDataForType(0);

                if(stuffData)
                {
                    stuffData.uniqueSerialNumber = wrapper.readInt();
                    stuffData.uniqueSeriesSize = wrapper.readInt();
                }

                furniType = 1;
            }
            else
            {
                furniId = 0;
            }

            const price = wrapper.readInt();
            const timeLeftMinutes = wrapper.readInt();
            const averagePrice = wrapper.readInt();
            const offerCount = wrapper.readInt();

            const entry = new MarketPlaceOfferEntry(
                offerId, furniId, furniType, extraData, stuffData, price, status,
                timeLeftMinutes, averagePrice, offerCount, NaN, isUsable, isUsed);

            if(i < MarketPlaceOffersEventParser.MAX_OFFERS)
            {
                this._offers.push(entry);
            }
        }

        this._totalItemsFound = wrapper.readInt();

        return true;
    }
}
