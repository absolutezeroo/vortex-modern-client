import type {IWiredElement} from '../IWiredElement';

/**
 * ISelectorType — marker interface for wired selector element types. It adds nothing to IWiredElement;
 * it exists only so the selector registry (SelectorTypes) can type its elements distinctly from
 * actions/conditions/triggers/etc.
 *
 * AS3 names this interface `SelectorType` (no `I` prefix); renamed to `ISelectorType` for the port's
 * interface-naming convention.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/SelectorType.as
 */
export interface ISelectorType extends IWiredElement
{
}
