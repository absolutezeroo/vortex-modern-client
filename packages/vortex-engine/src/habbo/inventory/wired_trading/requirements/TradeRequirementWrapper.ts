import type {TradeRequirement} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirement';
import {TradeRequirementNode} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';
import type {GroupItem} from '@habbo/inventory/items/GroupItem';
import {FurnitureCategory} from '@habbo/inventory/enum/FurnitureCategory';

/**
 * A parsed contract turned into the three lookups the furni grid needs to answer "can I offer
 * this?" without walking the rule tree on every item.
 *
 * Built once per contract, in the constructor: every node of every "you give" rule is sorted into
 * a flag for credits, a set of floor-item type ids, and a set of wall-item type ids — plus a set of
 * legacy poster ids, because posters share one type id and are told apart by their stuff data.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/wired_trading/requirements/TradeRequirementWrapper.as
 */
export class TradeRequirementWrapper
{
    // AS3: TradeRequirementWrapper.as::_SafeStr_6760 (from `get requirements()`)
    private _requirements: TradeRequirement;

    // AS3: TradeRequirementWrapper.as::_SafeStr_9797 (from `canOfferCreditFurni()`)
    private _acceptsCredits: boolean = false;

    // AS3: TradeRequirementWrapper.as::_SafeStr_8289 (the wall-item type ids the contract accepts)
    private _wallItemTypeIds: Set<number> | null = null;

    // AS3: TradeRequirementWrapper.as::_SafeStr_7584 (the floor-item type ids the contract accepts)
    private _floorItemTypeIds: Set<number> | null = null;

    // AS3: TradeRequirementWrapper.as::_SafeStr_7946 (the legacy poster ids the contract accepts)
    private _legacyPosterIds: Set<string> | null = null;

    /**
     * The three sets stay null unless the contract actually carries "you give" rules — and
     * `canOfferNormalFurni()` reads that null as "nothing qualifies" rather than "everything does".
     */
    // AS3: TradeRequirementWrapper.as::TradeRequirementWrapper()
    constructor(requirements: TradeRequirement)
    {
        this._requirements = requirements;

        const youGiveRule = requirements.rules?.youGiveRule ?? null;

        if(youGiveRule == null) return;

        this._wallItemTypeIds = new Set<number>();
        this._floorItemTypeIds = new Set<number>();
        this._legacyPosterIds = new Set<string>();

        for(const rule of youGiveRule)
        {
            for(const node of rule.nodes)
            {
                if(node.type === TradeRequirementNode.TYPE_COIN)
                {
                    this._acceptsCredits = true;
                }
                else if(node.type === TradeRequirementNode.TYPE_FURNI)
                {
                    const itemType = node.itemType;

                    if(itemType == null) continue;

                    if(!itemType.isWallItem)
                    {
                        this._floorItemTypeIds.add(itemType.typeId);
                    }
                    else
                    {
                        // A poster's own id is recorded *in addition to* its type id, not instead
                        // of it — the type check below still has to pass.
                        if((itemType.legacyPosterId ?? '').length > 0)
                        {
                            this._legacyPosterIds.add(itemType.legacyPosterId as string);
                        }

                        this._wallItemTypeIds.add(itemType.typeId);
                    }
                }
            }
        }
    }

    // AS3: TradeRequirementWrapper.as::get type()
    get type(): number
    {
        return this._requirements.type;
    }

    // AS3: TradeRequirementWrapper.as::get requirements()
    get requirements(): TradeRequirement
    {
        return this._requirements;
    }

    // AS3: TradeRequirementWrapper.as::canOfferCreditFurni()
    canOfferCreditFurni(): boolean
    {
        return this._acceptsCredits;
    }

    /**
     * Posters are the awkward case: category 6 items all share a type id, so a poster has to match
     * on its legacy id *and* its type. Everything else is a single set lookup.
     */
    // AS3: TradeRequirementWrapper.as::canOfferNormalFurni()
    canOfferNormalFurni(groupItem: GroupItem): boolean
    {
        if(this._wallItemTypeIds == null || this._floorItemTypeIds == null || this._legacyPosterIds == null)
        {
            return false;
        }

        const item = groupItem.peek();

        if(item == null) return false;

        if(!item.isWallItem) return this._floorItemTypeIds.has(item.type);

        if(item.category === FurnitureCategory.POSTER
            && !this._legacyPosterIds.has(item.stuffData?.getLegacyString() ?? ''))
        {
            return false;
        }

        return this._wallItemTypeIds.has(item.type);
    }
}
