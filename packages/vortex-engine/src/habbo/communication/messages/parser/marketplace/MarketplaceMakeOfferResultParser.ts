import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The outcome of listing an item. A single int, shown to the user through
 * "${inventory.marketplace.result.<n>}" — 1 is success, everything else is a localized failure, so
 * the client never needs to know what the codes mean.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceMakeOfferResultParser.as
 * (single field corroborated against the emulator's
 * Revision20260701/Serializers/Marketplace/MarketplaceMakeOfferResultMessageComposerSerializer.cs)
 */
export class MarketplaceMakeOfferResultParser implements IMessageParser
{
    // AS3: .../parser/marketplace/MarketplaceMakeOfferResultParser.as::var_1122
    private _result: number = 0;

    // AS3: .../parser/marketplace/MarketplaceMakeOfferResultParser.as::get result()
    get result(): number
    {
        return this._result;
    }

    // AS3: .../parser/marketplace/MarketplaceMakeOfferResultParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../parser/marketplace/MarketplaceMakeOfferResultParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._result = wrapper.readInt();

        return true;
    }
}
