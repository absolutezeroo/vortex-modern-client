import {
    TradeRequirementRulesDefinition
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRulesDefinition';
import type {
    WiredContractContentsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredContractContentsMessageParser';
import type {PresetManager} from '../../../wired_setup/uibuilder/PresetManager';
import type {
    TradeRuleEditorPreset
} from '../../../wired_setup/uibuilder/presets/contracts/TradeRuleEditorPreset';
import type {
    TradeRuleListEditorPreset
} from '../../../wired_setup/uibuilder/presets/contracts/TradeRuleListEditorPreset';
import type {WiredContractController} from '../WiredContractController';
import {AbstractContract} from './util/AbstractContract';

/**
 * A trade contract: what the player gives, and what they get.
 *
 * The asymmetry is the point — "you give" is a *list* of alternative rules, any one of which
 * satisfies the contract, while "you get" is a single rule. That is why the two halves use different
 * presets.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/contracts/subcontrollers/TradeContract.as
 */
export class TradeContract extends AbstractContract
{
    // AS3: TradeContract.as::_SafeStr_6532 (name derived: the "you give" rule list)
    private _youGiveRules: TradeRuleListEditorPreset | null;

    // AS3: TradeContract.as::_SafeStr_6433 (name derived: the "you get" rule)
    private _youGetRule: TradeRuleEditorPreset | null;

    // AS3: TradeContract.as::TradeContract()
    constructor(controller: WiredContractController, presetManager: PresetManager)
    {
        super(controller, presetManager);

        const element = controller.addEditContractElement;

        this._youGiveRules = presetManager.createRuleListEditorPreset(
            element?.onEdit ?? null,
            element?.onAdd ?? null
        );

        const giveSection = presetManager.createSection('${wiredcontracts.payment_requirements}', this._youGiveRules);

        this._youGetRule = presetManager.createRuleEditorPreset(
            '${wiredcontracts.reward_rule}',
            element?.onEdit ?? null,
            element?.onAdd ?? null
        );

        const getSection = presetManager.createSection('${wiredcontracts.reward_requirements}', this._youGetRule);

        const frame = presetManager.createFramePreset(
            [giveSection, getSection, ...(this.footerPreset ? [this.footerPreset] : [])],
            () => this.onCloseClicked()
        );

        frame.resizeToWidth(262);
        frame.title = '${wiredcontracts.trade_contract.title}';

        this.framePreset = frame;
    }

    // AS3: TradeContract.as::createNewDefinitionFromUI()
    protected override createNewDefinitionFromUI(): TradeRequirementRulesDefinition
    {
        return new TradeRequirementRulesDefinition(
            this._youGiveRules?.finalizeRules() ?? [],
            this._youGetRule?.finalizeRule() ?? null
        );
    }

    /**
	 * Refuses payloads that are not this type, and — unlike the payment contract — requires **both**
	 * sides to be present. A trade with one side missing is not shown at all.
	 */
    // AS3: TradeContract.as::show()
    override show(parser: WiredContractContentsMessageParser): void
    {
        const definition = parser.definition;

        if(parser.contractType !== this.contractType()
            || definition == null
            || definition.youGiveRule == null
            || definition.youGetRule == null)
        {
            return;
        }

        super.show(parser);

        if(this._youGiveRules) this._youGiveRules.rules = definition.youGiveRule;
        if(this._youGetRule) this._youGetRule.rule = definition.youGetRule;

        this.showFrame();
    }

    // AS3: TradeContract.as::contractType()
    override contractType(): number
    {
        return 1;
    }

    // AS3: TradeContract.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._youGiveRules = null;
        this._youGetRule = null;

        super.dispose();
    }
}
