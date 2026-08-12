import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {TradeRequirementRule} from './TradeRequirementRule';

/**
 * Both sides of a contract: the rules for what you give, and the single rule for what you get.
 *
 * Each side is independently optional and each is guarded by its own boolean on the wire. Note the
 * asymmetry — "you give" is a *list* of rules, "you get" is one — and that `null` is meaningful
 * rather than merely empty: a side that was never sent is null, and `addToComposer()` writes that
 * distinction back out.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRulesDefinition.as
 */
export class TradeRequirementRulesDefinition
{
    // AS3: TradeRequirementRulesDefinition.as::_SafeStr_5972 (from `get youGiveRule()`)
    private _youGiveRule: TradeRequirementRule[] | null;

    // AS3: TradeRequirementRulesDefinition.as::_SafeStr_6452 (from `get youGetRule()`)
    private _youGetRule: TradeRequirementRule | null;

    // AS3: TradeRequirementRulesDefinition.as::TradeRequirementRulesDefinition()
    constructor(youGiveRule: TradeRequirementRule[] | null, youGetRule: TradeRequirementRule | null)
    {
        this._youGiveRule = youGiveRule;
        this._youGetRule = youGetRule;
    }

    // AS3: TradeRequirementRulesDefinition.as::readFromMessage()
    static readFromMessage(wrapper: IMessageDataWrapper): TradeRequirementRulesDefinition
    {
        let youGiveRule: TradeRequirementRule[] | null = null;
        let youGetRule: TradeRequirementRule | null = null;

        if(wrapper.readBoolean())
        {
            youGiveRule = [];

            const count = wrapper.readInt();

            for(let i = 0; i < count; i++) youGiveRule.push(TradeRequirementRule.readFromMessage(wrapper));
        }

        if(wrapper.readBoolean()) youGetRule = TradeRequirementRule.readFromMessage(wrapper);

        return new TradeRequirementRulesDefinition(youGiveRule, youGetRule);
    }

    // AS3: TradeRequirementRulesDefinition.as::get youGiveRule()
    get youGiveRule(): TradeRequirementRule[] | null
    {
        return this._youGiveRule;
    }

    // AS3: TradeRequirementRulesDefinition.as::get youGetRule()
    get youGetRule(): TradeRequirementRule | null
    {
        return this._youGetRule;
    }

    // AS3: TradeRequirementRulesDefinition.as::addToComposer()
    addToComposer(array: unknown[]): void
    {
        array.push(this._youGiveRule != null);

        if(this._youGiveRule != null)
        {
            array.push(this._youGiveRule.length);

            for(const rule of this._youGiveRule) rule.addToComposer(array);
        }

        array.push(this._youGetRule != null);

        if(this._youGetRule != null) this._youGetRule.addToComposer(array);
    }

    // AS3: TradeRequirementRulesDefinition.as::deepCopy()
    deepCopy(): TradeRequirementRulesDefinition
    {
        let youGiveRule: TradeRequirementRule[] | null = null;
        let youGetRule: TradeRequirementRule | null = null;

        if(this._youGiveRule != null)
        {
            youGiveRule = [];

            for(const rule of this._youGiveRule) youGiveRule.push(rule.deepCopy());
        }

        if(this._youGetRule != null) youGetRule = this._youGetRule.deepCopy();

        return new TradeRequirementRulesDefinition(youGiveRule, youGetRule);
    }
}
