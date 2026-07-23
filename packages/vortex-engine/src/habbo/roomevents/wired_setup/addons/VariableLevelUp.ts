import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import {OrderedMap} from '@core/utils/OrderedMap';
import {Util} from '@habbo/roomevents/Util';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {TextAreaParam} from '../uibuilder/params/TextAreaParam';
import {SubVariableParam} from '../uibuilder/params/applications/SubVariableParam';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {TextAreaPreset} from '../uibuilder/presets/TextAreaPreset';
import type {NamedNumberInputPreset} from '../uibuilder/presets/combinations/NamedNumberInputPreset';
import type {LevelXpPreviewPreset} from '../uibuilder/presets/applications/LevelXpPreviewPreset';
import type {SubVariableCreatorPreset} from '../uibuilder/presets/applications/SubVariableCreatorPreset';
import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';
import type {AbstractLevelUpConfig} from './levelupper/AbstractLevelUpConfig';
import {ExponentialLevelUpper} from './levelupper/ExponentialLevelUpper';
import {InterpolateLevelUpper} from './levelupper/InterpolateLevelUpper';
import {LinearLevelUpper} from './levelupper/LinearLevelUpper';

/**
 * VariableLevelUp — the "level up" addon: pick a level→XP curve (manual "level=xp" list, linear step, or
 * exponential factor), see a live XP preview, and opt into level/xp/progress sub-variables. Registers as
 * an update receiver while editing so the preview re-simulates whenever the form changes.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4387`). Code = AddonCodes.VARIABLE_LEVEL_UP.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4387.as
 */
export class VariableLevelUp extends DefaultAddonType implements IUpdateReceiver
{
    // AS3: _SafeCls_4387.as::MODE_MANUAL
    private static readonly MODE_MANUAL: number = 0;

    // AS3: _SafeCls_4387.as::MODE_LINEAR
    private static readonly MODE_LINEAR: number = 1;

    // AS3: _SafeCls_4387.as::MODE_EXPONENTIAL
    private static readonly MODE_EXPONENTIAL: number = 2;

    // AS3: _SafeCls_4387.as::_modeOptionGroup
    private _modeOptionGroup!: RadioGroupPreset;

    // AS3: _SafeCls_4387.as::_SafeStr_7475 (name derived: the manual interpolation text area)
    private _interpolationInput!: TextAreaPreset;

    // AS3: _SafeCls_4387.as::_SafeStr_6779 (name derived: the linear step size)
    private _linearStepSize!: NamedNumberInputPreset;

    // AS3: _SafeCls_4387.as::_maxLevel1 (linear max level)
    private _maxLevel1!: NamedNumberInputPreset;

    // AS3: _SafeCls_4387.as::_SafeStr_6766 (name derived: the exponential first-level XP)
    private _expFirstLevelXp!: NamedNumberInputPreset;

    // AS3: _SafeCls_4387.as::_SafeStr_6824 (name derived: the exponential increase factor)
    private _expIncreaseFactor!: NamedNumberInputPreset;

    // AS3: _SafeCls_4387.as::_maxLevel2 (exponential max level)
    private _maxLevel2!: NamedNumberInputPreset;

    // AS3: _SafeCls_4387.as::_SafeStr_7488 (name derived: the XP preview)
    private _preview!: LevelXpPreviewPreset;

    // AS3: _SafeCls_4387.as::_SafeStr_7855 (name derived: the sub-variable creator)
    private _subVariables!: SubVariableCreatorPreset;

    // AS3: _SafeCls_4387.as::_cachedIntParams
    private _cachedIntParams: number[] | null = null;

    // AS3: _SafeCls_4387.as::_SafeStr_9304 (name derived: the cached string param)
    private _cachedStringParam: string | null = null;

    // AS3: _SafeCls_4387.as::get code()
    override get code(): number
    {
        return AddonCodes.VARIABLE_LEVEL_UP;
    }

    // AS3: _SafeCls_4387.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4387.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        const modeParams: RadioButtonParam[] = [];

