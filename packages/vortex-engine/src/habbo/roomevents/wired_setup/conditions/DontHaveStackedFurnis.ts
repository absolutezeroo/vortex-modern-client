import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * DontHaveStackedFurnis — the "the furni has no furnis stacked on it" wired condition (the negation of
 * HasStackedFurnis): a require-none / require-any selector, stored as intParams [mode].
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/DontHaveStackedFurnis.as
 */
export class DontHaveStackedFurnis extends DefaultConditionType
{
    // AS3: DontHaveStackedFurnis.as::_mode
    private _mode!: RadioGroupPreset;

    // AS3: DontHaveStackedFurnis.as::get code()
    override get code(): number
    {
        return ConditionCodes.NOT_HAS_STACKED_FURNIS;
    }

    // AS3: DontHaveStackedFurnis.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: DontHaveStackedFurnis.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._mode = presetManager.createRadioGroup([
            new RadioButtonParam(0, this.l('not_requireall.0')),
            new RadioButtonParam(1, this.l('not_requireall.1'))
        ]);
        const section = presetManager.createSection(this.l('requireall'), this._mode);

        builder.addElements(section);
    }

    // AS3: DontHaveStackedFurnis.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._mode.selected = def.intParams[0];
    }

    // AS3: DontHaveStackedFurnis.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._mode.selected];
    }
}
