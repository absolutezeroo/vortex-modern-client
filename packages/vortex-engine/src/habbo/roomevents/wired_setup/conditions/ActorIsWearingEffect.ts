import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import type {NumberInputPreset} from '../uibuilder/presets/NumberInputPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * ActorIsWearingEffect — the "the actor is wearing a given effect" wired condition: a single effect-id
 * number input, stored as intParams [effectId]. Exposes the negation (NOT_ACTOR_IS_WEARING_EFFECT).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4337`; the name follows the code it returns
 * (ConditionCodes.ACTOR_IS_WEARING_EFFECT).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4337.as
 */
export class ActorIsWearingEffect extends DefaultConditionType
{
    // AS3: _SafeCls_4337.as::_effectId
    private _effectId!: NumberInputPreset;

    // AS3: _SafeCls_4337.as::get code()
    override get code(): number
    {
        return ConditionCodes.ACTOR_IS_WEARING_EFFECT;
    }

    // AS3: _SafeCls_4337.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_ACTOR_IS_WEARING_EFFECT;
    }

    // AS3: _SafeCls_4337.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4337.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._effectId = presetManager.createNumberInput(new NumberInputParam(0, -2147483648, 2147483647, 200, 0, false, false, this.loc('wiredfurni.tooltip.effectid')));
        const section = presetManager.createSection(this.l('effectid'), this._effectId);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4337.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._effectId.value];
    }

    // AS3: _SafeCls_4337.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._effectId.value = def.getInt(0);
    }
}