        const linearOption = new RadioButtonParam(1, this.loc('wiredfurni.params.levelup.mode.1'));
        this._linearStepSize = presetManager.createNamedNumberInput(new NumberInputParam(100, 1, 100000, 35), this.loc('wiredfurni.params.levelup.step_size'));
        this._maxLevel1 = presetManager.createNamedNumberInput(new NumberInputParam(50, 2, 100000, 20), this.loc('wiredfurni.params.levelup.max_level'));
        linearOption.extra2 = presetManager.createSimpleListView(true, [this._linearStepSize, this._maxLevel1]);

        const exponentialOption = new RadioButtonParam(2, this.loc('wiredfurni.params.levelup.mode.2'));
        this._expFirstLevelXp = presetManager.createNamedNumberInput(new NumberInputParam(100, 1, 100000, 35), this.loc('wiredfurni.params.levelup.first_level_xp'));
        this._expIncreaseFactor = presetManager.createNamedNumberInput(new NumberInputParam(20, 1, 100000, 35), this.loc('wiredfurni.params.levelup.increase_factor'));
        this._maxLevel2 = presetManager.createNamedNumberInput(new NumberInputParam(50, 2, 100000, 20), this.loc('wiredfurni.params.levelup.max_level'));
        exponentialOption.extra2 = presetManager.createSimpleListView(true, [this._expFirstLevelXp, this._expIncreaseFactor, this._maxLevel2]);

        const manualOption = new RadioButtonParam(0, this.loc('wiredfurni.params.levelup.mode.0'));
        this._interpolationInput = presetManager.createTextArea(new TextAreaParam(60, -1, -1, 30, 1000, '', this.loc('wiredfurni.params.levelup.interpolation_placeholder'), '0123456789=\r'));
        manualOption.extra2 = this._interpolationInput;

        modeParams.push(linearOption);
        modeParams.push(exponentialOption);
        modeParams.push(manualOption);
        this._modeOptionGroup = presetManager.createRadioGroup(modeParams);
        const modeSection = presetManager.createSection(this.loc('wiredfurni.params.levelup.mode'), this._modeOptionGroup, SectionParam.HIDDEN);

        this._preview = presetManager.createLevelXpPreview([1, 2, 3, 5, 10, 20]);
        const previewSection = presetManager.createSection(this.loc('wiredfurni.params.levelup.preview'), this._preview, SectionParam.COLLAPSED);

        const subVariableParams = [new SubVariableParam(0, 'current_level'), new SubVariableParam(1, 'current_xp'), new SubVariableParam(2, 'progress'), new SubVariableParam(3, 'progress_percentage'), new SubVariableParam(4, 'xp_required'), new SubVariableParam(5, 'xp_remaining'), new SubVariableParam(6, 'is_maxed'), new SubVariableParam(7, 'max_level')];
        this._subVariables = presetManager.createSubVariableCreator('wiredfurni.params.levelup.subvariable.', subVariableParams);
        const subVariableSection = presetManager.createSection(this.loc('wiredfurni.params.create_subvariables'), this._subVariables, SectionParam.HIDDEN);

