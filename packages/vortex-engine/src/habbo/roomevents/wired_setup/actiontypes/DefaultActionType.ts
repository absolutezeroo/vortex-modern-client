import {DefaultElement} from '../DefaultElement';
import type {IActionType} from './IActionType';

/**
 * DefaultActionType — the base for concrete wired action types: a DefaultElement that allows delaying
 * by default. Concrete actions override `code` (and, where they take parameters, buildInputs/read/
 * validate).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/DefaultActionType.as
 */
export class DefaultActionType extends DefaultElement implements IActionType
{
    // AS3: DefaultActionType.as::get allowDelaying()
    get allowDelaying(): boolean
    {
        return true;
    }
}
