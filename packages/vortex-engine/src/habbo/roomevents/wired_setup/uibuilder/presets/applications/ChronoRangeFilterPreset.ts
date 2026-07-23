import type {IWindow} from '@core/window/IWindow';

import type {HabboUserDefinedRoomEvents} from '../../../../HabboUserDefinedRoomEvents';
import {ChronoFieldRangeFilter} from '../../../common/utils/ChronoFieldRangeFilter';
import type {PresetManager} from '../../PresetManager';
import {NumberInputParam} from '../../params/NumberInputParam';
import {RadioButtonParam} from '../../params/RadioButtonParam';
import {TextParam} from '../../params/TextParam';
import type {WiredStyle} from '../../styles/WiredStyle';
import type {NumberInputPreset} from '../NumberInputPreset';
import type {RadioGroupPreset} from '../RadioGroupPreset';
import {WiredUIPreset} from '../WiredUIPreset';

/**
 * ChronoRangeFilterPreset — a three-mode range picker for one chrono field (used by TimeMatches for
 * hour/minute/second and DateMatches for day/year): skip (no filter), exact (single value) or range
 * (min–max). Radio selects the mode; getFilter/applyFilter convert to/from a ChronoFieldRangeFilter.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/applications/ChronoRangeFilterPreset.as
 */
export class ChronoRangeFilterPreset extends WiredUIPreset
{
    // AS3: ChronoRangeFilterPreset.as::MODE_SKIP
    public static readonly MODE_SKIP: number = 0;

    // AS3: ChronoRangeFilterPreset.as::MODE_EXACT
    public static readonly MODE_EXACT: number = 1;

    // AS3: ChronoRangeFilterPreset.as::MODE_RANGE
    public static readonly MODE_RANGE: number = 2;

    // AS3: ChronoRangeFilterPreset.as::_radioGroup
    private _radioGroup: RadioGroupPreset;

    // AS3: ChronoRangeFilterPreset.as::_SafeStr_5716 (name derived: the exact-value input)
    private _exactInput: NumberInputPreset;

    // AS3: ChronoRangeFilterPreset.as::_SafeStr_5991 (name derived: the range-min input)
    private _rangeMinInput: NumberInputPreset;

    // AS3: ChronoRangeFilterPreset.as::_SafeStr_6027 (name derived: the range-max input)
    private _rangeMaxInput: NumberInputPreset;

    // AS3: ChronoRangeFilterPreset.as::_SafeStr_5242 (name derived from defaultValue usage)
    private readonly _defaultValue: number;

    // AS3: ChronoRangeFilterPreset.as::ChronoRangeFilterPreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, skipLabel: string, exactLabel: string, rangeLabel: string, defaultValue: number, min: number, max: number, width: number)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._defaultValue = defaultValue;
        this._exactInput = presetManager.createNumberInput(new NumberInputParam(defaultValue, min, max, width));
        this._rangeMinInput = presetManager.createNumberInput(new NumberInputParam(defaultValue, min, max, width));
        this._rangeMaxInput = presetManager.createNumberInput(new NumberInputParam(defaultValue, min, max, width));
        const dash = presetManager.createText('-', new TextParam(0));
        const rangeList = presetManager.createSimpleListView(false, [this._rangeMinInput, dash, this._rangeMaxInput], true);
        const radioParams = [new RadioButtonParam(ChronoRangeFilterPreset.MODE_SKIP, skipLabel), new RadioButtonParam(ChronoRangeFilterPreset.MODE_EXACT, exactLabel, this._exactInput), new RadioButtonParam(ChronoRangeFilterPreset.MODE_RANGE, rangeLabel, rangeList)];
        this._radioGroup = presetManager.createRadioGroup(radioParams);
        this._radioGroup.selected = ChronoRangeFilterPreset.MODE_SKIP;
    }

    // AS3: ChronoRangeFilterPreset.as::applyFilter()
    applyFilter(filter: ChronoFieldRangeFilter): void
    {
        if(!filter.useFilter)
        {
            this._radioGroup.selected = ChronoRangeFilterPreset.MODE_SKIP;
            this._exactInput.value = this._defaultValue;
            this._rangeMinInput.value = this._defaultValue;
            this._rangeMaxInput.value = this._defaultValue;
            return;
        }

        if(filter.min === filter.max)
        {
            this._radioGroup.selected = ChronoRangeFilterPreset.MODE_EXACT;
            this._exactInput.value = filter.min;
            this._rangeMinInput.value = this._defaultValue;
            this._rangeMaxInput.value = this._defaultValue;
            return;
        }

        this._radioGroup.selected = ChronoRangeFilterPreset.MODE_RANGE;
        this._rangeMinInput.value = filter.min;
        this._rangeMaxInput.value = filter.max;
        this._exactInput.value = this._defaultValue;
    }

    // AS3: ChronoRangeFilterPreset.as::getFilter()
    getFilter(name: string): ChronoFieldRangeFilter
    {
        if(this._radioGroup.selected === ChronoRangeFilterPreset.MODE_SKIP)
        {
            return new ChronoFieldRangeFilter(name, false, this._defaultValue, this._defaultValue, this._defaultValue);
        }

        if(this._radioGroup.selected === ChronoRangeFilterPreset.MODE_EXACT)
        {
            return new ChronoFieldRangeFilter(name, true, this._exactInput.value, this._exactInput.value, this._defaultValue);
        }

        return new ChronoFieldRangeFilter(name, true, this._rangeMinInput.value, this._rangeMaxInput.value, this._defaultValue);
    }

    // AS3: ChronoRangeFilterPreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._radioGroup.resizeToWidth(width);
    }

    // AS3: ChronoRangeFilterPreset.as::get window()
    override get window(): IWindow
    {
        return this._radioGroup.window;
    }

    // AS3: ChronoRangeFilterPreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        return [this._radioGroup];
    }

    // AS3: ChronoRangeFilterPreset.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._radioGroup = null as unknown as RadioGroupPreset;
        this._exactInput = null as unknown as NumberInputPreset;
        this._rangeMinInput = null as unknown as NumberInputPreset;
        this._rangeMaxInput = null as unknown as NumberInputPreset;
    }
}
