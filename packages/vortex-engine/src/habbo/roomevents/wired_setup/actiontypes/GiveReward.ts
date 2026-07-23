import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';

import {DefaultElement} from '../DefaultElement';
import type {PresetManager} from '../uibuilder/PresetManager';
import type {WiredStyle} from '../uibuilder/styles/WiredStyle';
import type {WiredUIBuilder} from '../uibuilder/WiredUIBuilder';
import {CheckboxOptionParam} from '../uibuilder/params/CheckboxOptionParam';
import {NumberInputParam} from '../uibuilder/params/NumberInputParam';
import {RadioButtonParam} from '../uibuilder/params/RadioButtonParam';
import {SectionParam} from '../uibuilder/params/SectionParam';
import {TextInputParam} from '../uibuilder/params/TextInputParam';
import {TextParam} from '../uibuilder/params/TextParam';
import type {CheckboxGroupPreset} from '../uibuilder/presets/CheckboxGroupPreset';
import type {CheckboxOptionPreset} from '../uibuilder/presets/CheckboxOptionPreset';
import type {NumberInputPreset} from '../uibuilder/presets/NumberInputPreset';
import type {RadioGroupPreset} from '../uibuilder/presets/RadioGroupPreset';
import type {TextPreset} from '../uibuilder/presets/TextPreset';
import type {TextualButtonPreset} from '../uibuilder/presets/TextualButtonPreset';
import type {NamedTextInputPreset} from '../uibuilder/presets/combinations/NamedTextInputPreset';
import type {RewardListPreset} from '../uibuilder/presets/combinations/RewardListPreset';
import type {RewardRowPreset} from '../uibuilder/presets/combinations/RewardRowPreset';
import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * GiveReward — the "give reward" wired action: a prize limit, a reward interval (once / per n
 * days/hours/mins), a unique-rewards toggle and a list of up to 20 rewards (badge/product code +
 * probability). intParams are [interval, unique, prizeLimit, intervalValue]; the reward rows are
 * serialised into the string param as ";"-separated "badge,code,probability" entries.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4307`; the name follows the code it returns
 * (ActionTypeCodes.GIVE_REWARD).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4307.as
 */
export class GiveReward extends DefaultActionType
{
    // AS3: _SafeCls_4307.as::MAX_REWARDS (declared but unused; AS3 uses the literal 20 inline)
    private static readonly MAX_REWARDS: number = 20;

    // AS3: _SafeCls_4307.as::DEFAULT_REWARDS (declared but unused; AS3 uses the literal 5 inline)
    private static readonly DEFAULT_REWARDS: number = 5;

    // AS3: _SafeCls_4307.as::_SafeStr_10202 (name derived: the prize-limit checkbox option; assigned but never read in AS3)
    private _prizeLimitOption!: CheckboxOptionPreset;

    // AS3: _SafeCls_4307.as::_prizeLimitCheckbox
    private _prizeLimitCheckbox!: CheckboxGroupPreset;

    // AS3: _SafeCls_4307.as::_SafeStr_7534 (name derived: the prize-limit amount input)
    private _prizeLimitAmount!: NumberInputPreset;

    // AS3: _SafeCls_4307.as::_SafeStr_7262 (name derived: the prize-limit warning text)
    private _prizeLimitWarning!: TextPreset;

    // AS3: _SafeCls_4307.as::_SafeStr_9158 (name derived: the prize-limit warning's natural height)
    private _prizeLimitWarningHeight!: number;

    // AS3: _SafeCls_4307.as::_rewardIntervalGroup
    private _rewardIntervalGroup!: RadioGroupPreset;

    // AS3: _SafeCls_4307.as::_SafeStr_6773 (name derived: the interval "n =" input)
    private _intervalInput!: NamedTextInputPreset;

    // AS3: _SafeCls_4307.as::_uniquePrizeCheckbox
    private _uniquePrizeCheckbox!: CheckboxGroupPreset;

    // AS3: _SafeCls_4307.as::_SafeStr_5579 (name derived: the reward list)
    private _rewardList!: RewardListPreset;

    // AS3: _SafeCls_4307.as::_SafeStr_9962 (name derived: the "Add reward" button)
    private _addRewardButton!: TextualButtonPreset;

    // AS3: _SafeCls_4307.as::_displayedRewards
    private _displayedRewards: number = 5;

    // AS3: _SafeCls_4307.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.GIVE_REWARD;
    }

    // AS3: _SafeCls_4307.as::get inputMode()
    override get inputMode(): number
    {
        return DefaultElement.INPUTS_TYPE_UI_BUILDER;
    }

    // AS3: _SafeCls_4307.as::validate()
    override validate(): string | null
    {
        const unique = this._uniquePrizeCheckbox.optionById(0).selected;
        let probabilitySum = 0;

        for(let i = 0; i < this._rewardList.displayedRewards; i++)
        {
            const row = this._rewardList.getRow(i);
            const error = this.validateReward(row, unique);

            if(error != null)
            {
                return error;
            }

            if(!unique && row.probabilityText !== '')
            {
                probabilitySum += Math.trunc(Number(row.probabilityText));
            }
        }

        if(probabilitySum > 100)
        {
            return 'The sum of probabilities cannot exceed 100. You now have ' + probabilitySum + '.';
        }

        return null;
    }

    // AS3: _SafeCls_4307.as::readIntParamsFromForm()
    override readIntParamsFromForm(): number[]
    {
        const params: number[] = [];

        params.push(this._rewardIntervalGroup.selected);
        params.push(this._uniquePrizeCheckbox.optionById(0).selected ? 1 : 0);
        params.push(this._prizeLimitCheckbox.optionById(0).selected ? this._prizeLimitAmount.value : 0);

        const intervalValue = Math.trunc(Number(this._intervalInput.text));

        params.push(intervalValue >= 1 ? intervalValue : 1);

        return params;
    }

    // AS3: _SafeCls_4307.as::readStringParamFromForm()
    override readStringParamFromForm(): string
    {
        let result = '';

        for(let i = 0; i < this._rewardList.displayedRewards; i++)
        {
            const data = this.getRewardData(this._rewardList.getRow(i));

            if(data != null)
            {
                result += (result === '' ? '' : ';') + data;
            }
        }

        return result;
    }

    // AS3: _SafeCls_4307.as::buildInputs()
    override buildInputs(presetManager: PresetManager, _wiredStyle: WiredStyle, builder: WiredUIBuilder): void
    {
        this._prizeLimitAmount = presetManager.createNumberInput(new NumberInputParam(1, 1, 1000, 60));
        const prizeLimitParam = new CheckboxOptionParam(this.roomEvents.localization.getLocalizationWithParams('wiredfurni.params.prizelimit', '', 'amount', ''), 0);
        prizeLimitParam.extra1 = this._prizeLimitAmount;
        this._prizeLimitCheckbox = presetManager.createCheckboxGroup([prizeLimitParam], this.onPrizeLimitToggle);
        this._prizeLimitOption = this._prizeLimitCheckbox.optionById(0);
        const warningParam = new TextParam(1, false);
        warningParam.textColor = 13369344;
        this._prizeLimitWarning = presetManager.createText('Reward limit not set. Make sure rewards are badges or non-tradeable items.', warningParam);
        this._prizeLimitWarningHeight = this._prizeLimitWarning.window.height;
        const prizeLimitList = presetManager.createSimpleListView(true, [this._prizeLimitCheckbox, this._prizeLimitWarning]);
        const prizeLimitSection = presetManager.createSection('Reward limit', prizeLimitList);

        const intervalParams = [
            new RadioButtonParam(0, 'Once'),
            new RadioButtonParam(1, '1 / n Days'),
            new RadioButtonParam(2, '1 / n Hours'),
            new RadioButtonParam(3, '1 / n Mins')
        ];
        this._rewardIntervalGroup = presetManager.createRadioGroup(intervalParams, this.onRewardIntervalChange, 2);
        this._intervalInput = presetManager.createNamedTextInput(new TextInputParam('1', 4, null, 60, '0-9'), 'n =');
        const intervalList = presetManager.createSimpleListView(true, [this._rewardIntervalGroup, this._intervalInput]);
        const intervalSection = presetManager.createSection('How often can a user be rewarded', intervalList);

        const uniqueParam = new CheckboxOptionParam('Unique Rewards?', 0);
        const uniqueInfo = presetManager.createText('If checked each reward will be given once to each user. Probabilities are not in use.', new TextParam(1, false));
        uniqueParam.extra2 = uniqueInfo;
        this._uniquePrizeCheckbox = presetManager.createCheckboxGroup([uniqueParam], this.onUniquePrizeToggle);
        const uniqueSection = presetManager.createSection('Unique Rewards', this._uniquePrizeCheckbox);

        this._rewardList = presetManager.createRewardList(20, this._displayedRewards);
        this._addRewardButton = presetManager.createTextualButtonPreset('Add reward', this.onAddReward);
        const rewardsSectionParam = new SectionParam();
        rewardsSectionParam.addHeaderOption(this._addRewardButton);
        const rewardsSection = presetManager.createSection('Rewards', this._rewardList, rewardsSectionParam);

        builder.addElements(prizeLimitSection, intervalSection, uniqueSection, rewardsSection);
        this.updatePrizeLimitState();
        this.onRewardIntervalChange(this._rewardIntervalGroup.selected);
    }

    // AS3: _SafeCls_4307.as::onEditStart()
    override onEditStart(def: Triggerable): void
    {
        this._rewardIntervalGroup.selected = def.getInt(0);

        if(this._rewardIntervalGroup.selected > 0 && def.intParams.length === 4)
        {
            this._intervalInput.text = String(def.getInt(3));
        }
        else
        {
            this._intervalInput.text = '1';
        }

        this.onRewardIntervalChange(this._rewardIntervalGroup.selected);

        const unique = def.getInt(1) === 1;
        this._uniquePrizeCheckbox.optionById(0).selected = unique;
        this.setProbabilityVisibility(!unique);

        const prizeLimit = def.getInt(2);

        if(prizeLimit > 0)
        {
            this._prizeLimitAmount.value = prizeLimit;
            this._prizeLimitCheckbox.optionById(0).selected = true;
        }
        else
        {
            this._prizeLimitCheckbox.optionById(0).selected = false;
        }

        this.updatePrizeLimitState();
        this._displayedRewards = 5;

        const entries = def.stringParam === '' ? [] : def.stringParam.split(';');

        for(let i = 0; i < 20; i++)
        {
            const row = this._rewardList.getRow(i);

            if(entries[i])
            {
                this.setRewardData(row, entries[i]);
                this._displayedRewards = Math.max(this._displayedRewards, i + 1);
            }
            else
            {
                row.clear();
            }
        }

        this._rewardList.setDisplayedRewards(this._displayedRewards);
    }

    // AS3: _SafeCls_4307.as::onPrizeLimitToggle()
    private onPrizeLimitToggle = (id: number, _selected: boolean): void =>
    {
        if(id === 0)
        {
            this.updatePrizeLimitState();
        }
    };

    // AS3: _SafeCls_4307.as::updatePrizeLimitState()
    private updatePrizeLimitState(): void
    {
        const enabled = this._prizeLimitCheckbox.optionById(0).selected;
        this._prizeLimitWarning.visible = !enabled;
        this._prizeLimitWarning.window.height = enabled ? 0 : this._prizeLimitWarningHeight;
    }

    // AS3: _SafeCls_4307.as::onUniquePrizeToggle()
    private onUniquePrizeToggle = (id: number, selected: boolean): void =>
    {
        if(id === 0)
        {
            this.setProbabilityVisibility(!selected);
        }
    };

    // AS3: _SafeCls_4307.as::setProbabilityVisibility()
    private setProbabilityVisibility(visible: boolean): void
    {
        this._rewardList.setProbabilityEnabled(visible);
    }

    // AS3: _SafeCls_4307.as::onAddReward()
    private onAddReward = (): void =>
    {
        this._displayedRewards = Math.min(20, this._displayedRewards + 1);
        this._rewardList.setDisplayedRewards(this._displayedRewards);
    };

    // AS3: _SafeCls_4307.as::onRewardIntervalChange()
    private onRewardIntervalChange = (selected: number): void =>
    {
        this._intervalInput.disabled = selected === 0;
    };

    // AS3: _SafeCls_4307.as::validateReward()
    private validateReward(row: RewardRowPreset, unique: boolean): string | null
    {
        const code = row.code;
        const probability = row.probabilityText;

        if(code === '' && probability === '')
        {
            return null;
        }

        if(code.indexOf(',') > 0)
        {
            return 'Product/badge codes must not contain \',\' characters.';
        }

        if(code.indexOf(';') > 0)
        {
            return 'Product/badge codes must not contain \';\' characters.';
        }

        if(code.length > 100)
        {
            return 'Product/badge codes cannot contain more than ' + 100 + ' characters.';
        }

        if(code === '')
        {
            return 'Remember to define product/badge codes for all rewards (fill all fields or leave all fields empty).';
        }

        if(!unique)
        {
            if(probability === '')
            {
                return 'Remember to define probabilities for all rewards (fill all fields or leave all fields empty).';
            }

            if(isNaN(Number(probability)))
            {
                return 'Make sure are probabilities are numbers.';
            }

            const value = Math.trunc(Number(probability));

            if(value < 1 || value > 100)
            {
                return 'Make sure all probabilities are numbers between 1 and 100.';
            }
        }

        return null;
    }

    // AS3: _SafeCls_4307.as::getRewardData()
    private getRewardData(row: RewardRowPreset): string | null
    {
        let code = row.code;
        const probability = row.probabilityText;
        const isBadge = row.isBadge;

        code = this.replaceAll(code, ';', '');
        code = this.replaceAll(code, ',', '');

        if(code === '')
        {
            return null;
        }

        const value = isNaN(Number(probability)) ? 0 : Math.trunc(Number(probability));

        return (isBadge ? '0' : '1') + ',' + code + ',' + value;
    }

    // AS3: _SafeCls_4307.as::setRewardData()
    private setRewardData(row: RewardRowPreset, data: string): void
    {
        const parts = data == null ? [] : data.split(',');

        row.code = parts[1] ? parts[1] : '';
        row.probabilityText = parts[2] ? parts[2] : '';
        row.isBadge = parts[0] === '0';
    }

    // AS3: _SafeCls_4307.as::replaceAll()
    private replaceAll(value: string, find: string, replace: string): string
    {
        let guard = 100;

        while(value.indexOf(find) > -1)
        {
            value = value.replace(find, replace);

            if(--guard < 1)
            {
                break;
            }
        }

        return value;
    }
}
