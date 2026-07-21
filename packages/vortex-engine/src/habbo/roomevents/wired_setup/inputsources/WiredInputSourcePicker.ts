import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';

/**
 * WiredInputSourcePicker — the input-source cycler for a wired element: owns a source-type slot
 * (furni / user / merged) and steps through the allowed sources for that slot, keeping the element's
 * definition snapshot in sync and producing the display text shown next to the source arrows.
 *
 * Ported here: the static source-type constants and `getTypeNameForSource`, which the source-type
 * picker UI (SourceTypeOption / NewSourceTypeOption) reads.
 *
 * TODO(AS3): the instance side — the constructor, `ISourceTypeListener`/`IDisposable` implementation,
 * `onChangeInputSource()` / `set sourceType()` / `refreshContainer()` and the instance getters
 * (selectedText / isButtonsDisabled / stuffPickingSpecialMode / disabled) — is deferred to Bloc B. It
 * operates on the element definition snapshot (`_SafeCls_2448`) and the IWiredElement (`_SafeCls_2869`),
 * neither of which is ported yet. This class is NOT instantiated by the source-type picker UI path
 * (that path uses only the statics below); it is created by the wired element types.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/inputsources/WiredInputSourcePicker.as
 */
export class WiredInputSourcePicker
{
    // AS3: WiredInputSourcePicker.as::_SafeStr_4603 (name derived: the furni source-type slot)
    public static readonly FURNI_SOURCE: number = 0;

    // AS3: WiredInputSourcePicker.as::USER_SOURCE
    public static readonly USER_SOURCE: number = 1;

    // AS3: WiredInputSourcePicker.as::MERGED_SOURCE
    public static readonly MERGED_SOURCE: number = 2;

    // AS3: WiredInputSourcePicker.as::STUFF_PICKING_MODE_NONE
    public static readonly STUFF_PICKING_MODE_NONE: number = 0;

    // AS3: WiredInputSourcePicker.as::STUFF_PICKING_MODE_1
    public static readonly STUFF_PICKING_MODE_1: number = 1;

    // AS3: WiredInputSourcePicker.as::STUFF_PICKING_MODE_2
    public static readonly STUFF_PICKING_MODE_2: number = 2;

    // AS3: WiredInputSourcePicker.as::getTypeNameForSource()
    public static getTypeNameForSource(source: number): string
    {
        if(source === WiredInputSourcePicker.FURNI_SOURCE)
        {
            return 'furni';
        }

        if(source === WiredInputSourcePicker.USER_SOURCE)
        {
            return 'users';
        }

        if(source === VariableExtraSourceTypes.CONTEXT_SOURCE)
        {
            return 'context';
        }

        if(source === VariableExtraSourceTypes.GLOBAL_SOURCE)
        {
            return 'global';
        }

        return '';
    }
}
