import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {ButtonPreset} from '../uibuilder/presets/ButtonPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * ActorHasHanditem — the "actor is holding a given hand item" wired condition: a hand-item dropdown
 * (a default set of codes, extended on demand) plus a "capture" button that reads the hand item the
 * player is currently holding. The chosen hand-item code is stored in intParams[0].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4118`; the name follows the code it returns
 * (ConditionCodes.ACTOR_HAS_HANDITEM). Body is byte-identical to the selector UsersWithHanditem.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4118.as
 */
export class ActorHasHanditem extends DefaultConditionType
{
    // AS3: _SafeCls_4118.as::DEFAULT_CODES
    private static readonly DEFAULT_CODES: number[] = [0, 2, 5, 7, 8, 9, 10, 27];

    // AS3: _SafeCls_4118.as::_handItemDropdown
    private _handItemDropdown!: DropdownPreset;

    // AS3: _SafeCls_4118.as::_SafeStr_8793 (name derived: the capture button)
    private _captureButton!: ButtonPreset;

    // AS3: _SafeCls_4118.as::_SafeStr_5343 (name derived: the current dropdown options)
    private _options!: ExpandableDropdownOption[];

    // AS3: _SafeCls_4118.as::get code()
    override get code(): number
    {
        return ConditionCodes.ACTOR_HAS_HANDITEM;
    }

    // AS3: _SafeCls_4118.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_HAS_HANDITEM;
    }

    // AS3: _SafeCls_4118.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4118.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._options = this.createOptions(ActorHasHanditem.DEFAULT_CODES);
        this._handItemDropdown = presetManager.createDropdown(new DropdownParam(this.loc('wiredfurni.tooltip.handitem'), this._options));
        this._captureButton = presetManager.createButton(this.l('capture.handitem'), () => this.captureHanditem());
        const section = presetManager.createSection(this.l('handitem'), presetManager.createSimpleListView(true, [this._handItemDropdown, this._captureButton]));
        builder.addElements(section);
    }

    // AS3: _SafeCls_4118.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const id = this._handItemDropdown.selectedId;

        return [id === -1 ? 0 : id];
    }

    // AS3: _SafeCls_4118.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this.setSelectedHandItemByCode(def.getInt(0));
    }

    // AS3: _SafeCls_4118.as::createOptions()
    private createOptions(codes: number[]): ExpandableDropdownOption[]
    {
        const options: ExpandableDropdownOption[] = [];

        for(const code of codes)
        {
            options.push(new ExpandableDropdownOption(code, '${handitem' + code + '}'));
        }

        return options;
    }

    // AS3: _SafeCls_4118.as::ensureOptionExists()
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

    // AS3: _SafeCls_4118.as::setSelectedHandItemByCode()
    private setSelectedHandItemByCode(code: number): void
    {
        this.ensureOptionExists(code);
        this._handItemDropdown.selectedId = code;
    }

    // AS3: _SafeCls_4118.as::captureHanditem()
    private captureHanditem(): void
    {
        const code = this.roomEvents.roomEngine!.getRoomObject(this.roomEvents.roomSession!.roomId, this.roomEvents.roomSession!.ownUserRoomId, 100)!.getModel().getNumber('figure_carry_object');
        this.setSelectedHandItemByCode(code);
    }
}
