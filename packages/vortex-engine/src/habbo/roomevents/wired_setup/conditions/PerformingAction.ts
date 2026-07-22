import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import {WiredUserAction} from '../common/utils/WiredUserAction';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {SectionPreset} from '../uibuilder/presets/SectionPreset';
import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * PerformingAction — the "actor is performing a given action" wired condition: an action dropdown
 * (wave/blow/.../sign/dance), plus a sign-index dropdown and a dance-index dropdown revealed (each
 * behind its own checkbox) only when the selected action is sign (#10) or dance (#11). The action
 * code is stored in intParams[0]; the extra sign/dance index is encoded into stringParam.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4326`; the name follows the code it returns
 * (ConditionCodes.PERFORMING_ACTION). The action/dance/sign logic is byte-identical to the selector
 * UsersPerformingAction and the trigger UserPerformsAction (AS3 duplicates it three times).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4326.as
 */
export class PerformingAction extends DefaultConditionType
{
    // AS3: _SafeCls_4326.as::SIGN_ACTION_CODE (decompiler inlined the literal 10; usage restored)
    private static readonly SIGN_ACTION_CODE: number = 10;

    // AS3: _SafeCls_4326.as::DANCE_ACTION_CODE (decompiler inlined the literal 11; usage restored)
    private static readonly DANCE_ACTION_CODE: number = 11;

    // AS3: _SafeCls_4326.as::_actionDropdown
    private _actionDropdown!: DropdownPreset;

    // AS3: _SafeCls_4326.as::_SafeStr_7030 (name derived: the sign-filter checkbox group)
    private _signCheckboxGroup!: CheckboxGroupPreset;

    // AS3: _SafeCls_4326.as::_SafeStr_7159 (name derived: the dance-filter checkbox group)
    private _danceCheckboxGroup!: CheckboxGroupPreset;

    // AS3: _SafeCls_4326.as::_signDropdown
    private _signDropdown!: DropdownPreset;

    // AS3: _SafeCls_4326.as::_danceDropdown
    private _danceDropdown!: DropdownPreset;

    // AS3: _SafeCls_4326.as::_SafeStr_6939 (name derived: the sign-selection section)
    private _signSection!: SectionPreset;

    // AS3: _SafeCls_4326.as::_SafeStr_7143 (name derived: the dance-selection section)
    private _danceSection!: SectionPreset;

    // AS3: _SafeCls_4326.as::getActionByCode()
    private static getActionByCode(code: number): WiredUserAction | null
    {
        for(const action of WiredUserAction.allWiredUserActions)
        {
            if(code === action.code)
            {
                return action;
            }
        }

        return null;
    }

    // AS3: _SafeCls_4326.as::get code()
    override get code(): number
    {
        return ConditionCodes.PERFORMING_ACTION;
    }

    // AS3: _SafeCls_4326.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_PERFORMING_ACTION;
    }

    // AS3: _SafeCls_4326.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._actionDropdown.selectedId = def.intParams[0];
        this.updateExtraSections(def.stringParam);
    }

    // AS3: _SafeCls_4326.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        const action = this.getSelectedAction();

        if(action !== null && action.hasExtra)
        {
            const extra = this.getSelectedExtraCode(action.code);

            if(extra !== -1)
            {
                return action.convertCodeToExtraString(extra);
            }
        }

        return '';
    }

    // AS3: _SafeCls_4326.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];
        const action = this.getSelectedAction();

        // AS3: push(action?.code) — action is non-null in practice (selectedId 0 → "wave"); AS3's
        // undefined would coerce to 0 at writeInt, so push 0 when null to keep the wire identical.
        params.push(action !== null ? action.code : 0);

        return params;
    }

    // AS3: _SafeCls_4326.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4326.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._actionDropdown = presetManager.createDropdown(new DropdownParam(this.loc('wiredfurni.tooltip.action'), this.buildActionOptions(), () => this.onActionSelected()));
        const actionSection = presetManager.createSection(this.l('action_selection'), this._actionDropdown);

        this._signDropdown = presetManager.createDropdown(new DropdownParam(this.loc('wiredfurni.tooltip.sign'), this.buildSignOptions()));
        const signOption = new CheckboxOptionParam(this.l('sign_filter'), 0);
        signOption.extra2 = this._signDropdown;
        this._signCheckboxGroup = presetManager.createCheckboxGroup([signOption]);
        this._signSection = presetManager.createSection(this.l('sign_selection'), this._signCheckboxGroup);

        this._danceDropdown = presetManager.createDropdown(new DropdownParam(this.loc('wiredfurni.tooltip.dance'), this.buildDanceOptions()));
        const danceOption = new CheckboxOptionParam(this.l('dance_filter'), 0);
        danceOption.extra2 = this._danceDropdown;
        this._danceCheckboxGroup = presetManager.createCheckboxGroup([danceOption]);
        this._danceSection = presetManager.createSection(this.l('dance_selection'), this._danceCheckboxGroup);

        this._signSection.visible = false;
        this._danceSection.visible = false;

        builder.addElements(actionSection, this._signSection, this._danceSection);
    }

    // AS3: _SafeCls_4326.as::onActionSelected() — the dropdown option arg is unused (AS3 ignores it).
    private onActionSelected(): void
    {
        this.updateExtraSections();
    }

    // AS3: _SafeCls_4326.as::updateExtraSections()
    private updateExtraSections(stringParam: string = ''): void
    {
        const action = this.getSelectedAction();

        if(action === null || !action.hasExtra)
        {
            this._signSection.visible = false;
            this._danceSection.visible = false;
            return;
        }

        const isSign = action.code === PerformingAction.SIGN_ACTION_CODE;
        const isDance = action.code === PerformingAction.DANCE_ACTION_CODE;

        this._signSection.visible = isSign;
        this._danceSection.visible = isDance;

        if(isSign)
        {
            if(stringParam === '')
            {
                this._signCheckboxGroup.optionById(0).selected = false;
                this._signDropdown.selectedId = -1;
            }
            else
            {
                this._signCheckboxGroup.optionById(0).selected = true;
                this._signDropdown.selectedId = action.convertExtraStringToCode(stringParam);
            }
        }

        if(isDance)
        {
            if(stringParam === '')
            {
                this._danceCheckboxGroup.optionById(0).selected = false;
                this._danceDropdown.selectedId = -1;
            }
            else
            {
                this._danceCheckboxGroup.optionById(0).selected = true;
                this._danceDropdown.selectedId = action.convertExtraStringToCode(stringParam);
            }
        }
    }

    // AS3: _SafeCls_4326.as::getSelectedAction()
    private getSelectedAction(): WiredUserAction | null
    {
        return PerformingAction.getActionByCode(this._actionDropdown.selectedId);
    }

    // AS3: _SafeCls_4326.as::getSelectedExtraCode()
    private getSelectedExtraCode(actionCode: number): number
    {
        if(actionCode === PerformingAction.SIGN_ACTION_CODE)
        {
            return this._signCheckboxGroup.optionById(0).selected ? this._signDropdown.selectedId : -1;
        }

        if(actionCode === PerformingAction.DANCE_ACTION_CODE)
        {
            return this._danceCheckboxGroup.optionById(0).selected ? this._danceDropdown.selectedId : -1;
        }

        return -1;
    }

    // AS3: _SafeCls_4326.as::buildActionOptions()
    private buildActionOptions(): ExpandableDropdownOption[]
    {
        const options: ExpandableDropdownOption[] = [];

        for(const action of WiredUserAction.allWiredUserActions)
        {
            options.push(new ExpandableDropdownOption(action.code, this.l('action.' + action.code)));
        }

        return options;
    }

    // AS3: _SafeCls_4326.as::buildSignOptions()
    private buildSignOptions(): ExpandableDropdownOption[]
    {
        const options: ExpandableDropdownOption[] = [];

        for(let i = 0; i <= 17; i++)
        {
            options.push(new ExpandableDropdownOption(i, this.l('action.sign.' + i)));
        }

        return options;
    }

    // AS3: _SafeCls_4326.as::buildDanceOptions()
    private buildDanceOptions(): ExpandableDropdownOption[]
    {
        const options: ExpandableDropdownOption[] = [];

        for(let i = 1; i <= 4; i++)
        {
            options.push(new ExpandableDropdownOption(i, this.l('action.dance.' + i)));
        }

        return options;
    }
}
