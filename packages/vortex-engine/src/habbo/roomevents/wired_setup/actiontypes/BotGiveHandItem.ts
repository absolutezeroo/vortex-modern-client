import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {TextInputPreset} from '../uibuilder/presets/TextInputPreset';
import type {ButtonPreset} from '../uibuilder/presets/ButtonPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultBotActionType} from './DefaultBotActionType';

/**
 * BotGiveHandItem — the "make a bot give a hand item" wired action: an optional bot-name text input
 * (behind a "use bot name" checkbox) plus a hand-item dropdown (default codes, extended on demand)
 * with a "capture" button that reads the player's current hand item. The hand-item code is stored in
 * intParams[0]; the bot name (when enabled) in stringParam.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4127`; the name follows the code it returns
 * (ActionTypeCodes.BOT_GIVE_HAND_ITEM). Extends the bot-action base DefaultBotActionType.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4127.as
 */
export class BotGiveHandItem extends DefaultBotActionType
{
    // AS3: _SafeCls_4127.as::DEFAULT_CODES
    private static readonly DEFAULT_CODES: number[] = [0, 2, 5, 7, 8, 9, 10, 27, 1126, 1127, 1128];

    // AS3: _SafeCls_4127.as::_SafeStr_8016 (name derived: the "use bot name" checkbox group)
    private _botUsageCheckboxGroup!: CheckboxGroupPreset;

    // AS3: _SafeCls_4127.as::_botName
    private _botName!: TextInputPreset;

    // AS3: _SafeCls_4127.as::_handItemDropdown
    private _handItemDropdown!: DropdownPreset;

    // AS3: _SafeCls_4127.as::_SafeStr_8793 (name derived: the capture button)
    private _captureButton!: ButtonPreset;

    // AS3: _SafeCls_4127.as::_SafeStr_5343 (name derived: the current dropdown options)
    private _options!: ExpandableDropdownOption[];

    // AS3: _SafeCls_4127.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.BOT_GIVE_HAND_ITEM;
    }

    // AS3: _SafeCls_4127.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._botUsageCheckboxGroup.optionById(0).selected ? this._botName.text : '';
    }

    // AS3: _SafeCls_4127.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const id = this._handItemDropdown.selectedId;

        return [id === -1 ? 0 : id];
    }

    // AS3: _SafeCls_4127.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const hasBotName = def.stringParam !== '';

        this._botName.text = def.stringParam;
        this._botUsageCheckboxGroup.optionById(0).selected = hasBotName;
        this._botName.window.visible = hasBotName;
        this.setSelectedHandItemByCode(def.intParams[0]);
    }

    // AS3: _SafeCls_4127.as::setSelectedHandItemByCode()
    private setSelectedHandItemByCode(code: number): void
    {
        this.ensureOptionExists(code);
        this._handItemDropdown.selectedId = code;
    }

    // AS3: _SafeCls_4127.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4127.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._botUsageCheckboxGroup = presetManager.createCheckboxGroup([new CheckboxOptionParam(this.l('bot.usage'))], (id, selected) => this.onBotUsageChange(id, selected));
        this._botName = presetManager.createTextInput(new TextInputParam('', 32, null, -1, null, true, this.loc('wiredfurni.tooltip.bot.name')));
        const nameList = presetManager.createSimpleListView(true, [this._botUsageCheckboxGroup, this._botName]);
        const nameSection = presetManager.createSection(this.l('bot.name'), nameList);

        this._options = this.createOptions(BotGiveHandItem.DEFAULT_CODES);
        this._handItemDropdown = presetManager.createDropdown(new DropdownParam(this.loc('wiredfurni.tooltip.bot.handitem'), this._options));
        this._captureButton = presetManager.createButton(this.l('capture.handitem'), () => this.captureHanditem());
        const handSection = presetManager.createSection(this.l('handitem'), presetManager.createSimpleListView(true, [this._handItemDropdown, this._captureButton]));

        builder.addElements(nameSection, handSection);
    }

    // AS3: _SafeCls_4127.as::onBotUsageChange()
    private onBotUsageChange(id: number, selected: boolean): void
    {
        if(id !== 0)
        {
            return;
        }

        this._botName.window.visible = selected;
    }

    // AS3: _SafeCls_4127.as::createOptions()
    private createOptions(codes: number[]): ExpandableDropdownOption[]
    {
        const options: ExpandableDropdownOption[] = [];

        for(const code of codes)
        {
            options.push(new ExpandableDropdownOption(code, '${handitem' + code + '}'));
        }

        return options;
    }

    // AS3: _SafeCls_4127.as::ensureOptionExists()
    private ensureOptionExists(code: number): void
    {
        if(code < 0)
        {
            return;
        }

        let exists = false;

        for(const option of this._options)
        {
            if(option.id === code)
            {
                exists = true;
                break;
            }
        }

        if(!exists)
        {
            this._options.push(new ExpandableDropdownOption(code, '${handitem' + code + '}'));
        }

        // AS3 computes the array INDEX of the matching option and passes it as reinit's selectedId;
        // that mismatch is immediately overwritten by `selectedId = code` in setSelectedHandItemByCode,
        // so it is harmless — preserved verbatim.
        let index = -1;

        for(let i = 0; i < this._options.length; i++)
        {
            if(this._options[i].id === code)
            {
                index = i;
            }
        }

        this._handItemDropdown.reinit(this._options, index);
    }

    // AS3: _SafeCls_4127.as::captureHanditem()
    private captureHanditem(): void
    {
        const code = this.roomEvents.roomEngine!.getRoomObject(this.roomEvents.roomSession!.roomId, this.roomEvents.roomSession!.ownUserRoomId, 100)!.getModel().getNumber('figure_carry_object');
        this.setSelectedHandItemByCode(code);
    }
}
