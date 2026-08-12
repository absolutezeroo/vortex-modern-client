import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {TradeRequirementRules} from './rules/TradeRequirementRules';

/**
 * What a wired trading contract asks for, and what it hands back.
 *
 * The four type constants are read on the wire, but only one of them changes the parse: type 4
 * (`TYPE_CUSTOM`) is followed by a full rules block, the other three by nothing. That is why
 * `rules` is null for every other type and why `isPaymentOnly()` answers `true` for them
 * unconditionally — there is no "you get" side to inspect.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirement.as
 */
export class TradeRequirement
{
    /**
     * Names DERIVED **from behaviour**, not recovered: all four identifiers are obfuscated in every
     * tree. What each one means is settled by the one method that branches on all of them,
     * `WiredTradeRequirementsModel.canOfferFurni()`, which accepts credit furniture (`CF_`-prefixed
     * class names) for one, rejects it for another, accepts anything for a third, and defers to the
     * rules for the fourth. The ordinals are AS3's.
     *
     * These read `TYPE_0`/`TYPE_1`/`TYPE_2` until 2026-08-12, when that call site was ported and
     * made the meanings legible.
     */
    // AS3: TradeRequirement.as::_SafeStr_10197 (canOfferFurni: only `CF_` items qualify)
    public static readonly TYPE_CREDIT_FURNI_ONLY: number = 0;

    // AS3: TradeRequirement.as::_SafeStr_10181 (canOfferFurni: `CF_` items are refused)
    public static readonly TYPE_NORMAL_FURNI_ONLY: number = 1;

    // AS3: TradeRequirement.as::_SafeStr_10180 (canOfferFurni: anything tradeable qualifies)
    public static readonly TYPE_ANY_FURNI: number = 2;

    /** The only type whose payload carries rules. Note the gap: there is no 3. */
    // AS3: TradeRequirement.as::_SafeStr_7942 (canOfferFurni: defers to the contract's own rules)
    public static readonly TYPE_CUSTOM: number = 4;

    // AS3: TradeRequirement.as::_SafeStr_4778 (from `get type()`)
    private _type: number;

    // AS3: TradeRequirement.as::_SafeStr_9104 (from `get youGetText()`)
    private _youGetText: string;

    // AS3: TradeRequirement.as::_SafeStr_9965 (from `get layoutType()`)
    private _layoutType: string;

    // AS3: TradeRequirement.as::_rules
    private _rules: TradeRequirementRules | null = null;

    // AS3: TradeRequirement.as::TradeRequirement()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._type = wrapper.readInt();
        this._youGetText = wrapper.readString();
        this._layoutType = wrapper.readString();

        if(this._type === TradeRequirement.TYPE_CUSTOM) this._rules = new TradeRequirementRules(wrapper);
    }

    // AS3: TradeRequirement.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: TradeRequirement.as::get youGetText()
    get youGetText(): string
    {
        return this._youGetText;
    }

    // AS3: TradeRequirement.as::get layoutType()
    get layoutType(): string
    {
        return this._layoutType;
    }

    // AS3: TradeRequirement.as::get rules()
    get rules(): TradeRequirementRules | null
    {
        return this._rules;
    }

    /**
     * True when the player only pays and receives nothing back.
     *
     * AS3 dereferences `_rules` here without a null check — safe only because the branch is gated
     * on the one type that guarantees it was read. The port keeps the gate and adds `?.`, which
     * changes nothing when the invariant holds and returns `true` instead of throwing if it ever
     * stops holding.
     */
    // AS3: TradeRequirement.as::isPaymentOnly()
    isPaymentOnly(): boolean
    {
        if(this._type === TradeRequirement.TYPE_CUSTOM)
        {
            const youGetRule = this._rules?.youGetRule ?? null;

            return youGetRule == null || youGetRule.nodes.length === 0;
        }

        return true;
    }
}
