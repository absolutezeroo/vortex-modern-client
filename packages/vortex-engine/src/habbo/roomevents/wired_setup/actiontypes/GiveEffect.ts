import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {NumberInputPreset} from '../uibuilder/presets/NumberInputPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * GiveEffect — the "give effect" wired action: an effect id (0..10000), a priority (0..2) and a
 * two-option target type (self/other), stored as intParams [effectId, priority, type].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4020`; the name follows the code it returns
 * (ActionTypeCodes.GIVE_EFFECT).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4020.as
 */
export class GiveEffect extends DefaultActionType
{
    // AS3: _SafeCls_4020.as::_SafeStr_7207 (name derived)
    private _effectId!: NumberInputPreset;

    // AS3: _SafeCls_4020.as::_priority
    private _priority!: NumberInputPreset;

    // AS3: _SafeCls_4020.as::_SafeStr_4778 (name derived)
    private _type!: RadioGroupPreset;

    // AS3: _SafeCls_4020.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.GIVE_EFFECT;
    }

    // AS3: _SafeCls_4020.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4020.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._effectId = presetManager.createNumberInput(new NumberInputParam(13, 0, 10000));
        const idSection = presetManager.createSection('${wiredfurni.params.give_effect.id}', this._effectId);
        this._priority = presetManager.createNumberInput(new NumberInputParam(2, 0, 2));
        const prioritySection = presetManager.createSection('${wiredfurni.params.give_effect.priority}', this._priority);
        this._type = presetManager.createRadioGroup([
            new RadioButtonParam(0, '${wiredfurni.params.give_effect.type.0}'),
            new RadioButtonParam(1, '${wiredfurni.params.give_effect.type.1}')
        ], null, 2);
        const typeSection = presetManager.createSection('${wiredfurni.params.give_effect.type}', this._type);

        builder.addElements(idSection, prioritySection, typeSection);
    }

    // AS3: _SafeCls_4020.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._effectId.value = def.getInt(0);
        this._priority.value = def.getInt(1);
        this._type.selected = def.getBoolean(2) ? 1 : 0;
    }

    // AS3: _SafeCls_4020.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._effectId.value, this._priority.value, this._type.selected];
    }
}
