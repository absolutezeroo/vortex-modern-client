import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {TextAreaParam} from '../uibuilder/params/TextAreaParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {TextAreaPreset} from '../uibuilder/presets/TextAreaPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * Chat — the "show a message" wired action: a message text area, a visibility radio group (whisper vs
 * shout), and a notification-style dropdown. Message goes to stringParam; visibility and style to
 * intParams[0]/[1].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4348`; the name follows the code it returns
 * (ActionTypeCodes.CHAT).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4348.as
 */
export class Chat extends DefaultActionType
{
    // AS3: _SafeCls_4348.as::NOTIFICATION_STYLES
    private static readonly NOTIFICATION_STYLES: number[] = [34, 200, 201, 202, 210, 211, 212, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 250, 251, 252];

    // AS3: _SafeCls_4348.as::_SafeStr_7793 (name derived: the message text area)
    private _messageArea!: TextAreaPreset;

    // AS3: _SafeCls_4348.as::_SafeStr_8182 (name derived: the visibility radio group)
    private _visibilityRadio!: RadioGroupPreset;

    // AS3: _SafeCls_4348.as::_styleDropdown
    private _styleDropdown!: DropdownPreset;

    // AS3: _SafeCls_4348.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.CHAT;
    }

    // AS3: _SafeCls_4348.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._messageArea.text;
    }

    // AS3: _SafeCls_4348.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._visibilityRadio.selected, this._styleDropdown.selectedId];
    }

    // AS3: _SafeCls_4348.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4348.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._messageArea.text = def.stringParam;
        this._visibilityRadio.selected = def.intParams[0];
        this._styleDropdown.selectedId = def.intParams[1];
    }

    // AS3: _SafeCls_4348.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const usageInfo = presetManager.createUsageInfoSection('${wiredfurni.params.show_message.usage_info}', true);

        this._messageArea = presetManager.createTextArea(new TextAreaParam(40, -1, 8, -1, 200));
        const messageSection = presetManager.createSection('${wiredfurni.params.message}', this._messageArea);

        this._visibilityRadio = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.show_message.visibility_selection.0}'), new RadioButtonParam(1, '${wiredfurni.params.show_message.visibility_selection.1}')]);
        const visibilitySection = presetManager.createSection('${wiredfurni.params.show_message.visibility_selection.title}', this._visibilityRadio, SectionParam.COLLAPSED);

        const options: ExpandableDropdownOption[] = [];

        for(const style of Chat.NOTIFICATION_STYLES)
        {
            options.push(new ExpandableDropdownOption(style, '${wiredfurni.params.show_message.style_selection.' + style + '}'));
        }

        this._styleDropdown = presetManager.createDropdown(new DropdownParam('${wiredfurni.params.show_message.style_selection.title}', options));
        const styleSection = presetManager.createSection('${wiredfurni.params.show_message.style_selection.title}', this._styleDropdown, SectionParam.COLLAPSED);

        builder.addElements(usageInfo, messageSection, visibilitySection, styleSection);
    }
}
