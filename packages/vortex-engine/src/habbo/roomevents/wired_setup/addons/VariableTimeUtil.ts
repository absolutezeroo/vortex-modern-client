import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {DefaultElement} from '../DefaultElement';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {SubVariableParam} from '../uibuilder/params/applications/SubVariableParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {SubVariableCreatorPreset} from '../uibuilder/presets/applications/SubVariableCreatorPreset';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * VariableTimeUtil — the "time utility" addon: a mode dropdown (value / creation-time / last-update-time,
 * filtered by what the target variable supports) plus two sub-variable creator grids (basic calendar
 * fields in the low bitmask word, advanced duration fields in the high word). The combined mask goes to
 * intParams[0], the selected mode to intParams[1].
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4347`). Code = AddonCodes.VARIABLE_TIME_UTIL.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4347.as
 */
export class VariableTimeUtil extends DefaultAddonType
{
    // AS3: _SafeCls_4347.as::_SafeStr_9002 (name derived: the "value" mode, id 0)
    private static readonly TYPE_VALUE: number = 0;

    // AS3: _SafeCls_4347.as::TYPE_CREATION_TIME
    private static readonly TYPE_CREATION_TIME: number = 1;

    // AS3: _SafeCls_4347.as::TYPE_LAST_UPDATE_TIME
    private static readonly TYPE_LAST_UPDATE_TIME: number = 2;

    // AS3: _SafeCls_4347.as::_modeDropdown
    private _modeDropdown!: DropdownPreset;

    // AS3: _SafeCls_4347.as::_SafeStr_7855 (name derived: the basic sub-variable creator)
    private _basicVariables!: SubVariableCreatorPreset;

    // AS3: _SafeCls_4347.as::_SafeStr_7663 (name derived: the advanced sub-variable creator)
    private _advancedVariables!: SubVariableCreatorPreset;

    // AS3: _SafeCls_4347.as::get code()
    override get code(): number
    {
        return AddonCodes.VARIABLE_TIME_UTIL;
    }

    // AS3: _SafeCls_4347.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4347.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._modeDropdown = presetManager.createDropdown(new DropdownParam(this.l('choose_type'), [new ExpandableDropdownOption(VariableTimeUtil.TYPE_VALUE, this.l('time_util.mode.0')), new ExpandableDropdownOption(VariableTimeUtil.TYPE_CREATION_TIME, this.l('time_util.mode.1')), new ExpandableDropdownOption(VariableTimeUtil.TYPE_LAST_UPDATE_TIME, this.l('time_util.mode.2'))]));
        const modeSection = presetManager.createSection(this.l('choose_type'), this._modeDropdown);

        const basicParams = [new SubVariableParam(1, 'milliseconds_of_seconds'), new SubVariableParam(2, 'seconds_of_minute'), new SubVariableParam(3, 'minute_of_hour'), new SubVariableParam(4, 'hour_of_day'), new SubVariableParam(5, 'day_of_week'), new SubVariableParam(6, 'day_of_month'), new SubVariableParam(7, 'day_of_year'), new SubVariableParam(8, 'week_of_year'), new SubVariableParam(9, 'month_of_year'), new SubVariableParam(10, 'year')];
        this._basicVariables = presetManager.createSubVariableCreator('wiredfurni.params.time_util.subvariable.', basicParams);
        const basicSection = presetManager.createSection(this.loc('wiredfurni.params.create_subvariables'), this._basicVariables, SectionParam.HIDDEN);

        const advancedParams = [new SubVariableParam(20, 'millisecond'), new SubVariableParam(21, 'second'), new SubVariableParam(22, 'minute'), new SubVariableParam(23, 'hour'), new SubVariableParam(24, 'day'), new SubVariableParam(25, 'week'), new SubVariableParam(26, 'month')];
        this._advancedVariables = presetManager.createSubVariableCreator('wiredfurni.params.time_util.subvariable.', advancedParams);
        const advancedSection = presetManager.createSection(this.l('create_subvariables.advanced'), presetManager.createSimpleListView(true, [presetManager.createText(this.l('time_util.advanced_info')), this._advancedVariables]), SectionParam.COLLAPSED);

        builder.addElements(modeSection, basicSection, advancedSection);
    }

    // AS3: _SafeCls_4347.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const modeMask = def.getInt(0);
        const selectedMode = def.getInt(1);
        this._basicVariables.mask = modeMask & 0xFFFF;
        this._advancedVariables.mask = modeMask & 0xFFFF0000;

        const variables = def.wiredContext.rulesetVariables?.variables ?? [];
        const options: ExpandableDropdownOption[] = [];

        if(this.showValue(variables, selectedMode))
        {
            options.push(new ExpandableDropdownOption(VariableTimeUtil.TYPE_VALUE, this.l('time_util.mode.0')));
        }

        if(this.showCreationTime(variables, selectedMode))
        {
            options.push(new ExpandableDropdownOption(VariableTimeUtil.TYPE_CREATION_TIME, this.l('time_util.mode.1')));
        }

        if(this.showLastUpdateTime(variables, selectedMode))
        {
            options.push(new ExpandableDropdownOption(VariableTimeUtil.TYPE_LAST_UPDATE_TIME, this.l('time_util.mode.2')));
        }

        this._modeDropdown.reinit(options, selectedMode);
    }

    // AS3: _SafeCls_4347.as::showCreationTime()
    private showCreationTime(variables: WiredVariable[], mode: number): boolean
    {
        if(mode === VariableTimeUtil.TYPE_CREATION_TIME || variables.length === 0)
        {
            return true;
        }

        for(const variable of variables)
        {
            if(variable.canReadCreationTime)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: _SafeCls_4347.as::showLastUpdateTime()
    private showLastUpdateTime(variables: WiredVariable[], mode: number): boolean
    {
        if(mode === VariableTimeUtil.TYPE_LAST_UPDATE_TIME || variables.length === 0)
        {
            return true;
        }

        for(const variable of variables)
        {
            if(variable.canReadLastUpdateTime)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: _SafeCls_4347.as::showValue()
    private showValue(variables: WiredVariable[], mode: number): boolean
    {
        if(mode === VariableTimeUtil.TYPE_VALUE || variables.length === 0)
        {
            return true;
        }

        for(const variable of variables)
        {
            if(variable.hasValue)
            {
                return true;
            }
        }

        return false;
    }

    // AS3: _SafeCls_4347.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        return [this._basicVariables.mask | this._advancedVariables.mask, this._modeDropdown.selectedId];
    }
}
