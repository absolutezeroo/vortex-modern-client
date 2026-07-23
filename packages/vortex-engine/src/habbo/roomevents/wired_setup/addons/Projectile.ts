import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import {VariableExtraSourceTypes} from '../common/VariableExtraSourceTypes';
import {ExpandableDropdownOption} from '../common/advanced_dropdown/ExpandableDropdownOption';
import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {DropdownParam} from '../uibuilder/params/DropdownParam';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {TextParam} from '../uibuilder/params/TextParam';
import {SubVariableParam} from '../uibuilder/params/applications/SubVariableParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {StaticBitmapAssetWrapperPreset} from '../uibuilder/presets/StaticBitmapAssetWrapperPreset';
import type {NamedDropdownPreset} from '../uibuilder/presets/combinations/NamedDropdownPreset';
import type {NamedNumberInputPreset} from '../uibuilder/presets/combinations/NamedNumberInputPreset';
import {SliderSection} from '../uibuilder/presets/sections/SliderSection';
import type {ValueOrVariableSection} from '../uibuilder/presets/sections/ValueOrVariableSection';
import type {SubVariableCreatorPreset} from '../uibuilder/presets/applications/SubVariableCreatorPreset';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * Projectile — the "projectile"/animation addon: a directional-system dropdown (with a preview image and
 * optional shooter-direction override + bunny-hop), a trajectory picker (flat vs arc height), a distance
 * picker (value-or-variable), a custom animation-time picker (time-per-tile + distance axes + speed
 * increment), a rotation-offset slider, and a grid of internal animation sub-variables. Everything
 * serializes into intParams (19 slots); the animation-time and distance amounts to variableIds[0..1].
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4053`). Code = AddonCodes.PROJECTILE.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4053.as
 */
export class Projectile extends DefaultAddonType
{
    // AS3: _SafeCls_4053.as::_SafeStr_7422 (name derived: the new-direction-enabled checkbox)
    private _newDirectionEnabled!: CheckboxGroupPreset;

    // AS3: _SafeCls_4053.as::_directionalSystemDropdown
    private _directionalSystemDropdown!: NamedDropdownPreset;

    // AS3: _SafeCls_4053.as::_SafeStr_8576 (name derived: the directional-system preview image)
    private _directionalSystemImage!: StaticBitmapAssetWrapperPreset;

    // AS3: _SafeCls_4053.as::_shooterDirectionOverride
    private _shooterDirectionOverride!: CheckboxGroupPreset;

    // AS3: _SafeCls_4053.as::_bunnyHopCheckbox
    private _bunnyHopCheckbox!: CheckboxGroupPreset;

    // AS3: _SafeCls_4053.as::_SafeStr_8285 (name derived: the trajectory-mode radio)
    private _trajectoryMode!: RadioGroupPreset;

    // AS3: _SafeCls_4053.as::_SafeStr_7689 (name derived: the trajectory-height input)
    private _trajectoryHeight!: NamedNumberInputPreset;

    // AS3: _SafeCls_4053.as::_SafeStr_7401 (name derived: the distance-mode radio)
    private _distanceMode!: RadioGroupPreset;

    // AS3: _SafeCls_4053.as::_SafeStr_5429 (name derived: the distance value-or-variable section)
    private _distanceSection!: ValueOrVariableSection;

    // AS3: _SafeCls_4053.as::_enableCustomAnimationTime
    private _enableCustomAnimationTime!: CheckboxGroupPreset;

    // AS3: _SafeCls_4053.as::_animationTime
    private _animationTime!: ValueOrVariableSection;

    // AS3: _SafeCls_4053.as::_SafeStr_6077 (name derived: the distance-axes checkboxes)
    private _distanceOptions!: CheckboxGroupPreset;

    // AS3: _SafeCls_4053.as::_SafeStr_8169 (name derived: the increase-speed input)
    private _increaseSpeed!: NamedNumberInputPreset;

    // AS3: _SafeCls_4053.as::_SafeStr_7070 (name derived: the rotation-offset slider)
    private _rotationOffset!: SliderSection;

    // AS3: _SafeCls_4053.as::_internalVariables
    private _internalVariables!: SubVariableCreatorPreset;

    // AS3: _SafeCls_4053.as::get code()
    override get code(): number
    {
        return AddonCodes.PROJECTILE;
    }

    // AS3: _SafeCls_4053.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4053.as::onDirectionalSystemChange()
    private onDirectionalSystemChange(option: ExpandableDropdownOption): void
    {
        this.onDirectionalIdSet(option.id);
    }

    // AS3: _SafeCls_4053.as::onDirectionalIdSet()
    private onDirectionalIdSet(id: number): void
    {
        this._directionalSystemImage.assetUri = 'wired_misc_directional_system_' + id + '_png';
        this.roomEventsCtrl.updateSourceContainer(WiredInputSourcePicker.USER_SOURCE, 1);
    }

    // AS3: _SafeCls_4053.as::newDirectionStateChanged()
    private newDirectionStateChanged(_id: number, selected: boolean): void
    {
        this._rotationOffset.disabled = !selected;
        this.roomEventsCtrl.updateSourceContainer(WiredInputSourcePicker.USER_SOURCE, 1);
    }

    // AS3: _SafeCls_4053.as::customAnimationTimeStateChanged()
    private customAnimationTimeStateChanged(_id: number, _selected: boolean): void
    {
        this.roomEventsCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, 0);
    }

    // AS3: _SafeCls_4053.as::animationDistanceModeChanged()
    private animationDistanceModeChanged(mode: number): void
    {
        this._distanceSection.disabled = mode === 0;
        this.roomEventsCtrl.updateSourceContainer(WiredInputSourcePicker.MERGED_SOURCE, 1);
    }

    // AS3: _SafeCls_4053.as::onShooterDirectionCheckboxChanged()
    private onShooterDirectionCheckboxChanged(_id: number, _selected: boolean): void
    {
        this.roomEventsCtrl.updateSourceContainer(WiredInputSourcePicker.USER_SOURCE, 1);
    }

    // AS3: _SafeCls_4053.as::buildInputs()
    override buildInputs(presetManager: PresetManager, wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const usageInfo = presetManager.createUsageInfoSection('${wiredfurni.params.projectile.usage_info}');

        this._directionalSystemDropdown = presetManager.createNamedDropdown(new DropdownParam('${wiredfurni.params.projectile.directional_system}', [new ExpandableDropdownOption(0, '${wiredfurni.params.projectile.directional_system.0}'), new ExpandableDropdownOption(1, '${wiredfurni.params.projectile.directional_system.1}'), new ExpandableDropdownOption(2, '${wiredfurni.params.projectile.directional_system.2}'), new ExpandableDropdownOption(3, '${wiredfurni.params.projectile.directional_system.3}')], (option) => this.onDirectionalSystemChange(option as ExpandableDropdownOption)), '${wiredfurni.params.projectile.directional_system}');
        this._directionalSystemImage = presetManager.createBitmapWrapperPreset('wired_misc_directional_system_1_png');
        this._bunnyHopCheckbox = presetManager.createCheckboxGroup([new CheckboxOptionParam('${wiredfurni.params.projectile.bunny_hop}')]);
        this._shooterDirectionOverride = presetManager.createCheckboxGroup([new CheckboxOptionParam('${wiredfurni.params.projectile.change_shooter_direction}', 0, null, this._bunnyHopCheckbox)], (id, selected) => this.onShooterDirectionCheckboxChanged(id, selected));
        const directionList = presetManager.createSimpleListView(true, [this._directionalSystemDropdown, this._directionalSystemImage.alignCenter(), this._shooterDirectionOverride]);
        directionList.spacing = 10;
        const newDirectionOption = new CheckboxOptionParam('${wiredfurni.params.projectile.new_direction_enabled}');
        newDirectionOption.extra2 = directionList;
        this._newDirectionEnabled = presetManager.createCheckboxGroup([newDirectionOption], (id, selected) => this.newDirectionStateChanged(id, selected));
        const directionSection = presetManager.createSection('${wiredfurni.params.projectile.direction}', this._newDirectionEnabled, SectionParam.HIDDEN);

        this._trajectoryHeight = presetManager.createNamedNumberInput(new NumberInputParam(0, -1000, 1000), '${wiredfurni.params.projectile.animation_trajectory.trajectory.1.extra}');
        const trajectoryTextParam = new TextParam(1);
        trajectoryTextParam.textColor = wiredStyle.softTextColor;
        const trajectoryInfo = presetManager.createText('${wiredfurni.params.projectile.animation_trajectory.trajectory.0.info}', trajectoryTextParam);
        this._trajectoryMode = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.projectile.animation_trajectory.trajectory.0}', null, trajectoryInfo), new RadioButtonParam(1, '${wiredfurni.params.projectile.animation_trajectory.trajectory.1}', null, this._trajectoryHeight)]);
        const trajectorySection = presetManager.createSection('${wiredfurni.params.projectile.animation_trajectory.trajectory}', this._trajectoryMode);
        this._distanceMode = presetManager.createRadioGroup([new RadioButtonParam(0, '${wiredfurni.params.projectile.animation_trajectory.distance.0}'), new RadioButtonParam(1, '${wiredfurni.params.projectile.animation_trajectory.distance.1}'), new RadioButtonParam(2, '${wiredfurni.params.projectile.animation_trajectory.distance.2}')], (selected) => this.animationDistanceModeChanged(selected));
        const distanceModeSection = presetManager.createSection('${wiredfurni.params.projectile.animation_trajectory.distance}', this._distanceMode);
        this._distanceSection = presetManager.createValueOrVariableSection(1, this.mergedSourceOptions(1), '${wiredfurni.params.projectile.animation_trajectory.distance_selection}', -64, 64);
        const trajectoryList = presetManager.createSimpleListView(true, [trajectorySection, distanceModeSection, this._distanceSection]);
        const animationTrajectorySection = presetManager.createSection('${wiredfurni.params.projectile.animation_trajectory}', trajectoryList, SectionParam.COLLAPSED);

        this._animationTime = presetManager.createValueOrVariableSection(0, this.mergedSourceOptions(0), '${wiredfurni.params.projectile.time_per_tile}', 1, 100000);
        this._distanceOptions = presetManager.createCheckboxGroup([new CheckboxOptionParam('${wiredfurni.params.projectile.distance_x}', 0), new CheckboxOptionParam('${wiredfurni.params.projectile.distance_y}', 1), new CheckboxOptionParam('${wiredfurni.params.projectile.distance_z}', 2)]);
        const distanceOptionsSection = presetManager.createSection('${wiredfurni.params.projectile.distance_options}', this._distanceOptions);
        this._increaseSpeed = presetManager.createNamedNumberInput(new NumberInputParam(0, 0, 100000), '${wiredfurni.params.projectile.increase_speed}');
        const increaseSpeedSection = presetManager.createSection('${wiredfurni.params.projectile.increase_speed.title}', this._increaseSpeed);
        const animationTimeList = presetManager.createSimpleListView(true, [this._animationTime, distanceOptionsSection, increaseSpeedSection]);
        const animationTimeOption = new CheckboxOptionParam('${wiredfurni.params.projectile.override_animation_time}');
        animationTimeOption.extra2 = animationTimeList;
        this._enableCustomAnimationTime = presetManager.createCheckboxGroup([animationTimeOption], (id, selected) => this.customAnimationTimeStateChanged(id, selected));
        const animationTimeSection = presetManager.createSection('${wiredfurni.params.projectile.animation_time}', this._enableCustomAnimationTime, SectionParam.COLLAPSED);

        this._rotationOffset = presetManager.createSliderSection('wiredfurni.params.projectile.rotation_offset', 'offset', SliderSection.CONVERTER_ECHO, 0, 7, 1, false, SectionParam.COLLAPSED);

        const internalParams = [new SubVariableParam(0, 'animation.tiles_travelled', true), new SubVariableParam(1, 'animation.user_collisions', true), new SubVariableParam(2, 'animation.furni_collisions', true), new SubVariableParam(3, 'animation.position.x'), new SubVariableParam(4, 'animation.position.y'), new SubVariableParam(5, 'animation.position.altitude'), new SubVariableParam(6, 'animation.is_travelling', true)];
        this._internalVariables = presetManager.createSubVariableCreator('wiredfurni.params.projectile.variable.', internalParams);
        const internalSection = presetManager.createSection('${wiredfurni.params.projectile.projectile.variables}', this._internalVariables, SectionParam.COLLAPSED);

        builder.addElements(usageInfo, directionSection, animationTrajectorySection, animationTimeSection, this._rotationOffset, internalSection, presetManager.createWrapperPreset(wiredStyle.createSplitterView()));
    }

    // AS3: _SafeCls_4053.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const animationTimeVarId = def.variableIds[0];
        const distanceVarId = def.variableIds[1];
        const newDirectionEnabled = def.getBoolean(0);
        const directionalSystemId = def.getInt(1);
        const customAnimationTime = def.getBoolean(2);
        const animationTimeOption = def.getInt(3);
        const animationTimeValue = def.getInt(4);
        const animationTimeTarget = def.getInt(5);
        const distanceX = def.getBoolean(6);
        const distanceY = def.getBoolean(7);
        const distanceZ = def.getBoolean(8);
        const increaseSpeed = def.getInt(9);
        const rotationOffset = def.getInt(10);
        const internalMask = def.getInt(11);
        const shooterDirectionOverride = def.getBoolean(12);
        const bunnyHop = def.getBoolean(13);
        const distanceMode = def.getInt(14);
        const distanceOption = def.getInt(15);
        const distanceValue = def.getInt(16);
        const distanceTarget = def.getInt(17);
        const trajectoryHeight = def.getInt(18);

        this._newDirectionEnabled.optionById(0).selected = newDirectionEnabled;
        this._directionalSystemDropdown.selectedId = directionalSystemId;
        this._enableCustomAnimationTime.optionById(0).selected = customAnimationTime;
        this._animationTime.init(def.wiredContext.roomVariablesList, animationTimeVarId, animationTimeTarget, animationTimeOption, animationTimeValue);
        this._distanceOptions.optionById(0).selected = distanceX;
        this._distanceOptions.optionById(1).selected = distanceY;
        this._distanceOptions.optionById(2).selected = distanceZ;
        this._increaseSpeed.value = increaseSpeed;
        this._rotationOffset.value = rotationOffset;
        this._internalVariables.mask = internalMask;
        this._shooterDirectionOverride.optionById(0).selected = shooterDirectionOverride;
        this._bunnyHopCheckbox.optionById(0).selected = bunnyHop;
        this._distanceMode.selected = distanceMode;
        this._distanceSection.init(def.wiredContext.roomVariablesList, distanceVarId, distanceTarget, distanceOption, distanceValue);
        this._trajectoryMode.selected = trajectoryHeight === 0 ? 0 : 1;
        this._trajectoryHeight.value = trajectoryHeight;
        this.newDirectionStateChanged(0, newDirectionEnabled);
        this.onDirectionalIdSet(directionalSystemId);
        this.animationDistanceModeChanged(distanceMode);
    }

    // AS3: _SafeCls_4053.as::onEditInitialized()
    override onEditInitialized(): void
    {
        this._animationTime.onEditInitialized();
    }

    // AS3: _SafeCls_4053.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];
        params.push(this._newDirectionEnabled.optionById(0).selected ? 1 : 0);
        params.push(this._directionalSystemDropdown.selectedId);
        params.push(this._enableCustomAnimationTime.optionById(0).selected ? 1 : 0);
        params.push(this._animationTime.option);
        params.push(this._animationTime.numberValue);
        params.push(this._animationTime.target);
        params.push(this._distanceOptions.optionById(0).selected ? 1 : 0);
        params.push(this._distanceOptions.optionById(1).selected ? 1 : 0);
        params.push(this._distanceOptions.optionById(2).selected ? 1 : 0);
        params.push(this._increaseSpeed.value);
        params.push(this._rotationOffset.value);
        params.push(this._internalVariables.mask);
        params.push(this._shooterDirectionOverride.optionById(0).selected ? 1 : 0);
        params.push(this._bunnyHopCheckbox.optionById(0).selected ? 1 : 0);
        params.push(this._distanceMode.selected);
        params.push(this._distanceSection.option);
        params.push(this._distanceSection.numberValue);
        params.push(this._distanceSection.target);
        params.push(this._trajectoryMode.selected === 1 ? this._trajectoryHeight.value : 0);
        return params;
    }

    // AS3: _SafeCls_4053.as::readVariableIdsFromForm()
    override readVariableIdsFromForm(): string[]
    {
        return [this._animationTime.finalizeSelection, this._distanceSection.finalizeSelection];
    }

    // AS3: _SafeCls_4053.as::get widthModifier()
    override get widthModifier(): number
    {
        return 1.3;
    }

    // AS3: _SafeCls_4053.as::get allowScrolling()
    override get allowScrolling(): boolean
    {
        return false;
    }

    // AS3: _SafeCls_4053.as::furniSelectionTitle()
    override furniSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.furni.title.projectile';
    }

    // AS3: _SafeCls_4053.as::userSelectionTitle()
    override userSelectionTitle(_id: number): string
    {
        return 'wiredfurni.params.sources.users.title.shooter';
    }

    // AS3: _SafeCls_4053.as::mergedSelectionTitle()
    override mergedSelectionTitle(id: number): string
    {
        if(id === 0)
        {
            return 'wiredfurni.params.sources.merged.title.variable_time_per_tile';
        }

        return 'wiredfurni.params.sources.merged.title.variable_animation_distance';
    }

    // AS3: _SafeCls_4053.as::isInputSourceDisabled()
    override isInputSourceDisabled(a: number, b: number): boolean
    {
        if(b === WiredInputSourcePicker.MERGED_SOURCE)
        {
            if(a === 0)
            {
                return !this._enableCustomAnimationTime.optionById(0).selected || this._animationTime.isSourcePickingDisabled();
            }

            return this._distanceMode.selected === 0 || this._distanceSection.isSourcePickingDisabled();
        }

        if(b === WiredInputSourcePicker.USER_SOURCE)
        {
            return !this._shooterDirectionOverride.optionById(0).selected || !this._newDirectionEnabled.optionById(0).selected;
        }

        return false;
    }

    // AS3: _SafeCls_4053.as::mergedSelections()
    override mergedSelections(): number[][]
    {
        return [[1, 0], [2, 2]];
    }

    // AS3: _SafeCls_4053.as::setMergedType()
    override setMergedType(a: number, b: number): void
    {
        if(a === 0)
        {
            this._animationTime.target = b;
            return;
        }

        this._distanceSection.target = b;
    }

    // AS3: _SafeCls_4053.as::getMergedType()
    override getMergedType(id: number): number
    {
        if(id === 0)
        {
            return this._animationTime.target;
        }

        return this._distanceSection.target;
    }

    // AS3: _SafeCls_4053.as::getCustomSourcesForMergedType()
    override getCustomSourcesForMergedType(_id: number): number[]
    {
        return [VariableExtraSourceTypes.GLOBAL_SOURCE, VariableExtraSourceTypes.CONTEXT_SOURCE];
    }

    // AS3: _SafeCls_4053.as::hasCustomTypePicker()
    override hasCustomTypePicker(_id: number): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4053.as::get forceHidePickFurniInstructions()
    override get forceHidePickFurniInstructions(): boolean
    {
        return true;
    }
}
