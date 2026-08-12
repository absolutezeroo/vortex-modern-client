import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {TradeRequirementRule} from './TradeRequirementRule';
import {TradeRequirementRulesDefinition} from './TradeRequirementRulesDefinition';
import {TradeRequirementRulesType} from './TradeRequirementRulesType';

/**
 * The contract's rules plus the mode that governs how many times it can be taken.
 *
 * The mode is read *after* the definition and decides what follows it: one int for `TYPE_1`
 * (a fixed multiplier), one int for `TYPE_2` (an auto-multiplier ceiling), nothing for `TYPE_0`.
 * Both defaults are 1 rather than 0, so a contract that names neither still trades once.
 *
 * Unlike its two neighbours this class parses in its **constructor** rather than through a static
 * `readFromMessage()`, and has no `addToComposer()` — it is read from the server and never sent
 * back. That asymmetry is AS3's.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRules.as
 */
export class TradeRequirementRules
{
    // AS3: TradeRequirementRules.as::_SafeStr_6894 (the definition it delegates both getters to)
    private _definition: TradeRequirementRulesDefinition;

    // AS3: TradeRequirementRules.as::_SafeStr_4778 (from `get type()`)
    private _type: number;

    // AS3: TradeRequirementRules.as::_SafeStr_8821 (from `get multiplier()`)
    private _multiplier: number = 1;

    // AS3: TradeRequirementRules.as::_SafeStr_9679 (from `get autoMultiplierMax()`)
    private _autoMultiplierMax: number = 1;

    // AS3: TradeRequirementRules.as::TradeRequirementRules()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._definition = TradeRequirementRulesDefinition.readFromMessage(wrapper);
        this._type = wrapper.readInt();

        if(this._type === TradeRequirementRulesType.TYPE_1) this._multiplier = wrapper.readInt();
        else if(this._type === TradeRequirementRulesType.TYPE_2) this._autoMultiplierMax = wrapper.readInt();
    }

    // AS3: TradeRequirementRules.as::get youGiveRule()
    get youGiveRule(): TradeRequirementRule[] | null
    {
        return this._definition.youGiveRule;
    }

    // AS3: TradeRequirementRules.as::get youGetRule()
    get youGetRule(): TradeRequirementRule | null
    {
        return this._definition.youGetRule;
    }

    // AS3: TradeRequirementRules.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: TradeRequirementRules.as::get multiplier()
    get multiplier(): number
    {
        return this._multiplier;
    }

    // AS3: TradeRequirementRules.as::get autoMultiplierMax()
    get autoMultiplierMax(): number
    {
        return this._autoMultiplierMax;
    }
}
