import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * ActorIsWearingBadge — the "the actor is wearing a given badge" wired condition: a single badge-code
 * text input, stored as the string param. Exposes the negation (NOT_ACTOR_IS_WEARING_BADGE).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4379`; the name follows the code it returns
 * (ConditionCodes.ACTOR_IS_WEARING_BADGE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4379.as
 */
export class ActorIsWearingBadge extends DefaultConditionType
{
    // AS3: _SafeCls_4379.as::_badgeCode
    private _badgeCode!: TextInputPreset;

    // AS3: _SafeCls_4379.as::get code()
    override get code(): number
    {
        return ConditionCodes.ACTOR_IS_WEARING_BADGE;
    }

    // AS3: _SafeCls_4379.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_ACTOR_IS_WEARING_BADGE;
    }

    // AS3: _SafeCls_4379.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4379.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._badgeCode = presetManager.createTextInput(new TextInputParam('', 1000, null, -1, null, true, this.loc('wiredfurni.tooltip.badgecode')));
        const section = presetManager.createSection(this.l('badgecode'), this._badgeCode);

        builder.addElements(section);
    }

    // AS3: _SafeCls_4379.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._badgeCode.text;
    }

    // AS3: _SafeCls_4379.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._badgeCode.text = def.stringParam;
    }
}
