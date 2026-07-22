import {DefaultElement} from '../DefaultElement';
import type {IAddonType} from './IAddonType';

/**
 * DefaultAddonType — the base for concrete wired addon types. Adds an `isFilter` flag (false by
 * default; the selector-filter addons override it) over DefaultElement; concrete addons override
 * `code` (and, where they take parameters, buildInputs/onEditStart/read/validate).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/DefaultAddonType.as
 */
export class DefaultAddonType extends DefaultElement implements IAddonType
{
    // AS3: DefaultAddonType.as::get isFilter()
    get isFilter(): boolean
    {
        return false;
    }
}
