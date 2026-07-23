import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {ChronoFieldRangeFilter} from '../common/utils/ChronoFieldRangeFilter';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import type {ChronoRangeFilterPreset} from '../uibuilder/presets/applications/ChronoRangeFilterPreset';
import {ChronoMatchBase} from './ChronoMatchBase';
import {ConditionCodes} from './ConditionCodes';

/**
 * TimeMatches — the "current time matches" condition: three ChronoRangeFilter pickers (hours 0–23,
 * minutes 0–59, seconds 0–59) plus the inherited timezone dropdown. Each field's use-flag and min/max
 * are serialized into intParams; the timezone into stringParam.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/TimeMatches.as
 */
export class TimeMatches extends ChronoMatchBase
{
    // AS3: TimeMatches.as::SECONDS_CONTAINER_NAME
    private static readonly SECONDS_CONTAINER_NAME: string = 'second';

    // AS3: TimeMatches.as::MINUTES_CONTAINER_NAME
    private static readonly MINUTES_CONTAINER_NAME: string = 'minute';

    // AS3: TimeMatches.as::HOURS_CONTAINER_NAME
    private static readonly HOURS_CONTAINER_NAME: string = 'hour';

    // AS3: TimeMatches.as::_SafeStr_8002 (name derived: the seconds range filter)
    private _secondsFilter!: ChronoRangeFilterPreset;

    // AS3: TimeMatches.as::_SafeStr_7835 (name derived: the minutes range filter)
    private _minutesFilter!: ChronoRangeFilterPreset;

    // AS3: TimeMatches.as::_SafeStr_8287 (name derived: the hours range filter)
    private _hoursFilter!: ChronoRangeFilterPreset;

    // AS3: TimeMatches.as::get code()
    override get code(): number
    {
        return ConditionCodes.TIME_MATCHES;
    }

    // AS3: TimeMatches.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: TimeMatches.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const skip = this.l('time.skip');
        const exact = this.l('time.exact');
        const range = this.l('time.range');
        this._hoursFilter = presetManager.createChronoRangeFilter(skip, exact, range, 0, 0, 23, 25);
        this._minutesFilter = presetManager.createChronoRangeFilter(skip, exact, range, 0, 0, 59, 25);
        this._secondsFilter = presetManager.createChronoRangeFilter(skip, exact, range, 0, 0, 59, 25);
        const hourSection = presetManager.createSection(this.l('time.hour_selection'), this._hoursFilter);
        const minuteSection = presetManager.createSection(this.l('time.minute_selection'), this._minutesFilter);
        const secondSection = presetManager.createSection(this.l('time.second_selection'), this._secondsFilter);
        const timezoneSection = this.createTimezoneSection(presetManager);
        builder.addElements(hourSection, minuteSection, secondSection, timezoneSection);
    }

    // AS3: TimeMatches.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);
        const secondsUse = def.getInt(0);
        const minutesUse = def.getInt(1);
        const hoursUse = def.getInt(2);
        const secondsMin = def.getInt(3);
        const secondsMax = def.getInt(4);
        const minutesMin = def.getInt(5);
        const minutesMax = def.getInt(6);
        const hoursMin = def.getInt(7);
        const hoursMax = def.getInt(8);
        this._secondsFilter.applyFilter(new ChronoFieldRangeFilter(TimeMatches.SECONDS_CONTAINER_NAME, secondsUse === 1, secondsMin, secondsMax, 0));
        this._minutesFilter.applyFilter(new ChronoFieldRangeFilter(TimeMatches.MINUTES_CONTAINER_NAME, minutesUse === 1, minutesMin, minutesMax, 0));
        this._hoursFilter.applyFilter(new ChronoFieldRangeFilter(TimeMatches.HOURS_CONTAINER_NAME, hoursUse === 1, hoursMin, hoursMax, 0));
    }

    // AS3: TimeMatches.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];
        const seconds = this._secondsFilter.getFilter(TimeMatches.SECONDS_CONTAINER_NAME);
        const minutes = this._minutesFilter.getFilter(TimeMatches.MINUTES_CONTAINER_NAME);
        const hours = this._hoursFilter.getFilter(TimeMatches.HOURS_CONTAINER_NAME);
        params.push(seconds.useFilter ? 1 : 0);
        params.push(minutes.useFilter ? 1 : 0);
        params.push(hours.useFilter ? 1 : 0);
        params.push(seconds.min);
        params.push(seconds.max);
        params.push(minutes.min);
        params.push(minutes.max);
        params.push(hours.min);
        params.push(hours.max);
        return params;
    }
}
