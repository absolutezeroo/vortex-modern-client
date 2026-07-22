import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * OverrideHeight — the "override avatar walk height" wired action: a fixed/relative type selector
 * (which disables the height slider when set to relative) and a height slider (0..8000), stored as
 * intParams [height, type].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4197`; the name follows the code it returns
 * (ActionTypeCodes.OVERRIDE_HEIGHT).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4197.as
 */
export class OverrideHeight extends DefaultActionType
{
    // AS3: _SafeCls_4197.as::_type
    private _type!: RadioGroupPreset;

    // AS3: _SafeCls_4197.as::_height
    private _height!: SliderSection;

    // AS3: _SafeCls_4197.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.OVERRIDE_HEIGHT;
    }

    // AS3: _SafeCls_4197.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4197.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._type = presetManager.createRadioGroup([
            new RadioButtonParam(0, '${wiredfurni.params.override_height.type.0}'),
            new RadioButtonParam(1, '${wiredfurni.params.override_height.type.1}')
        ], this._onChangeType);
        const section = presetManager.createSection('${wiredfurni.params.override_height.type}', this._type);
        this._height = presetManager.createSliderSection('wiredfurni.params.override_height.height', '', SliderSection.CONVERTER_ECHO, 0, 8000, 1);

        builder.addElements(section, this._height);
    }

    // AS3: _SafeCls_4197.as::onChangeType()
    private _onChangeType = (selected: number): void =>
    {
        this._height.disabled = selected === 1;
    };

    // AS3: _SafeCls_4197.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._height.value = def.getInt(0);
        this._type.selected = def.getBoolean(1) ? 1 : 0;
    }

    // AS3: _SafeCls_4197.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._height.value, this._type.selected];
    }
}