        builder.addElements(modeSection, previewSection, subVariableSection);
    }

    // AS3: _SafeCls_4387.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        const subVariableMask = def.getInt(0);
        const mode = def.getInt(1);
        const firstParam = def.getInt(2);
        const secondParam = def.getInt(3);
        const thirdParam = def.getInt(4);
        const stringParam = def.stringParam;

        this._subVariables.mask = subVariableMask;
        this._modeOptionGroup.selected = mode;
        this._interpolationInput.reset();
        this._maxLevel1.reset();
        this._maxLevel2.reset();
        this._linearStepSize.reset();
        this._expFirstLevelXp.reset();
        this._expIncreaseFactor.reset();

        if(mode === VariableLevelUp.MODE_MANUAL)
        {
            this._interpolationInput.text = stringParam;
        }
        else if(mode === VariableLevelUp.MODE_LINEAR)
        {
            this._linearStepSize.value = firstParam;
            this._maxLevel1.value = secondParam;
        }
        else if(mode === VariableLevelUp.MODE_EXPONENTIAL)
        {
            this._expFirstLevelXp.value = firstParam;
            this._expIncreaseFactor.value = secondParam;
            this._maxLevel2.value = thirdParam;
        }

        this.roomEvents.registerUpdateReceiver(this, 0);
    }

    // AS3: _SafeCls_4387.as::onEditEnd()
    override onEditEnd(): void
    {
        this.roomEvents.removeUpdateReceiver(this);
    }

    // AS3: _SafeCls_4387.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];
        params.push(this._subVariables.mask);
        const mode = this._modeOptionGroup.selected;
        params.push(mode);

        if(mode === VariableLevelUp.MODE_LINEAR)
        {
            params.push(this._linearStepSize.value);
            params.push(this._maxLevel1.value);
        }
        else if(mode === VariableLevelUp.MODE_EXPONENTIAL)
        {
            params.push(this._expFirstLevelXp.value);
            params.push(this._expIncreaseFactor.value);
            params.push(this._maxLevel2.value);
        }

        return params;
    }

    // AS3: _SafeCls_4387.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        if(this._modeOptionGroup.selected === VariableLevelUp.MODE_MANUAL)
        {
            return this._interpolationInput.text;
        }

        return '';
    }

    // AS3: _SafeCls_4387.as::update()
    update(_deltaTime: number): void
    {
        if(this._preview)
        {
            const intParams = this.readIntParamsFromForm();
            const stringParam = this.readStringParamFromForm();
            const changed = this._cachedIntParams === null || !Util.compareIntArrays(this._cachedIntParams, intParams) || this._cachedStringParam !== stringParam;

            if(changed)
            {
                const config = this.simulateLevelUpper();
                const xps: number[] = [];

                if(config !== null)
                {
                    for(const level of this._preview.previewLevels)
                    {
                        if(level <= 0 || level > config.maxLevel)
                        {
                            break;
                        }

                        xps.push(config.xpForLevel(level));
                    }
                }

                this._preview.setPreviewXps(xps);
            }

            this._cachedIntParams = intParams;
            this._cachedStringParam = stringParam;
        }
    }

    // AS3: _SafeCls_4387.as::simulateLevelUpper()
    private simulateLevelUpper(): AbstractLevelUpConfig | null
    {
        const mode = this._modeOptionGroup.selected;

        if(mode === VariableLevelUp.MODE_MANUAL)
        {
            const map = this.parseLevelToXpMap();

            if(map === null)
            {
                return null;
            }

            return new InterpolateLevelUpper(map);
        }

        if(mode === VariableLevelUp.MODE_LINEAR)
        {
            return new LinearLevelUpper(this._linearStepSize.value, this._maxLevel1.value);
        }

        if(mode === VariableLevelUp.MODE_EXPONENTIAL)
        {
            return new ExponentialLevelUpper(this._expFirstLevelXp.value, this._expIncreaseFactor.value, this._maxLevel2.value);
        }

        return null;
    }

    // AS3: _SafeCls_4387.as::parseLevelToXpMap()
    private parseLevelToXpMap(): OrderedMap<number, number> | null
    {
        const text = this.readStringParamFromForm();
        const map = new OrderedMap<number, number>();
        const lines = text.split('\n');
        let lastLevel = 1;
        let lastXp = 0;

        for(const line of lines)
        {
            const parts = line.split('=', 2);

            if(parts.length >= 2)
            {
                // AS3 wraps int() in try/catch, but int() never throws (invalid -> 0), so the catch is dead.
                const level = VariableLevelUp.asInt(parts[0]);
                const xp = VariableLevelUp.asInt(parts[1]);

                if(level <= lastLevel || xp <= lastXp)
                {
                    return null;
                }

                map.add(level, xp);
                lastLevel = level;
                lastXp = xp;
            }
        }

        return map;
    }

    // AS3 int(String): Number(s) truncated toward zero, 0 for non-numeric.
    private static asInt(value: string): number
    {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? 0 : Math.trunc(parsed);
    }

    // AS3: _SafeCls_4387.as::dispose()
    dispose(): void
    {
    }

    // AS3: _SafeCls_4387.as::get disposed()
    get disposed(): boolean
    {
        return false;
    }
}
