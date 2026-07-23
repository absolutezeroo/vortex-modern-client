import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {SliderValueCountOrUnlimited} from '../common/slider_converter/SliderValueCountOrUnlimited';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * GiveScore — the "give score" wired action: a points slider (1..1000), a times-in-game slider
 * (1..unlimited) and an add/subtract operation. Stored as intParams [signedPoints, times] where a
 * negative points value means "subtract" and a times of 0 means unlimited.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/GiveScore.as
 */
export class GiveScore extends DefaultActionType
{
    // AS3: GiveScore.as::_pointsMax
    private static readonly POINTS_MAX: number = 10;

    // AS3: GiveScore.as::_unlimitedTimes
    private static readonly UNLIMITED_TIMES: number = GiveScore.POINTS_MAX + 1;

    // AS3: GiveScore.as::_points
    private _points!: SliderSection;

    // AS3: GiveScore.as::_times
    private _times!: SliderSection;

    // AS3: GiveScore.as::_operation
    private _operation!: RadioGroupPreset;

    // AS3: GiveScore.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.GIVE_SCORE;
    }

    // AS3: GiveScore.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: GiveScore.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._points = presetManager.createSliderSection('wiredfurni.params.setpoints2', '', SliderSection.CONVERTER_ECHO, 1, 1000, 1);
        this._times = presetManager.createSliderSection('wiredfurni.params.settimesingame', 'times', new SliderValueCountOrUnlimited(GiveScore.UNLIMITED_TIMES), 1, GiveScore.UNLIMITED_TIMES, 1, false);
        this._operation = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('points_operation.0')),
            new RadioButtonParam(1, this.l('points_operation.1'))
        ]);

        builder.addElements(this._points, this._times, presetManager.createSection(this.l('points_operation'), this._operation));
    }

    // AS3: GiveScore.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        let points = def.getInt(0);
        const times = def.getInt(1);
        let operation = 0;

        if(points < 0)
        {
            points = -points;
            operation = 1;
        }

        this._times.visible = times !== 0;
        this._operation.selected = operation;
        this._points.value = points;
        this._times.value = times === 0 ? GiveScore.UNLIMITED_TIMES : times;
    }

    // AS3: GiveScore.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        let points = this._points.value;

        if(this._operation.selected === 1)
        {
            points = -points;
        }

        const times = this._times.value === GiveScore.UNLIMITED_TIMES ? 0 : this._times.value;

        return [points, times];
    }
}
