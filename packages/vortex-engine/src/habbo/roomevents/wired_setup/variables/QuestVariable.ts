import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariableHolderType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableHolderType';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import type {VariableNameSection} from '../uibuilder/presets/sections/VariableNameSection';
import {VariableCodes} from './VariableCodes';
import {DefaultVariableType} from './DefaultVariableType';

/**
 * QuestVariable — the quest variable declaration: a variable name and a quest-name text input. Stored
 * as "variableName\tquestName" in the string param.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4245`; the name follows its quest_name form
 * (code VariableCodes.QUEST_VARIABLE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/_SafeCls_4245.as
 */
export class QuestVariable extends DefaultVariableType
{
    // AS3: _SafeCls_4245.as::STRING_PARAM_SPLITTER
    private static readonly STRING_PARAM_SPLITTER: string = '\t';

    // AS3: _SafeCls_4245.as::_variableName
    private _variableName!: VariableNameSection;

    // AS3: _SafeCls_4245.as::_questName
    private _questName!: TextInputPreset;

    // AS3: _SafeCls_4245.as::get code()
    override get code(): number
    {
        return VariableCodes.QUEST_VARIABLE;
    }

    // AS3: _SafeCls_4245.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4245.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._variableName = presetManager.createVariableNameSection();
        this._questName = presetManager.createTextInput(new TextInputParam('', 500));
        const section = presetManager.createSection(this.l('variables.quest_name'), this._questName);

        builder.addElements(this._variableName, section);
    }

    // AS3: _SafeCls_4245.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._variableName.variableName + QuestVariable.STRING_PARAM_SPLITTER + this._questName.text;
    }

    // AS3: _SafeCls_4245.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const parts = def.stringParam.split(QuestVariable.STRING_PARAM_SPLITTER);
        this.initialVariableName = parts.length > 0 ? parts[0] : '';
        this._questName.text = parts.length > 1 ? parts[1] : '';
    }

    // AS3: _SafeCls_4245.as::variableType()
    override variableType(): number
    {
        return WiredVariableHolderType.USER;
    }

    // AS3: _SafeCls_4245.as::get variableNameSection()
    protected override get variableNameSection(): VariableNameSection | null
    {
        return this._variableName;
    }
}
