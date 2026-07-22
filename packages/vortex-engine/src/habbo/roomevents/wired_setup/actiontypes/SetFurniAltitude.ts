import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueHundredth} from '../common/slider_converter/SliderValueHundredth';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * SetFurniAltitude — the "set stack height / altitude" wired action: an altitude slider (0..8000,
 * shown in hundredths) and a set/increase/decrease operator, stored as intParams [altitude, operator].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/SetFurniAltitude.as
 */
export class SetFurniAltitude extends DefaultActionType
{
    // AS3: SetFurniAltitude.as::_altitude
    private _altitude!: SliderSection;

    // AS3: SetFurniAltitude.as::_operator
    private _operator!: RadioGroupPreset;

    // AS3: SetFurniAltitude.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.SET_FURNI_ALTITUDE;
    }

    // AS3: SetFurniAltitude.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: SetFurniAltitude.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._altitude = presetManager.createSliderSection('wiredfurni.params.setaltitude', 'altitude', new SliderValueHundredth(), 0, 8000, 1);
        this._altitude.value = 0;
        this._operator = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('operator.0')),
            new RadioButtonParam(1, this.l('operator.1')),
            new RadioButtonParam(2, this.l('operator.2'))
        ]);

        builder.addElements(presetManager.createSection(this.l('choose_type'), this._operator), this._altitude);
    }

    // AS3: SetFurniAltitude.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._altitude.value = def.intParams[0];
        this._operator.selected = def.intParams[1];
    }

    // AS3: SetFurniAltitude.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._altitude.value, this._operator.selected];
    }
}
