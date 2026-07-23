import {InNeighborhood} from './InNeighborhood';
import {SelectorCodes} from './SelectorCodes';

/**
 * FurniInNeighborhood — the "furni in neighborhood" selector: InNeighborhood targeting furni.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4450`). Code = SelectorCodes.FURNI_IN_NEIGHBORHOOD.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4450.as
 */
export class FurniInNeighborhood extends InNeighborhood
{
    // AS3: _SafeCls_4450.as::get code()
    override get code(): number
    {
        return SelectorCodes.FURNI_IN_NEIGHBORHOOD;
    }
}
