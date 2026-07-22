import {DefaultElement} from '../DefaultElement';
import type {IConditionType} from './IConditionType';

/**
 * DefaultConditionType — the base for concrete wired condition types. It adds nothing over
 * DefaultElement (unlike DefaultActionType, which allows delaying); concrete conditions override
 * `code` (and, where they take parameters, buildInputs/onEditStart/read/validate).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/DefaultConditionType.as
 */
export class DefaultConditionType extends DefaultElement implements IConditionType
{
}
