import {InArea} from './InArea';
import {SelectorCodes} from './SelectorCodes';

/**
 * UsersInArea — the "users in area" selector: InArea targeting users.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/UsersInArea.as
 */
export class UsersInArea extends InArea
{
    // AS3: UsersInArea.as::get code()
    override get code(): number
    {
        return SelectorCodes.USERS_IN_AREA;
    }
}
