import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * WriteToLog — the "write to logs" wired action: a log-level dropdown and a log-message text input.
 * Log level goes to intParams[0]; the message to stringParam.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_3593` and its code constants are the value-
 * named ActionTypeCodes.ACTION_CODE_49/50 — no real name exists in any source tree. The name is derived
 * from the localization keys it uses (`wiredfurni.params.write_to_logs.*`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_3593.as
 */
export class WriteToLog extends DefaultActionType
{
    // AS3: _SafeCls_3593.as::_section1
    private _section1!: SectionPreset;

    // AS3: _SafeCls_3593.as::_SafeStr_7629 (name derived: the log-level dropdown)
    private _logLevelDropdown!: DropdownPreset;

    // AS3: _SafeCls_3593.as::_section2
    private _section2!: SectionPreset;

    // AS3: _SafeCls_3593.as::_SafeStr_8156 (name derived: the log-message input)
    private _messageInput!: TextInputPreset;

    // AS3: _SafeCls_3593.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.ACTION_CODE_49;
    }

    // AS3: _SafeCls_3593.as::get negativeCode()
    override get negativeCode(): number
    {
        return ActionTypeCodes.ACTION_CODE_50;
    }

    // AS3: _SafeCls_3593.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._logLevelDropdown.selectedId);

        return params;
    }

    // AS3: _SafeCls_3593.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._messageInput.text;
    }

    // AS3: _SafeCls_3593.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._logLevelDropdown.selectedId = def.getInt(0);
        this._messageInput.text = def.stringParam;
    }

    // AS3: _SafeCls_3593.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_3593.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const options: ExpandableDropdownOption[] = [];

        options.push(new ExpandableDropdownOption(0, '${wiredfurni.params.write_to_logs.log_level.0}'));
        options.push(new ExpandableDropdownOption(1, '${wiredfurni.params.write_to_logs.log_level.1}'));
        options.push(new ExpandableDropdownOption(2, '${wiredfurni.params.write_to_logs.log_level.2}'));
        options.push(new ExpandableDropdownOption(3, '${wiredfurni.params.write_to_logs.log_level.3}'));

        this._logLevelDropdown = presetManager.createDropdown(new DropdownParam('${wiredfurni.params.write_to_logs.log_level.title}', options));
        this._section1 = presetManager.createSection('${wiredfurni.params.write_to_logs.log_level.title}', this._logLevelDropdown);

        this._messageInput = presetManager.createTextInput(new TextInputParam('', 400));
        this._section2 = presetManager.createSection('${wiredfurni.params.write_to_logs.log_message.title}', this._messageInput);

        builder.addElements(this._section1, this._section2);
    }
}
