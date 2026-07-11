import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '@habbo/inventory/items/IStuffData';
import {StuffDataFactory} from '@habbo/inventory/items/stuffdata';
import {MarketPlaceOfferEntry} from './MarketPlaceOfferEntry';

/**
 * The win63_version copy of this parser (MarketPlaceOwnOffersEventParser.as)
 * is decompiler-corrupted in the same way as the public-offers parser
 * (all-zero literals, discarded reads, `null` pushed instead of the
 * constructed entry, non-terminating loop condition) - this port follows the
 * primary tree's `_SafeCls_3542`, which is complete and internally
 * consistent.
 *
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1932/_SafeCls_3542.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketPlaceOwnOffersEventParser.as)
 */
export class MarketPlaceOwnOffersEventParser implements IMessageParser
{
    private static readonly MAX_OFFERS: number = 500;

    private _offers: MarketPlaceOfferEntry[] = [];

    private _creditsWaiting: number = 0;

    get offers(): MarketPlaceOfferEntry[]
    {
        return this._offers;
    }

    get creditsWaiting(): number
    {
        return this._creditsWaiting;
    }

    flush(): boolean
    {
        this._offers = [];

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._offers = [];
        this._creditsWaiting = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            let stuffData: IStuffData | null = null;
            let extraData = '';

            const offerId = wrapper.readInt();
            const status = wrapper.readInt();
            let furniType = wrapper.readInt();
            let furniId: number;

            if(furniType === 1 || furniType === 4)
            {
                furniId = wrapper.readInt();
                stuffData = StuffDataFactory.parseStuffData(wrapper);

                if(furniType === 4)
                {
                    // AS3 reads this boolean but never stores it for own offers
                    // (unlike the public-offers parser's isUsed) - preserved as-is.
                    wrapper.readBoolean();
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
                stuffData = StuffDataFactory.createForType(0);

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
            let statusTime = NaN;

            if(status === 2 || status === 3)
            {
                statusTime = wrapper.readLong();
            }

            const entry = new MarketPlaceOfferEntry(
                offerId, furniId, furniType, extraData, stuffData, price, status,
                timeLeftMinutes, averagePrice, -1, statusTime);

            if(i < MarketPlaceOwnOffersEventParser.MAX_OFFERS)
            {
                this._offers.push(entry);
            }
        }

        return true;
    }
}
