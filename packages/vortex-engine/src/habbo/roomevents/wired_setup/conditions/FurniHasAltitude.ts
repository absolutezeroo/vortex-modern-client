import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueHundredth} from '../common/slider_converter/SliderValueHundredth';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * FurniHasAltitude — the "the furni's altitude compares to a value" wired condition: a comparison
 * operator and an altitude slider (0..8000, shown in hundredths), stored as intParams
 * [altitude, comparison].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/FurniHasAltitude.as
 */
export class FurniHasAltitude extends DefaultConditionType
{
    // AS3: FurniHasAltitude.as::_altitude
    private _altitude!: SliderSection;

    // AS3: FurniHasAltitude.as::_comparison
    private _comparison!: RadioGroupPreset;

    // AS3: FurniHasAltitude.as::get code()
    override get code(): number
    {
        return ConditionCodes.FURNI_HAS_ALTITUDE;
    }

    // AS3: FurniHasAltitude.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: FurniHasAltitude.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._altitude = presetManager.createSliderSection('wiredfurni.params.setaltitude', '', new SliderValueHundredth(), 0, 8000, 1);
        this._comparison = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('comparison.0')),
            new RadioButtonParam(1, this.l('comparison.1')),
            new RadioButtonParam(2, this.l('comparison.2'))
        ]);

        builder.addElements(presetManager.createSection(this.l('comparison_selection'), this._comparison), this._altitude);
    }

    // AS3: FurniHasAltitude.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._altitude.value = def.intParams[0];
        this._comparison.selected = def.intParams[1];
    }

    // AS3: FurniHasAltitude.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._altitude.value, this._comparison.selected];
    }
}
