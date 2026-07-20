import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

/**
 * AbstractVariableList — the base class for the wired-context variable lists (VariableList,
 * SharedVariableList, AllVariablesInRoom). It defines the common `variables` accessor, which the
 * base leaves empty and every subclass overrides to expose its own WiredVariable[]. It also carries
 * a shared, always-empty default instance used wherever a "no variables" list is needed.
 *
 * Name derived: the class is obfuscated in WIN63 (class _SafeCls_2575 = "_-WJ") and has no
 * counterpart in vortex-flash-client; the name reflects its role as the abstract parent that only
 * exposes an empty `variables` list until subclassed.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2576/_SafeCls_2575.as
 */
export class AbstractVariableList
{
    // AS3: _SafeCls_2575.as::_SafeStr_7234 (shared always-empty default instance) — name derived:
    // the same obfuscated symbol is spelled "empty" in the inventory enum that keeps its literals.
    static readonly EMPTY: AbstractVariableList = new AbstractVariableList();

    // AS3: _SafeCls_2575.as::AbstractVariableList()
    constructor()
    {
    }

    // AS3: _SafeCls_2575.as::get variables()
    get variables(): WiredVariable[] | null
    {
        return [];
    }
}
