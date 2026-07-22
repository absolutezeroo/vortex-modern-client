import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * MoveFurniToUser — the "move furni to user" wired action.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4088`; the name follows the code it returns
 * (ActionTypeCodes.MOVE_FURNI_TO_USER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4088.as
 */
export class MoveFurniToUser extends DefaultActionType
{
    // AS3: _SafeCls_4088.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.MOVE_FURNI_TO_USER;
    }

    // AS3: _SafeCls_4088.as::furniSelectionTitle()
    override furniSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.mv.0';
    }

    // AS3: _SafeCls_4088.as::userSelectionTitle()
    override userSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.mv_user';
    }

    // AS3: _SafeCls_4088.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }
}
