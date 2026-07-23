import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {DateTimeFormatter} from '@core/utils/DateTimeFormatter';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * DateRangeActive — the "current time is within a date range" wired condition: a start-date and an
 * end-date text input ("yyyy/MM/dd HH:mm"), stored as intParams [startSeconds(, endSeconds)]. The end
 * is only written when the start parses. Uses a DateTimeFormatter to render the stored epoch-seconds
 * back into the pattern on edit; parsing back is plain Date.parse.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4368`; the name follows the code it returns
 * (ConditionCodes.DATE_RANGE_ACTIVE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4368.as
 */
export class DateRangeActive extends DefaultConditionType
{
    // AS3: _SafeCls_4368.as::_SafeStr_11323 (the display/parse date-time pattern)
    private static readonly DATE_TIME_PATTERN: string = 'yyyy/MM/dd HH:mm';

    // AS3: _SafeCls_4368.as::_SafeStr_7071 (start-date input)
    private _startInput!: TextInputPreset;

    // AS3: _SafeCls_4368.as::_SafeStr_7458 (end-date input)
    private _endInput!: TextInputPreset;

    // AS3: _SafeCls_4368.as::parseDate()
    private static parseDate(value: string): number
    {
        return Date.parse(value);
    }

    // AS3: _SafeCls_4368.as::get code()
    override get code(): number
    {
        return ConditionCodes.DATE_RANGE_ACTIVE;
    }

    // AS3: _SafeCls_4368.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4368.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._startInput = presetManager.createTextInput(new TextInputParam('', 1000, null, -1, null, true, 'YYYY/MM/DD HH:MM'));
        this._endInput = presetManager.createTextInput(new TextInputParam('', 1000, null, -1, null, true, 'YYYY/MM/DD HH:MM'));

        const startSection = presetManager.createSection(this.l('startdate'), this._startInput);
        const endSection = presetManager.createSection(this.l('enddate'), this._endInput);

        builder.addElements(startSection, endSection);
    }

    // AS3: _SafeCls_4368.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];
        const start = DateRangeActive.parseDate(this._startInput.text);

        if(!isNaN(start))
        {
            params.push(Math.trunc(start / 1000));

            const end = DateRangeActive.parseDate(this._endInput.text);

            if(!isNaN(end))
            {
                params.push(Math.trunc(end / 1000));
            }
        }

        return params;
    }

    // AS3: _SafeCls_4368.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const formatter = new DateTimeFormatter('en-US');
        formatter.setDateTimePattern(DateRangeActive.DATE_TIME_PATTERN);

        this._startInput.text = def.intParams.length > 0 ? formatter.format(new Date(def.getInt(0) * 1000)) : '';
        this._endInput.text = def.intParams.length > 1 ? formatter.format(new Date(def.getInt(1) * 1000)) : '';
    }
}
