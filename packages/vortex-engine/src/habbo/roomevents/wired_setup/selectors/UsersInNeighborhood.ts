import {InNeighborhood} from './InNeighborhood';
import {SelectorCodes} from './SelectorCodes';

/**
 * UsersInNeighborhood — the "users in neighborhood" selector: InNeighborhood targeting users.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4420`). Code = SelectorCodes.USERS_IN_NEIGHBORHOOD.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4420.as
 */
export class UsersInNeighborhood extends InNeighborhood
{
    // AS3: _SafeCls_4420.as::get code()
    override get code(): number
    {
        return SelectorCodes.USERS_IN_NEIGHBORHOOD;
    }
}
