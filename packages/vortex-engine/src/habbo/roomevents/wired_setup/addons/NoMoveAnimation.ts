import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * NoMoveAnimation — the "suppress the move animation" wired addon. Takes no form inputs.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/NoMoveAnimation.as
 */
export class NoMoveAnimation extends DefaultAddonType
{
    // AS3: NoMoveAnimation.as::get code()
    override get code(): number
    {
        return AddonCodes.NO_MOVE_ANIMATION;
    }
}
