import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The answer to "may I list an item?". `resultCode` is not a boolean — 1 is yes, and each other
 * value selects a different refusal (no trading privilege, no trading pass, out of tokens, trading
 * lock). `MarketplaceModel.proceedOfferMaking()` is where they fan out.
 *
 * `tokenCount` only matters for the out-of-tokens branch, which offers to sell the user a batch.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceCanMakeOfferResultParser.as
 * (read order corroborated against the emulator's
 * Revision20260701/Serializers/Marketplace/MarketplaceCanMakeOfferResultMessageComposerSerializer.cs,
 * which writes ResultCode then TokenCount)
 */
export class MarketplaceCanMakeOfferResultParser implements IMessageParser
{
    // AS3: .../parser/marketplace/MarketplaceCanMakeOfferResultParser.as::var_1122
    private _resultCode: number = 0;

    // AS3: .../parser/marketplace/MarketplaceCanMakeOfferResultParser.as::var_4937
    private _tokenCount: number = 0;

    // AS3: .../parser/marketplace/MarketplaceCanMakeOfferResultParser.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }

    // AS3: .../parser/marketplace/MarketplaceCanMakeOfferResultParser.as::get tokenCount()
    get tokenCount(): number
    {
        return this._tokenCount;
    }

    // AS3: .../parser/marketplace/MarketplaceCanMakeOfferResultParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../parser/marketplace/MarketplaceCanMakeOfferResultParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._resultCode = wrapper.readInt();
        this._tokenCount = wrapper.readInt();

        return true;
    }
}
