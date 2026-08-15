import {Short} from '@core/communication/util/Short';
import {
    TradeRequirementNode
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';
import {
    TradeRequirementRulesDefinition
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRulesDefinition';
import type {
    WiredContractContentsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredContractContentsMessageParser';
import type {PresetManager} from '../../../wired_setup/uibuilder/PresetManager';
import {TextAreaParam} from '../../../wired_setup/uibuilder/params/TextAreaParam';
import {CheckboxOptionParam} from '../../../wired_setup/uibuilder/params/CheckboxOptionParam';
import {DropdownParam} from '../../../wired_setup/uibuilder/params/DropdownParam';
import {SectionParam} from '../../../wired_setup/uibuilder/params/SectionParam';
import {
    ExpandableDropdownOption
} from '../../../wired_setup/common/advanced_dropdown/ExpandableDropdownOption';
import type {TextAreaPreset} from '../../../wired_setup/uibuilder/presets/TextAreaPreset';
import type {CheckboxGroupPreset} from '../../../wired_setup/uibuilder/presets/CheckboxGroupPreset';
import type {DropdownPreset} from '../../../wired_setup/uibuilder/presets/DropdownPreset';
import type {SectionPreset} from '../../../wired_setup/uibuilder/presets/SectionPreset';
import type {
    TradeRuleEditorPreset
} from '../../../wired_setup/uibuilder/presets/contracts/TradeRuleEditorPreset';
import type {WiredContractController} from '../WiredContractController';
import {AbstractContract} from './util/AbstractContract';

/**
 * A reward contract: what the player receives, and how the payout is announced.
 *
 * **The earnings category only applies to coins.** `onRulesChange` re-evaluates that on every edit
 * and greys the section out when the reward holds no coin node — which is why the rule editor is the
 * only one of the three contracts to pass a change callback.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/contracts/subcontrollers/RewardContract.as
 */
export class RewardContract extends AbstractContract
{
    // AS3: RewardContract.as::_SafeStr_6433 (name derived: the reward rule)
    private _rewardRule: TradeRuleEditorPreset | null;

    // AS3: RewardContract.as::_SafeStr_7885 (name derived: the earnings-category dropdown)
    private _earningsCategory: DropdownPreset | null;

    // AS3: RewardContract.as::_SafeStr_8467 (name derived: the earnings-category section)
    private _earningsSection: SectionPreset | null;

    // AS3: RewardContract.as::_SafeStr_7642 (name derived: the popup text)
    private _rewardText: TextAreaPreset | null;

    // AS3: RewardContract.as::_showByDefault
    private _showByDefault: CheckboxGroupPreset | null;

    // AS3: RewardContract.as::RewardContract()
    constructor(controller: WiredContractController, presetManager: PresetManager)
    {
        super(controller, presetManager);

        const element = controller.addEditContractElement;

        this._rewardRule = presetManager.createRuleEditorPreset(
            '${wiredcontracts.reward_rule}',
            element?.onEdit ?? null,
            element?.onAdd ?? null,
            null,
            this.onRulesChange
        );

        const ruleSection = presetManager.createSection('${wiredcontracts.reward_requirements}', this._rewardRule);

        // AS3 passes the *tooltip* localization key as the seventh argument, which is `placeholder`
        // in both signatures. Transcribed as found rather than moved to the tooltip slot.
        this._rewardText = presetManager.createTextArea(new TextAreaParam(
            52, -1, 3, -1, 200, '', '${wiredcontracts.reward_contract.reward_popup.text.tooltip}'
        ));

        this._showByDefault = presetManager.createCheckboxGroup(
            [new CheckboxOptionParam('${wiredcontracts.reward_contract.reward_popup.show_by_default}')],
            null
        );

        const popupList = presetManager.createSimpleListView(true, [this._rewardText, this._showByDefault]);
        const popupSection = presetManager.createSection('${wiredcontracts.reward_contract.reward_popup}', popupList);

        // 11 and 13 are the only two earnings categories offered; they are ids, not positions, which
        // is why `selectedId` can be set straight from the payload's `rewardCategory`.
        this._earningsCategory = presetManager.createDropdown(new DropdownParam(
            '${wiredcontracts.reward_contract.earnings_category}',
            [
                new ExpandableDropdownOption(11, '${wiredfurni.params.earnings_category.11}'),
                new ExpandableDropdownOption(13, '${wiredfurni.params.earnings_category.13}'),
            ]
        ));

        this._earningsSection = presetManager.createSection(
            '${wiredcontracts.reward_contract.earnings_category}',
            this._earningsCategory,
            SectionParam.COLLAPSED
        );

        const frame = presetManager.createFramePreset(
            [ruleSection, popupSection, this._earningsSection, ...(this.footerPreset ? [this.footerPreset] : [])],
            () => this.onCloseClicked()
        );

        frame.resizeToWidth(262);
        frame.title = '${wiredcontracts.reward_contract.title}';

        this.framePreset = frame;
    }

    // AS3: RewardContract.as::onRulesChange()
    private onRulesChange = (): void =>
    {
        if(this._earningsSection) this._earningsSection.disabled = !this.hasCreditNode();
    };

    /**
	 * AS3 asks the editor to finalize a whole rule just to look at its nodes — an allocation per
	 * keystroke, transcribed rather than optimised because the editor exposes nothing cheaper.
	 */
    // AS3: RewardContract.as::hasCreditNode()
    private hasCreditNode(): boolean
    {
        const rule = this._rewardRule?.finalizeRule() ?? null;

        if(rule === null) return false;

        for(const node of rule.nodes)
        {
            if(node.type === TradeRequirementNode.TYPE_COIN) return true;
        }

        return false;
    }

    /**
	 * A reward contract has no "you give" side — AS3 passes null for it, the mirror of what
	 * `PaymentContract` does for "you get".
	 */
    // AS3: RewardContract.as::createNewDefinitionFromUI()
    protected override createNewDefinitionFromUI(): TradeRequirementRulesDefinition
    {
        return new TradeRequirementRulesDefinition(null, this._rewardRule?.finalizeRule() ?? null);
    }

    // AS3: RewardContract.as::show()
    override show(parser: WiredContractContentsMessageParser): void
    {
        const definition = parser.definition;

        if(parser.contractType !== this.contractType() || definition == null || definition.youGetRule == null)
        {
            return;
        }

        super.show(parser);

        if(this._rewardRule) this._rewardRule.rule = definition.youGetRule;

        // The single checkbox is looked up by id 0: `CheckboxGroupPreset` rewrites an unset (-1) id
        // to the option's index, so the only option in this group is 0.
        const option = this._showByDefault?.optionById(0) ?? null;

        if(option) option.selected = parser.showDialog;

        if(this._earningsCategory) this._earningsCategory.selectedId = parser.rewardCategory;
        if(this._rewardText) this._rewardText.text = parser.rewardText ?? '';

        this.showFrame();
    }

    // AS3: RewardContract.as::addContentsToComposer()
    override addContentsToComposer(contents: unknown[]): void
    {
        super.addContentsToComposer(contents);

        contents.push(new Short(this._earningsCategory?.selectedId ?? 0));
        contents.push(this._showByDefault?.optionById(0)?.selected ?? false);
        contents.push(this._rewardText?.text ?? '');
    }

    // AS3: RewardContract.as::contractType()
    override contractType(): number
    {
        return 2;
    }

    // AS3: RewardContract.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._rewardRule = null;

        super.dispose();
    }
}
