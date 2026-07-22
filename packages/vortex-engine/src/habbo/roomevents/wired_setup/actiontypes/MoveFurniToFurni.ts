import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * MoveFurniToFurni — the "move furni to another furni" wired action.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4265`; the name follows the code it returns
 * (ActionTypeCodes.MOVE_FURNI_TO_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4265.as
 */
export class MoveFurniToFurni extends DefaultActionType
{
    // AS3: _SafeCls_4265.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.MOVE_FURNI_TO_FURNI;
    }

    // AS3: _SafeCls_4265.as::furniSelectionTitle()
    override furniSelectionTitle(id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.mv.' + id;
    }

    // AS3: _SafeCls_4265.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4265.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
