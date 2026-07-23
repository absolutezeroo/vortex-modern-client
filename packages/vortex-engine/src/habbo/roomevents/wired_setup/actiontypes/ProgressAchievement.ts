import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import type {DropdownPreset} from '../uibuilder/presets/DropdownPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * ProgressAchievement — the "progress an achievement" action: an achievement dropdown (the room's
 * achievements), a progression-mode radio, and a value-or-variable score section. The achievement name
 * goes to stringParam; mode/option/value/target to intParams; the score variable to variableIds[0].
 *
 * Note: like AS3, this exposes ActionTypeCodes.PROGRESS_ACHIEVEMENT via `negativeCode` only (no `code`
 * override — it inherits the base -1); the registries resolve by either code.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/ProgressAchievement.as
 */
export class ProgressAchievement extends DefaultActionType
{
    // AS3: ProgressAchievement.as::_achievementDropdown
    private _achievementDropdown!: DropdownPreset;

    // AS3: ProgressAchievement.as::_progressionMode
    private _progressionMode!: RadioGroupPreset;

    // AS3: ProgressAchievement.as::_SafeStr_5393 (name derived: the score section)
    private _scoreSection!: ValueOrVariableSection;

    // AS3: ProgressAchievement.as::get negativeCode()
    override get negativeCode(): number
    {
        return ActionTypeCodes.PROGRESS_ACHIEVEMENT;
    }

    // AS3: ProgressAchievement.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._progressionMode.selected);
        params.push(this._scoreSection.option);
        params.push(this._scoreSection.numberValue);
        params.push(this._scoreSection.target);

        return params;
    }

    // AS3: ProgressAchievement.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this.achievementName;
    }

    // AS3: ProgressAchievement.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._scoreSection.finalizeSelection];
    }

    // AS3: ProgressAchievement.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this.initializeDropdownOptions();
        this.achievementName = def.stringParam;
        this._progressionMode.selected = def.getInt(0);

        const variableId = def.variableIds[0];
        const option = def.getInt(1);
        const value = def.getInt(2);
        const target = def.getInt(3);

        this._scoreSection.init(def.wiredContext.roomVariablesList, variableId, target, option, value);
    }

    // AS3: ProgressAchievement.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._scoreSection.onEditInitialized();
    }

    // AS3: ProgressAchievement.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: ProgressAchievement.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._achievementDropdown = presetManager.createDropdown(new DropdownParam('${wiredfurni.params.progress_achievement.name}'));
        const nameSection = presetManager.createSection('${wiredfurni.params.progress_achievement.name}', this._achievementDropdown);
        this._progressionMode = presetManager.createRadioGroup([new RadioButtonParam(1, '${wiredfurni.params.progress_achievement.mode.1}'), new RadioButtonParam(0, '${wiredfurni.params.progress_achievement.mode.0}')]);
        const modeSection = presetManager.createSection('${wiredfurni.params.progress_achievement.mode}', this._progressionMode);
        this._scoreSection = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), '${wiredfurni.params.progress_achievement.score}', 0, 2147483647);
        builder.addElements(nameSection, modeSection, this._scoreSection);
    }

    // AS3: ProgressAchievement.as::initializeDropdownOptions()
    private initializeDropdownOptions(): void
    {
        const options: ExpandableDropdownOption[] = [];
        const achievements = this.roomEvents.achievementsInRoom ?? [];

        for(let i = 0; i < achievements.length; i++)
        {
            options.push(new ExpandableDropdownOption(i, achievements[i]));
        }

        this._achievementDropdown.reinit(options, -1);
    }

    // AS3: ProgressAchievement.as::set achievementName()
    private set achievementName(value: string)
    {
        for(const option of this._achievementDropdown.dropdownOptions)
        {
            if(option.displayString === value)
            {
                this._achievementDropdown.selectedId = option.id;
                return;
            }
        }

        this._achievementDropdown.selectedId = -1;
    }

    // AS3: ProgressAchievement.as::get achievementName()
    private get achievementName(): string
    {
        return this._achievementDropdown.selected?.displayString ?? '';
    }

    // AS3: ProgressAchievement.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 1]];
    }

    // AS3: ProgressAchievement.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._scoreSection.target = b;
    }

    // AS3: ProgressAchievement.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._scoreSection.target;
    }

    // AS3: ProgressAchievement.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: ProgressAchievement.as::isInputSourceDisabled()
    override isInputSourceDisabled(_a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE)
        {
            return this._scoreSection.isSourcePickingDisabled();
        }

        return false;
    }

    // AS3: ProgressAchievement.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: ProgressAchievement.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
