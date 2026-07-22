import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * FreezeUser — the "freeze a user" wired action: a freeze-effect dropdown and a "cancel on teleport"
 * checkbox. Effect goes to intParams[0]; the cancel-on-teleport flag to intParams[1] (0/1).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4182`; the name follows the code it returns
 * (ActionTypeCodes.FREEZE_USER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4182.as
 */
export class FreezeUser extends DefaultActionType
{
    // AS3: _SafeCls_4182.as::_effectDropdown
    private _effectDropdown!: DropdownPreset;

    // AS3: _SafeCls_4182.as::_cancelCheckbox
    private _cancelCheckbox!: CheckboxGroupPreset;

    // AS3: _SafeCls_4182.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.FREEZE_USER;
    }

    // AS3: _SafeCls_4182.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4182.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const options: ExpandableDropdownOption[] = [];

        for(let i = 0; i <= 4; i++)
        {
            options.push(new ExpandableDropdownOption(i, this.l('freeze.effect.' + i)));
        }

        this._effectDropdown = presetManager.createDropdown(new DropdownParam('${wiredfurni.params.freeze.effect_selection}', options));
        this._cancelCheckbox = presetManager.createCheckboxGroup([new CheckboxOptionParam(this.l('freeze.cancel_on_teleport'), 0)]);
        const list = presetManager.createSimpleListView(true, [this._effectDropdown, this._cancelCheckbox]);
        const section = presetManager.createSection('${wiredfurni.params.freeze.effect_selection}', list);
        builder.addElements(section);
    }

    // AS3: _SafeCls_4182.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._effectDropdown.selectedId = def.intParams[0];
        this._cancelCheckbox.optionById(0).selected = def.getBoolean(1);
    }

    // AS3: _SafeCls_4182.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._effectDropdown.selectedId, this._cancelCheckbox.optionById(0).selected ? 1 : 0];
    }
}
