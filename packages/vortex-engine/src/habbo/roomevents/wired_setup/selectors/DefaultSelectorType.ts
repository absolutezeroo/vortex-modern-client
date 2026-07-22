import {DefaultElement} from '../DefaultElement';
import type {ISelectorType} from './ISelectorType';

/**
 * DefaultSelectorType — the base for concrete wired selector types. It adds nothing over
 * DefaultElement; concrete selectors override `code` (and, where they take parameters, buildInputs/
 * onEditStart/read/validate).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/DefaultSelectorType.as
 */
export class DefaultSelectorType extends DefaultElement implements ISelectorType
{
}
