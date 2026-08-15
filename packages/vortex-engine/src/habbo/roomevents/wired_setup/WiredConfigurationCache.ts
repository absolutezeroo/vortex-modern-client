import type {CheckboxGroupPreset} from './uibuilder/presets/CheckboxGroupPreset';
import type {RadioGroupPreset} from './uibuilder/presets/RadioGroupPreset';
import type {SectionPreset} from './uibuilder/presets/SectionPreset';
import type {AdvancedSettingsWrapperPreset} from './uibuilder/presets/main_layout/AdvancedSettingsWrapperPreset';
import type {FooterPreset} from './uibuilder/presets/main_layout/FooterPreset';
import type {FramePreset} from './uibuilder/presets/main_layout/FramePreset';
import type {HeaderPreset} from './uibuilder/presets/main_layout/HeaderPreset';
import type {InputSourceSection} from './uibuilder/presets/main_layout/InputSourceSection';
import type {SliderSection} from './uibuilder/presets/sections/SliderSection';

/**
 * One built wired-configuration dialog, kept whole so reopening the same element reuses it instead
 * of rebuilding it.
 *
 * **It is a snapshot of `UserDefinedRoomEventsCtrl`'s own fields**, not a model — every one of the
 * ten is a preset the controller holds while a dialog is open, and `close()` nulls them all.
 * Restoring means writing them straight back, which is why this class is pure storage with no
 * behaviour: the controller stays the only thing that knows what the presets are for.
 *
 * Any of the presets may be null. A trigger has no delay slider, a non-condition has no quantifier
 * radio, and an element with no advanced sources has an empty section list — `close()` restores the
 * nulls just as faithfully as the objects.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/WiredConfigurationCache.as
 */
export class WiredConfigurationCache
{
    // AS3: WiredConfigurationCache.as::_frame
    private _frame: FramePreset;

    // AS3: WiredConfigurationCache.as::_headerPreset
    private _headerPreset: HeaderPreset | null;

    // AS3: WiredConfigurationCache.as::_SafeStr_5048 (name derived: the selector-options checkboxes)
    private _selectorOptionsPreset: CheckboxGroupPreset | null;

    // AS3: WiredConfigurationCache.as::_SafeStr_6390 (name derived: the furni-picks section)
    private _furniPicksSectionPreset: SectionPreset | null;

    // AS3: WiredConfigurationCache.as::_SafeStr_5354 (name derived: the delay slider)
    private _delayPreset: SliderSection | null;

    // AS3: WiredConfigurationCache.as::_initialWidth
    private _initialWidth: number;

    // AS3: WiredConfigurationCache.as::_SafeStr_5845 (name derived: the advanced-settings wrapper)
    private _advancedSettingsWrapperPreset: AdvancedSettingsWrapperPreset | null;

    // AS3: WiredConfigurationCache.as::_SafeStr_5080 (name derived: the quantifier radio group)
    private _conditionQuantifierOptions: RadioGroupPreset | null;

    // AS3: WiredConfigurationCache.as::_SafeStr_4793 (name derived: the advanced input-source rows)
    private _inputSourcePresets: InputSourceSection[];

    // AS3: WiredConfigurationCache.as::_SafeStr_6152 (name derived: the footer)
    private _footerPreset: FooterPreset | null;

    // AS3: WiredConfigurationCache.as::WiredConfigurationCache()
    constructor(
        frame: FramePreset,
        headerPreset: HeaderPreset | null,
        selectorOptionsPreset: CheckboxGroupPreset | null,
        furniPicksSectionPreset: SectionPreset | null,
        delayPreset: SliderSection | null,
        advancedSettingsWrapperPreset: AdvancedSettingsWrapperPreset | null,
        conditionQuantifierOptions: RadioGroupPreset | null,
        inputSourcePresets: InputSourceSection[],
        footerPreset: FooterPreset | null,
        initialWidth: number
    )
    {
        this._frame = frame;
        this._headerPreset = headerPreset;
        this._selectorOptionsPreset = selectorOptionsPreset;
        this._furniPicksSectionPreset = furniPicksSectionPreset;
        this._delayPreset = delayPreset;
        this._advancedSettingsWrapperPreset = advancedSettingsWrapperPreset;
        this._conditionQuantifierOptions = conditionQuantifierOptions;
        this._inputSourcePresets = inputSourcePresets;
        this._footerPreset = footerPreset;
        this._initialWidth = initialWidth;
    }

    // AS3: WiredConfigurationCache.as::get frame()
    get frame(): FramePreset
    {
        return this._frame;
    }

    // AS3: WiredConfigurationCache.as::get headerPreset()
    get headerPreset(): HeaderPreset | null
    {
        return this._headerPreset;
    }

    // AS3: WiredConfigurationCache.as::get selectorOptionsPreset()
    get selectorOptionsPreset(): CheckboxGroupPreset | null
    {
        return this._selectorOptionsPreset;
    }

    // AS3: WiredConfigurationCache.as::get furniPicksSectionPreset()
    get furniPicksSectionPreset(): SectionPreset | null
    {
        return this._furniPicksSectionPreset;
    }

    // AS3: WiredConfigurationCache.as::get delayPreset()
    get delayPreset(): SliderSection | null
    {
        return this._delayPreset;
    }

    // AS3: WiredConfigurationCache.as::get advancedSettingsWrapperPreset()
    get advancedSettingsWrapperPreset(): AdvancedSettingsWrapperPreset | null
    {
        return this._advancedSettingsWrapperPreset;
    }

    // AS3: WiredConfigurationCache.as::get conditionQuantifierOptions()
    get conditionQuantifierOptions(): RadioGroupPreset | null
    {
        return this._conditionQuantifierOptions;
    }

    // AS3: WiredConfigurationCache.as::get inputSourcePresets()
    get inputSourcePresets(): InputSourceSection[]
    {
        return this._inputSourcePresets;
    }

    // AS3: WiredConfigurationCache.as::get footerPreset()
    get footerPreset(): FooterPreset | null
    {
        return this._footerPreset;
    }

    // AS3: WiredConfigurationCache.as::get initialWidth()
    get initialWidth(): number
    {
        return this._initialWidth;
    }
}
