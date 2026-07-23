import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Byte} from '@core/communication/util/Byte';

import {ChestItemType} from './ChestItemType';

/**
 * TradeRequirementNode — a single payment/reward requirement in a wired trading contract: a type
 * (TYPE_COIN or TYPE_FURNI), an amount, and — for furni requirements — a ChestItemType. Read from /
 * written to the wire. wired_setup's CustomContract addon references TYPE_FURNI.
 *
 * Placement derived: AS3 lives in the obfuscated package `_SafePkg_4037` (src/unknowns); co-located
 * with the wiredtrading trade-requirement models.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4037/TradeRequirementNode.as
 */
export class TradeRequirementNode
{
    // AS3: TradeRequirementNode.as::TYPE_COIN
    public static readonly TYPE_COIN: number = 0;

    // AS3: TradeRequirementNode.as::TYPE_FURNI
    public static readonly TYPE_FURNI: number = 1;

    // AS3: TradeRequirementNode.as::_SafeStr_4778 (name derived from getter type)
    private readonly _type: number;

    // AS3: TradeRequirementNode.as::_amount
    private readonly _amount: number;

    // AS3: TradeRequirementNode.as::_SafeStr_5296 (name derived from getter itemType)
    private readonly _itemType: ChestItemType | null = null;

    // AS3: TradeRequirementNode.as::TradeRequirementNode()
    constructor(type: number, amount: number, itemType: ChestItemType | null = null)
    {
        this._type = type;
        this._amount = amount;

        if(this._type === TradeRequirementNode.TYPE_FURNI)
        {
            this._itemType = itemType;
        }
    }

    // AS3: TradeRequirementNode.as::readFromMessage()
    static readFromMessage(wrapper: IMessageDataWrapper): TradeRequirementNode
    {
        const type = wrapper.readByte();
        const amount = wrapper.readInt();
        let itemType: ChestItemType | null = null;

        if(type === TradeRequirementNode.TYPE_FURNI)
        {
            itemType = ChestItemType.readFromMessage(wrapper);
        }

        return new TradeRequirementNode(type, amount, itemType);
    }

    // AS3: TradeRequirementNode.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: TradeRequirementNode.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: TradeRequirementNode.as::get itemType()
    get itemType(): ChestItemType | null
    {
        return this._itemType;
    }

    // AS3: TradeRequirementNode.as::addToComposer()
    addToComposer(array: unknown[]): void
    {
        array.push(new Byte(this._type));
        array.push(this._amount);

        if(this._type === TradeRequirementNode.TYPE_FURNI)
        {
            this._itemType?.addToComposer(array);
        }
    }

    // AS3: TradeRequirementNode.as::deepCopy()
    deepCopy(): TradeRequirementNode
    {
        return new TradeRequirementNode(this._type, this._amount, this._itemType);
    }
}
