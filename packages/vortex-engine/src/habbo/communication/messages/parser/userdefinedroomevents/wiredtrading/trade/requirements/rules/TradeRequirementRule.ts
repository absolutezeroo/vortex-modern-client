import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {TradeRequirementNode} from '../TradeRequirementNode';

/**
 * One side of a wired trading contract: an ordered list of what is given, or of what is received.
 *
 * The class name is AS3's own — unobfuscated. Until 2026-08-12 this name was taken by the port's
 * copy of `_SafeCls_4486`, an unrelated constants holder now called `TradeRequirementRulesType`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRule.as
 */
export class TradeRequirementRule
{
    // AS3: TradeRequirementRule.as::_nodes
    private _nodes: TradeRequirementNode[];

    // AS3: TradeRequirementRule.as::TradeRequirementRule()
    constructor(nodes: TradeRequirementNode[])
    {
        this._nodes = nodes;
    }

    // AS3: TradeRequirementRule.as::readFromMessage()
    static readFromMessage(wrapper: IMessageDataWrapper): TradeRequirementRule
    {
        const nodes: TradeRequirementNode[] = [];
        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) nodes.push(TradeRequirementNode.readFromMessage(wrapper));

        return new TradeRequirementRule(nodes);
    }

    // AS3: TradeRequirementRule.as::get nodes()
    get nodes(): TradeRequirementNode[]
    {
        return this._nodes;
    }

    /**
     * Writes the count then each node, in order. Mirrors `readFromMessage()` exactly — the two are
     * the same wire shape read and written, and they have to stay in step.
     */
    // AS3: TradeRequirementRule.as::addToComposer()
    addToComposer(array: unknown[]): void
    {
        array.push(this._nodes.length);

        for(const node of this._nodes) node.addToComposer(array);
    }

    // AS3: TradeRequirementRule.as::deepCopy()
    deepCopy(): TradeRequirementRule
    {
        const nodes: TradeRequirementNode[] = [];

        for(const node of this._nodes) nodes.push(node.deepCopy());

        return new TradeRequirementRule(nodes);
    }
}
