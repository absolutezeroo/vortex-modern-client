import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {SliderValueHundredth} from '../common/slider_converter/SliderValueHundredth';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * FurniWithAltitude — the "furnis at a compared altitude" wired selector: an altitude slider (0..8000,
 * hundredths) and a comparison operator, stored as intParams [altitude, comparison].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/FurniWithAltitude.as
 */
export class FurniWithAltitude extends DefaultSelectorType
{
    // AS3: FurniWithAltitude.as::_altitude
    private _altitude!: SliderSection;

    // AS3: FurniWithAltitude.as::_comparison
    private _comparison!: RadioGroupPreset;

    // AS3: FurniWithAltitude.as::get code()
    override get code(): number
    {
        return SelectorCodes.FURNI_WITH_ALTITUDE;
    }

    // AS3: FurniWithAltitude.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: FurniWithAltitude.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._altitude = presetManager.createSliderSection('wiredfurni.params.setaltitude', 'altitude', new SliderValueHundredth(), 0, 8000, 1);
        this._altitude.value = 0;
        this._comparison = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('comparison.0')),
            new RadioButtonParam(1, this.l('comparison.1')),
            new RadioButtonParam(2, this.l('comparison.2'))
        ]);

        builder.addElements(presetManager.createSection(this.l('comparison_selection'), this._comparison), this._altitude);
    }

    // AS3: FurniWithAltitude.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._altitude.value = def.getInt(0);
        this._comparison.selected = def.getInt(1);
    }

    // AS3: FurniWithAltitude.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._altitude.value, this._comparison.selected];
    }
}
