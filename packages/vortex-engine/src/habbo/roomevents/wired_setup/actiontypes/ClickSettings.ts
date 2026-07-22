import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * ClickSettings — the "configure click behaviour" wired action: a user-click-settings dropdown and a
 * furni-click-settings dropdown, stored in intParams[0]/[1].
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4133` and its code constant is the value-named
 * ActionTypeCodes.ACTION_CODE_54 — no real name exists in any source tree. The name is derived from the
 * localization keys it uses (`wiredfurni.params.click_settings.user`/`.furni`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4133.as
 */
export class ClickSettings extends DefaultActionType
{
    // AS3: _SafeCls_4133.as::_SafeStr_7738 (name derived: the user-click settings dropdown)
    private _userClickDropdown!: DropdownPreset;

    // AS3: _SafeCls_4133.as::_SafeStr_7897 (name derived: the furni-click settings dropdown)
    private _furniClickDropdown!: DropdownPreset;

    // AS3: _SafeCls_4133.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.ACTION_CODE_54;
    }

    // AS3: _SafeCls_4133.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._userClickDropdown.selectedId);
        params.push(this._furniClickDropdown.selectedId);

        return params;
    }

    // AS3: _SafeCls_4133.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._userClickDropdown.selectedId = def.getInt(0);
        this._furniClickDropdown.selectedId = def.getInt(1);
    }

    // AS3: _SafeCls_4133.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4133.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const userOptions: ExpandableDropdownOption[] = [];

        userOptions.push(new ExpandableDropdownOption(0, '${wiredfurni.params.click_settings.user.0}'));
        userOptions.push(new ExpandableDropdownOption(1, '${wiredfurni.params.click_settings.user.1}'));
        userOptions.push(new ExpandableDropdownOption(2, '${wiredfurni.params.click_settings.user.2}'));

        this._userClickDropdown = presetManager.createDropdown(new DropdownParam('${wiredfurni.params.click_settings.user}', userOptions));
        const userSection = presetManager.createSection('${wiredfurni.params.click_settings.user}', this._userClickDropdown);

        const furniOptions: ExpandableDropdownOption[] = [];

        furniOptions.push(new ExpandableDropdownOption(0, '${wiredfurni.params.click_settings.furni.0}'));
        furniOptions.push(new ExpandableDropdownOption(1, '${wiredfurni.params.click_settings.furni.1}'));

        this._furniClickDropdown = presetManager.createDropdown(new DropdownParam('${wiredfurni.params.click_settings.furni}', furniOptions));
        const furniSection = presetManager.createSection('${wiredfurni.params.click_settings.furni}', this._furniClickDropdown);

        builder.addElements(userSection, furniSection);
    }
}
