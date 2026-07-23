import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import type {CheckboxOptionPreset} from '../uibuilder/presets/CheckboxOptionPreset';
import type {NamedTextInputPreset} from '../uibuilder/presets/combinations/NamedTextInputPreset';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * ProgressRewardTrack — the "progress a reward track" action: track-id and task-id named text inputs
 * (restricted to a-zA-Z0-9_), an "add to existing score" checkbox, and a value-or-variable score
 * section. Track/task ids go to stringParam ("track\ttask"); add-to-existing/option/value/target to
 * intParams; the score variable to variableIds[0].
 *
 * Name derived: obfuscated in AS3 only by member names (the class keeps its real name). Code =
 * ActionTypeCodes.PROGRESS_REWARD_TRACK.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/ProgressRewardTrack.as
 */
export class ProgressRewardTrack extends DefaultActionType
{
    // AS3: ProgressRewardTrack.as::_SafeStr_8183 (name derived: the track-id input)
    private _trackIdInput!: NamedTextInputPreset;

    // AS3: ProgressRewardTrack.as::_SafeStr_7680 (name derived: the task-id input)
    private _taskIdInput!: NamedTextInputPreset;

    // AS3: ProgressRewardTrack.as::_addToExistingScore
    private _addToExistingScore!: CheckboxOptionPreset;

    // AS3: ProgressRewardTrack.as::_SafeStr_5393 (name derived: the score section)
    private _scoreSection!: ValueOrVariableSection;

    // AS3: ProgressRewardTrack.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.PROGRESS_REWARD_TRACK;
    }

    // AS3: ProgressRewardTrack.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: ProgressRewardTrack.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._trackIdInput = presetManager.createNamedTextInput(new TextInputParam('', 100, null, -1, 'a-zA-Z0-9_'), '${wiredfurni.params.reward_track.track_id}');
        this._taskIdInput = presetManager.createNamedTextInput(new TextInputParam('', 100, null, -1, 'a-zA-Z0-9_'), '${wiredfurni.params.reward_track.task_id}');
        const idList = presetManager.createSimpleListView(true, [this._trackIdInput, this._taskIdInput]);
        const idSection = presetManager.createSection('${wiredfurni.params.reward_track.progress.ids}', idList);
        this._addToExistingScore = presetManager.createCheckboxOption(new CheckboxOptionParam('${wiredfurni.params.reward_track.add_to_existing_score}'));
        const modeSection = presetManager.createSection('${wiredfurni.params.reward_track.progress.mode}', this._addToExistingScore);
        this._scoreSection = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), '${wiredfurni.params.reward_track.score}', 1, 2147483647);
        builder.addElements(idSection, modeSection, this._scoreSection);
    }

    // AS3: ProgressRewardTrack.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._addToExistingScore.selected ? 1 : 0);
        params.push(this._scoreSection.option);
        params.push(this._scoreSection.numberValue);
        params.push(this._scoreSection.target);

        return params;
    }

    // AS3: ProgressRewardTrack.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        return this._trackIdInput.text + '\t' + this._taskIdInput.text;
    }

    // AS3: ProgressRewardTrack.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._scoreSection.finalizeSelection];
    }

    // AS3: ProgressRewardTrack.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._trackIdInput.text = def.getString(0);
        this._taskIdInput.text = def.getString(1);
        this._addToExistingScore.selected = def.getBoolean(0);

        let variableId = def.variableIds[0];
        const option = def.getInt(1);
        const value = def.getInt(2);
        const target = def.getInt(3);

        if(option === 0)
        {
            variableId = WiredVariable.DEFAULT_VARIABLE_ID;
        }

        this._scoreSection.init(def.wiredContext.roomVariablesList, variableId, target, option, value);
    }

    // AS3: ProgressRewardTrack.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._scoreSection.onEditInitialized();
    }

    // AS3: ProgressRewardTrack.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[0, 1]];
    }

    // AS3: ProgressRewardTrack.as::mergedSelectionTitle()
    override mergedSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.merged.title.variables_reference';
    }

    // AS3: ProgressRewardTrack.as::setMergedType()
    override setMergedType(_a: number, b: number): void
    {
        this._scoreSection.target = b;
    }

    // AS3: ProgressRewardTrack.as::getMergedType()
    override getMergedType(_id: number): number
    {
        return this._scoreSection.target;
    }

    // AS3: ProgressRewardTrack.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: ProgressRewardTrack.as::isInputSourceDisabled()
    override isInputSourceDisabled(_a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE)
        {
            return this._scoreSection.isSourcePickingDisabled();
        }

        return false;
    }

    // AS3: ProgressRewardTrack.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: ProgressRewardTrack.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }

    // AS3: ProgressRewardTrack.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
