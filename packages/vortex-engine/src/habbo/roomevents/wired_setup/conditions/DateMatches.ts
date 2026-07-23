import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {ChronoFieldRangeFilter} from '../common/utils/ChronoFieldRangeFilter';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {ChronoMaskFilterPreset} from '../uibuilder/presets/applications/ChronoMaskFilterPreset';
import type {ChronoRangeFilterPreset} from '../uibuilder/presets/applications/ChronoRangeFilterPreset';
import {ChronoMatchBase} from './ChronoMatchBase';
import {ConditionCodes} from './ConditionCodes';

/**
 * DateMatches — the "current date matches" condition: a weekday bitmask (7 checkboxes), a day-of-month
 * ChronoRangeFilter (1–31), a month bitmask (12 checkboxes) and a year ChronoRangeFilter (0–9999), plus
 * the inherited timezone dropdown. Use-flags, masks and min/max serialize into intParams; the timezone
 * into stringParam.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/DateMatches.as
 */
export class DateMatches extends ChronoMatchBase
{
    // AS3: DateMatches.as::_SafeStr_7777 (name derived: the weekday bitmask)
    private _weekdayMask!: ChronoMaskFilterPreset;

    // AS3: DateMatches.as::_SafeStr_7757 (name derived: the day-of-month range filter)
    private _dayFilter!: ChronoRangeFilterPreset;

    // AS3: DateMatches.as::_SafeStr_8276 (name derived: the month bitmask)
    private _monthMask!: ChronoMaskFilterPreset;

    // AS3: DateMatches.as::_SafeStr_7550 (name derived: the year range filter)
    private _yearFilter!: ChronoRangeFilterPreset;

    // AS3: DateMatches.as::get code()
    override get code(): number
    {
        return ConditionCodes.DATE_MATCHES;
    }

    // AS3: DateMatches.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: DateMatches.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const skip = this.l('time.skip');
        const exact = this.l('time.exact');
        const range = this.l('time.range');
        this._weekdayMask = presetManager.createChronoMaskFilter(this.buildWeekdayLabels(), 2);
        this._dayFilter = presetManager.createChronoRangeFilter(skip, exact, range, 1, 1, 31, 25);
        this._monthMask = presetManager.createChronoMaskFilter(this.buildMonthLabels(), 3);
        this._yearFilter = presetManager.createChronoRangeFilter(skip, exact, range, 0, 0, 9999, 35);
        const weekdaySection = presetManager.createSection(this.l('time.weekday_selection'), this._weekdayMask);
        const daySection = presetManager.createSection(this.l('time.day_selection'), this._dayFilter);
        const monthSection = presetManager.createSection(this.l('time.month_selection'), this._monthMask);
        const yearSection = presetManager.createSection(this.l('time.year_selection'), this._yearFilter);
        const timezoneSection = this.createTimezoneSection(presetManager);
        builder.addElements(weekdaySection, daySection, monthSection, yearSection, timezoneSection);
    }

    // AS3: DateMatches.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);
        const dayUse = def.getInt(0);
        const yearUse = def.getInt(1);
        const weekdayMask = def.getInt(2);
        const dayMin = def.getInt(3);
        const dayMax = def.getInt(4);
        const monthMask = def.getInt(5);
        const yearMin = def.getInt(6);
        const yearMax = def.getInt(7);
        this._weekdayMask.mask = weekdayMask;
        this._dayFilter.applyFilter(new ChronoFieldRangeFilter('day', dayUse === 1, dayMin, dayMax, 1));
        this._monthMask.mask = monthMask;
        this._yearFilter.applyFilter(new ChronoFieldRangeFilter('year', yearUse === 1, yearMin, yearMax, 0));
    }

    // AS3: DateMatches.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];
        const day = this._dayFilter.getFilter('day');
        const year = this._yearFilter.getFilter('year');
        params.push(day.useFilter ? 1 : 0);
        params.push(year.useFilter ? 1 : 0);
        params.push(this._weekdayMask.mask);
        params.push(day.min);
        params.push(day.max);
        params.push(this._monthMask.mask);
        params.push(year.min);
        params.push(year.max);
        return params;
    }

    // AS3: DateMatches.as::buildWeekdayLabels()
    private buildWeekdayLabels(): string[]
    {
        const labels: string[] = [];

        for(let i = 1; i <= 7; i++)
        {
            labels.push(this.l('time.weekday.' + i));
        }

        return labels;
    }

    // AS3: DateMatches.as::buildMonthLabels()
    private buildMonthLabels(): string[]
    {
        const labels: string[] = [];

        for(let i = 1; i <= 12; i++)
        {
            labels.push(this.l('time.month.' + i));
        }

        return labels;
    }
}
