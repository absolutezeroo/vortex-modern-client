import type {IWiredElement} from '../IWiredElement';

/**
 * IActionType — a wired action element: an IWiredElement that additionally reports whether it can be
 * delayed (run after a pulse delay).
 *
 * AS3 names this interface `ActionType` (no `I` prefix); renamed to `IActionType` for the port's
 * interface-naming convention.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/ActionType.as
 */
export interface IActionType extends IWiredElement
{
    // AS3: ActionType.as::get allowDelaying()
    readonly allowDelaying: boolean;
}
