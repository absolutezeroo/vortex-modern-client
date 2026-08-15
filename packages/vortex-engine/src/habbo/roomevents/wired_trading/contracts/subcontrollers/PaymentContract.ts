import {Short} from '@core/communication/util/Short';
import {
    TradeRequirementRulesDefinition
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRulesDefinition';
import type {
    WiredContractContentsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredContractContentsMessageParser';
import type {PresetManager} from '../../../wired_setup/uibuilder/PresetManager';
import {RadioButtonParam} from '../../../wired_setup/uibuilder/params/RadioButtonParam';
import {TextInputParam} from '../../../wired_setup/uibuilder/params/TextInputParam';
import {DropdownParam} from '../../../wired_setup/uibuilder/params/DropdownParam';
import {SectionParam} from '../../../wired_setup/uibuilder/params/SectionParam';
import {
    ExpandableDropdownOption
} from '../../../wired_setup/common/advanced_dropdown/ExpandableDropdownOption';
import type {RadioGroupPreset} from '../../../wired_setup/uibuilder/presets/RadioGroupPreset';
import type {TextInputPreset} from '../../../wired_setup/uibuilder/presets/TextInputPreset';
import type {DropdownPreset} from '../../../wired_setup/uibuilder/presets/DropdownPreset';
import type {SectionPreset} from '../../../wired_setup/uibuilder/presets/SectionPreset';
import type {
    TradeRuleListEditorPreset
} from '../../../wired_setup/uibuilder/presets/contracts/TradeRuleListEditorPreset';
import type {WiredContractController} from '../WiredContractController';
import {AbstractContract} from './util/AbstractContract';

/**
 * A payment contract: what the player must pay, and what the payment screen looks like.
 *
 * **The requirements section is only live in mode 1.** Mode 0 greys it out — `onPaymentModeChange`
 * is what enforces that, and it runs both from the radio group and once from `show()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/contracts/subcontrollers/PaymentContract.as
 */
export class PaymentContract extends AbstractContract
{
    /**
	 * The layout goes out as a **string**, not the dropdown's index — the dropdown offers positions
	 * 0 and 1 and this maps them onto the names the server expects.
	 */
    // AS3: PaymentContract.as::LAYOUT_TYPES
    private static readonly LAYOUT_TYPES: string[] = ['generic', 'games'];

    // AS3: PaymentContract.as::_SafeStr_6763 (name derived: the payment-mode radio group)
    private _paymentMode: RadioGroupPreset | null;

    // AS3: PaymentContract.as::_SafeStr_6517 (name derived: the receive-text input)
    private _receiveText: TextInputPreset | null;

    // AS3: PaymentContract.as::_SafeStr_6532 (name derived: the requirement rule list)
    private _requirementRules: TradeRuleListEditorPreset | null;

    // AS3: PaymentContract.as::_SafeStr_8007 (name derived: the requirements section)
    private _requirementsSection: SectionPreset | null;

    // AS3: PaymentContract.as::_SafeStr_7730 (name derived: the layout-type dropdown)
    private _layoutType: DropdownPreset | null;

    // AS3: PaymentContract.as::PaymentContract()
    constructor(controller: WiredContractController, presetManager: PresetManager)
    {
        super(controller, presetManager);

        this._paymentMode = presetManager.createRadioGroup(
            [
                new RadioButtonParam(0, '${wiredcontracts.payment_contract.mode.0}'),
                new RadioButtonParam(1, '${wiredcontracts.payment_contract.mode.1}'),
            ],
            this.onPaymentModeChange
        );

        const modeSection = presetManager.createSection('${wiredcontracts.payment_contract.mode}', this._paymentMode);

        this._receiveText = presetManager.createTextInput(new TextInputParam('', 60));

        const receiveSection = presetManager.createSection(
            '${wiredcontracts.payment_contract.receive_text}',
            this._receiveText
        );

        const element = controller.addEditContractElement;

        this._requirementRules = presetManager.createRuleListEditorPreset(
            element?.onEdit ?? null,
            element?.onAdd ?? null
        );
        this._requirementsSection = presetManager.createSection(
            '${wiredcontracts.payment_requirements}',
            this._requirementRules
        );

        this._layoutType = presetManager.createDropdown(new DropdownParam(
            '${wiredcontracts.payment_contract.layout_type}',
            [
                new ExpandableDropdownOption(0, '${wiredcontracts.payment_contract.layout_type.0}'),
                new ExpandableDropdownOption(1, '${wiredcontracts.payment_contract.layout_type.1}'),
            ]
        ));

        const layoutSection = presetManager.createSection(
            '${wiredcontracts.payment_contract.layout_type}',
            this._layoutType,
            SectionParam.COLLAPSED
        );

        const frame = presetManager.createFramePreset(
            [
                modeSection,
                receiveSection,
                this._requirementsSection,
                layoutSection,
                ...(this.footerPreset ? [this.footerPreset] : []),
            ],
            () => this.onCloseClicked()
        );

        frame.resizeToWidth(262);
        frame.title = '${wiredcontracts.payment_contract.title}';

        this.framePreset = frame;
    }

    // AS3: PaymentContract.as::onPaymentModeChange()
    private onPaymentModeChange = (mode: number): void =>
    {
        if(this._requirementsSection) this._requirementsSection.disabled = mode !== 1;
    };

    /**
	 * A payment contract has no "you get" side at all — AS3 passes null rather than an empty rule.
	 */
    // AS3: PaymentContract.as::createNewDefinitionFromUI()
    protected override createNewDefinitionFromUI(): TradeRequirementRulesDefinition
    {
        return new TradeRequirementRulesDefinition(this._requirementRules?.finalizeRules() ?? [], null);
    }

    /**
	 * `indexOf` returning -1 for an unknown layout is not corrected here — AS3 lets the dropdown sit
	 * on "no selection", and `addContentsToComposer()` is where the out-of-range value is clamped.
	 */
    // AS3: PaymentContract.as::show()
    override show(parser: WiredContractContentsMessageParser): void
    {
        const definition = parser.definition;

        if(parser.contractType !== this.contractType() || definition == null || definition.youGiveRule == null)
        {
            return;
        }

        super.show(parser);

        if(this._paymentMode) this._paymentMode.selected = parser.paymentMode;
        if(this._receiveText) this._receiveText.text = parser.receiveText ?? '';
        if(this._layoutType) this._layoutType.selectedId = PaymentContract.LAYOUT_TYPES.indexOf(parser.layoutType ?? '');
        if(this._requirementRules) this._requirementRules.rules = definition.youGiveRule;

        this.onPaymentModeChange(parser.paymentMode);
        this._requirementsSection?.updateDisabledState();

        this.showFrame();
    }

    // AS3: PaymentContract.as::addContentsToComposer()
    override addContentsToComposer(contents: unknown[]): void
    {
        super.addContentsToComposer(contents);

        contents.push(new Short(this._paymentMode?.selected ?? 0));
        contents.push(this._receiveText?.text ?? '');

        // Clamped rather than refused: an unselected dropdown (-1) falls back to the first layout.
        let index = this._layoutType?.selectedId ?? 0;

        if(index < 0 || index >= PaymentContract.LAYOUT_TYPES.length) index = 0;

        contents.push(PaymentContract.LAYOUT_TYPES[index]);
    }

    // AS3: PaymentContract.as::contractType()
    override contractType(): number
    {
        return 0;
    }

    /**
	 * AS3 clears only three of the five fields here; the section and the dropdown are left. Kept as
	 * found — the whole object is unreachable after dispose either way.
	 */
    // AS3: PaymentContract.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._paymentMode = null;
        this._receiveText = null;
        this._requirementRules = null;

        super.dispose();
    }
}
