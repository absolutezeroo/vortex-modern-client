import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {
    TradeRequirementRulesDefinition
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRulesDefinition';

/**
 * Everything about one wired contract, header 2976.
 *
 * **The tail of this message depends on `contractType`.** Only the first three fields are always
 * present; after them the wire carries a payment block, nothing, or a reward block. Reading the
 * wrong branch does not throw — it consumes the next message's bytes — so the discriminant has to be
 * honoured exactly.
 *
 * **Name DERIVED** — no unobfuscated tree carries the contract messages (`win63_version` predates
 * them entirely) and vortex-emulator has no constant for 2976. Named for the AS3 handler it feeds,
 * `WiredContractController::onContractContents()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2588/_SafeCls_2587.as
 */
export class WiredContractContentsMessageParser implements IMessageParser
{
    /**
	 * The three contract types. **Names derived**, from which branch of `parse()` each selects and
	 * from the sub-controller that handles it: 0 reads the payment block (`PaymentContract`), 2 the
	 * reward block (`RewardContract`), and 1 reads nothing extra (`TradeContract`).
	 */
    // AS3: _SafeCls_2587.as::_SafeStr_11161 (name derived)
    static readonly CONTRACT_TYPE_PAYMENT: number = 0;
    // AS3: _SafeCls_2587.as::_SafeStr_11416 (name derived)
    static readonly CONTRACT_TYPE_TRADE: number = 1;
    // AS3: _SafeCls_2587.as::_SafeStr_11226 (name derived)
    static readonly CONTRACT_TYPE_REWARD: number = 2;

    /**
	 * The two payment modes. **Names derived** — both identifiers are obfuscated and the values are
	 * only ever compared against `paymentMode`, so the pairing is by position, not by evidence.
	 */
    // AS3: _SafeCls_2587.as::_SafeStr_11423 (name derived)
    static readonly PAYMENT_MODE_0: number = 0;
    // AS3: _SafeCls_2587.as::_SafeStr_10595 (name derived)
    static readonly PAYMENT_MODE_1: number = 1;

    // AS3: _SafeCls_2587.as::contractId
    private _contractId: number = 0;
    // AS3: _SafeCls_2587.as::contractType
    private _contractType: number = 0;
    // AS3: _SafeCls_2587.as::definition
    private _definition: TradeRequirementRulesDefinition | null = null;
    // AS3: _SafeCls_2587.as::paymentMode
    private _paymentMode: number = 0;
    // AS3: _SafeCls_2587.as::receiveText
    private _receiveText: string | null = null;
    // AS3: _SafeCls_2587.as::layoutType
    private _layoutType: string | null = null;
    // AS3: _SafeCls_2587.as::rewardCategory
    private _rewardCategory: number = 0;
    // AS3: _SafeCls_2587.as::showDialog
    private _showDialog: boolean = false;
    // AS3: _SafeCls_2587.as::rewardText
    private _rewardText: string | null = null;

    // AS3: _SafeCls_2587.as::flush()
    flush(): boolean
    {
        this._contractId = 0;
        this._contractType = 0;
        this._definition = null;
        this._paymentMode = 0;
        this._receiveText = null;
        this._rewardCategory = 0;
        this._showDialog = false;
        this._rewardText = null;

        // AS3 does not clear `layoutType` here. Transcribed as found rather than "fixed": a stale
        // value can only survive into a payment contract, which always rewrites it.

        return true;
    }

    // AS3: _SafeCls_2587.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._contractId = wrapper.readInt();
        // A *short*, not an int — the type discriminant is 16-bit where the id is 32.
        this._contractType = wrapper.readShort();
        this._definition = TradeRequirementRulesDefinition.readFromMessage(wrapper);

        if(this._contractType === WiredContractContentsMessageParser.CONTRACT_TYPE_PAYMENT)
        {
            this._paymentMode = wrapper.readShort();
            this._receiveText = wrapper.readString();
            this._layoutType = wrapper.readString();
        }

        if(this._contractType === WiredContractContentsMessageParser.CONTRACT_TYPE_REWARD)
        {
            this._rewardCategory = wrapper.readShort();
            this._showDialog = wrapper.readBoolean();
            this._rewardText = wrapper.readString();
        }

        return true;
    }

    // AS3: _SafeCls_2587.as::get contractId()
    get contractId(): number
    {
        return this._contractId;
    }

    // AS3: _SafeCls_2587.as::get contractType()
    get contractType(): number
    {
        return this._contractType;
    }

    // AS3: _SafeCls_2587.as::get definition()
    get definition(): TradeRequirementRulesDefinition | null
    {
        return this._definition;
    }

    // AS3: _SafeCls_2587.as::get paymentMode()
    get paymentMode(): number
    {
        return this._paymentMode;
    }

    // AS3: _SafeCls_2587.as::get receiveText()
    get receiveText(): string | null
    {
        return this._receiveText;
    }

    // AS3: _SafeCls_2587.as::get layoutType()
    get layoutType(): string | null
    {
        return this._layoutType;
    }

    // AS3: _SafeCls_2587.as::get rewardCategory()
    get rewardCategory(): number
    {
        return this._rewardCategory;
    }

    // AS3: _SafeCls_2587.as::get showDialog()
    get showDialog(): boolean
    {
        return this._showDialog;
    }

    // AS3: _SafeCls_2587.as::get rewardText()
    get rewardText(): string | null
    {
        return this._rewardText;
    }
}
