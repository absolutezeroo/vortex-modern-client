import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import type {PresetManager} from '../../uibuilder/PresetManager';
import type {WiredStyle} from '../../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../../uibuilder/WiredUIBuilder';
import {RadioButtonParam} from '../../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../../uibuilder/params/SectionParam';
import type {RadioGroupPreset} from '../../uibuilder/presets/RadioGroupPreset';
import type {SectionPreset} from '../../uibuilder/presets/SectionPreset';
import {ActionTypeCodes} from '../ActionTypeCodes';
import {GiveFromChest} from './GiveFromChest';

/**
 * GiveFurniFromChest — the "give furni from chest" action: GiveFromChest plus a chest-iteration-mode
 * radio (0 = in order, 1 = random, 2 = …). The iteration mode is appended to intParams[5]; its section
 * is disabled while rewarding-mode is "all".
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4405`). Code = ActionTypeCodes.GIVE_FURNI_FROM_CHEST.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/chests/_SafeCls_4405.as
 */
export class GiveFurniFromChest extends GiveFromChest
{
    // AS3: _SafeCls_4405.as::_SafeStr_8301 (name derived: the chest-iteration section)
    private _iterationSection!: SectionPreset;

    // AS3: _SafeCls_4405.as::_iterationModeRadioGroup
    private _iterationModeRadioGroup!: RadioGroupPreset;

    // AS3: _SafeCls_4405.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.GIVE_FURNI_FROM_CHEST;
    }

    // AS3: _SafeCls_4405.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params = super.readIntParamsFromForm();
        params.push(this._iterationModeRadioGroup.selected);
        return params;
    }

    // AS3: _SafeCls_4405.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        super.onEditStart(def);
        this._iterationModeRadioGroup.selected = def.getInt(5);
        this._iterationSection.disabled = this.rewardingMode === GiveFromChest.MODE_ALL;
    }

    // AS3: _SafeCls_4405.as::onModeChange()
    protected override onModeChange(mode: number): void
    {
        super.onModeChange(mode);
        this._iterationSection.disabled = mode === GiveFromChest.MODE_ALL;
    }

    // AS3: _SafeCls_4405.as::buildInputs()
    override buildInputs(presetManager: PresetManager, wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const params = [new RadioButtonParam(0, this.l('chest_iteration_type.0')), new RadioButtonParam(1, this.l('chest_iteration_type.1')), new RadioButtonParam(2, this.l('chest_iteration_type.2'))];
        this._iterationModeRadioGroup = presetManager.createRadioGroup(params);
        this._iterationSection = presetManager.createSection(this.l('chest_iteration_type'), this._iterationModeRadioGroup, SectionParam.COLLAPSED);
        super.buildInputs(presetManager, wiredStyle, builder);
    }

    // AS3: _SafeCls_4405.as::finalizeBuilding()
    protected override finalizeBuilding(builder: WiredUIBuilder): void
    {
        super.finalizeBuilding(builder);
        builder.addElements(this._iterationSection);
    }
}
