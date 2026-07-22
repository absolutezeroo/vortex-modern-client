import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * FurniByType — the "furnis of the same type" wired selector: a single "match state too" checkbox,
 * stored as a boolean intParam.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4055`; the name follows the code it returns
 * (SelectorCodes.FURNI_BY_TYPE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4055.as
 */
export class FurniByType extends DefaultSelectorType
{
    // AS3: _SafeCls_4055.as::_stateCheckbox
    private _stateCheckbox!: CheckboxGroupPreset;

    // AS3: _SafeCls_4055.as::get code()
    override get code(): number
    {
        return SelectorCodes.FURNI_BY_TYPE;
    }

    // AS3: _SafeCls_4055.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4055.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._stateCheckbox = presetManager.createCheckboxGroup([new CheckboxOptionParam(this.l('state_match'), 0)]);
        const section = presetManager.createSection(this.l('select_options'), this._stateCheckbox);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4055.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._stateCheckbox.optionById(0).selected = def.getBoolean(0);
    }

    // AS3: _SafeCls_4055.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._stateCheckbox.optionById(0).selected ? 1 : 0];
    }
}
