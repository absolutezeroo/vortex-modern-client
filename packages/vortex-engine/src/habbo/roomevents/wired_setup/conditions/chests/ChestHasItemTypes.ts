import {ConditionCodes} from '../ConditionCodes';
import {ChestHasAmount} from './ChestHasAmount';

/**
 * ChestHasItemTypes — the "chest has (this many) item types" condition: a trivial ChestHasAmount whose
 * furni source is the item-type list (falling back to chests) and whose merged selection references a
 * user variable instead of furni.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4271`). Code = ConditionCodes.CHEST_HAS_ITEM_TYPES.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/chests/_SafeCls_4271.as
 */
export class ChestHasItemTypes extends ChestHasAmount
{
    // AS3: _SafeCls_4271.as::get code()
    override get code(): number
    {
        return ConditionCodes.CHEST_HAS_ITEM_TYPES;
    }

    // AS3: _SafeCls_4271.as::furniSelectionTitle()
    override furniSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.furni.title.item_types';
        }

        return 'wiredfurni.params.sources.furni.title.chests';
    }

    // AS3: _SafeCls_4271.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[2, 0]];
    }
}
