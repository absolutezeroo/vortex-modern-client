import type {PresetManager} from '../wired_setup/uibuilder/PresetManager';
import {NumberInputParam} from '../wired_setup/uibuilder/params/NumberInputParam';
import type {NumberInputPreset} from '../wired_setup/uibuilder/presets/NumberInputPreset';
import type {ItemTypeSelectionSection} from '../wired_setup/uibuilder/presets/sections/ItemTypeSelectionSection';
import {AbstractUbuntuWiredUI} from '../wired_trading/AbstractUbuntuWiredUI';
import type {SelfDonationTool} from './SelfDonationTool';

/**
 * The sandbox donation window: pick a furniture type, pick an amount, press Donate.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/misc/SelfDonationToolView.as
 */
export class SelfDonationToolView extends AbstractUbuntuWiredUI
{
    /**
	 * Also enforced by `SelfDonationTool.validate()`. The number input clamps it and the tool
	 * re-checks it, because the code field can be edited around the spinner.
	 */
    // AS3: SelfDonationToolView.as::MAX_AMOUNT
    static readonly MAX_AMOUNT: number = 500;

    // AS3: SelfDonationToolView.as::_SafeStr_4593 (name derived: the owning tool)
    private _tool: SelfDonationTool | null;

    // AS3: SelfDonationToolView.as::_SafeStr_5940 (name derived: the amount input)
    private _amountInput: NumberInputPreset | null;

    // AS3: SelfDonationToolView.as::_SafeStr_5433 (name derived: the item-type section)
    private _itemTypeSection: ItemTypeSelectionSection | null;

    // AS3: SelfDonationToolView.as::SelfDonationToolView()
    constructor(tool: SelfDonationTool, presetManager: PresetManager)
    {
        super(tool.roomEvents, presetManager);

        this._tool = tool;
        this._amountInput = presetManager.createNumberInput(new NumberInputParam(1, 1, SelfDonationToolView.MAX_AMOUNT, 80));

        const amountSection = presetManager.createSection(
            this.localization?.getLocalization('selfdonation.amount', 'Amount') ?? 'Amount',
            this._amountInput
        );

        this._itemTypeSection = presetManager.createItemTypeSelectionSection();

        if(this.footerPreset)
        {
            this.footerPreset.saveButtonCaption = this.localization?.getLocalization('selfdonation.donate', 'Donate') ?? 'Donate';
            this.footerPreset.splitterVisible = true;
        }

        const listView = presetManager.createSimpleListView(true, [
            amountSection,
            this._itemTypeSection,
            ...(this.footerPreset ? [this.footerPreset] : []),
        ]);

        const frame = presetManager.createFramePreset([listView], () => this.onCloseClicked());

        frame.resizeToWidth(420);
        frame.title = this.localization?.getLocalization('selfdonation.title', 'Sandbox donation tool')
            ?? 'Sandbox donation tool';

        // Assigned through the base's setter, which is what applies `isBoundToParentRect`.
        this.framePreset = frame;
    }

    /**
	 * True here, unlike the base: the donation window is clamped inside the desktop rather than
	 * being draggable off it.
	 */
    // AS3: SelfDonationToolView.as::get isBoundToParentRect()
    protected override get isBoundToParentRect(): boolean
    {
        return true;
    }

    /**
	 * Every open starts from a clean slate — amount back to 1 and the picker's search cleared. AS3
	 * does not restore the previous selection.
	 */
    // AS3: SelfDonationToolView.as::showTool()
    showTool(): void
    {
        if(this._amountInput) this._amountInput.value = 1;

        this._itemTypeSection?.resetInteractions();
        this.showFrame();
    }

    // AS3: SelfDonationToolView.as::onSaveClicked()
    override onSaveClicked(): void
    {
        this._tool?.onDonate(this._itemTypeSection?.selectedItem ?? null, this._amountInput?.value ?? 0);
    }

    // AS3: SelfDonationToolView.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._tool = null;
        this._amountInput = null;
        this._itemTypeSection = null;

        super.dispose();
    }
}
