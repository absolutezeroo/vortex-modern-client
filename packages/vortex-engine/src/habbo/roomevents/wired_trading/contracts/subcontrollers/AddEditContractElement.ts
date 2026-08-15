import {
    TradeRequirementNode
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/TradeRequirementNode';
import type {PresetManager} from '../../../wired_setup/uibuilder/PresetManager';
import {RadioButtonParam} from '../../../wired_setup/uibuilder/params/RadioButtonParam';
import {NumberInputParam} from '../../../wired_setup/uibuilder/params/NumberInputParam';
import type {RadioGroupPreset} from '../../../wired_setup/uibuilder/presets/RadioGroupPreset';
import type {NumberInputPreset} from '../../../wired_setup/uibuilder/presets/NumberInputPreset';
import type {
    ItemTypeSelectionSection
} from '../../../wired_setup/uibuilder/presets/sections/ItemTypeSelectionSection';
import type {
    TradeRuleEditorPreset
} from '../../../wired_setup/uibuilder/presets/contracts/TradeRuleEditorPreset';
import {AbstractUbuntuWiredUI} from '../../AbstractUbuntuWiredUI';
import type {WiredContractController} from '../WiredContractController';

/**
 * The little editor that adds or edits one requirement chip — coins or a furniture type, and how
 * many.
 *
 * **One instance serves every rule editor in the client.** `onEdit`/`onAdd` are handed to each
 * `TradeRuleEditorPreset` as its callbacks, and this window remembers which editor called it and
 * which chip (by `uniqueID`, or -1 when adding). That is why it remembers its location: it is opened
 * and closed constantly, beside whichever contract window is up.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/contracts/subcontrollers/AddEditContractElement.as
 */
export class AddEditContractElement extends AbstractUbuntuWiredUI
{
    // AS3: AddEditContractElement.as::MAX_COINS
    static readonly MAX_COINS: number = 100000;

    // AS3: AddEditContractElement.as::MAX_FURNI
    static readonly MAX_FURNI: number = 500;

    // AS3: AddEditContractElement.as::_SafeStr_5744 (name derived: the owning controller)
    private _parentController: WiredContractController | null;

    // AS3: AddEditContractElement.as::_SafeStr_5650 (name derived: coins-or-furni radio group)
    private _elementType: RadioGroupPreset | null;

    // AS3: AddEditContractElement.as::_SafeStr_5940 (name derived: the amount input)
    private _amount: NumberInputPreset | null;

    // AS3: AddEditContractElement.as::_SafeStr_5433 (name derived: the item-type section)
    private _itemTypeSection: ItemTypeSelectionSection | null;

    // AS3: AddEditContractElement.as::_isEditMode
    private _isEditMode: boolean = false;

    // AS3: AddEditContractElement.as::_SafeStr_5667 (name derived: the editor that opened this)
    private _targetEditor: TradeRuleEditorPreset | null = null;

    // AS3: AddEditContractElement.as::_SafeStr_6571 (name derived: the chip being edited, -1 to add)
    private _targetNodeId: number = -1;

    // AS3: AddEditContractElement.as::AddEditContractElement()
    constructor(controller: WiredContractController, presetManager: PresetManager)
    {
        super(controller.roomEvents, presetManager);

        this._parentController = controller;

        this._elementType = presetManager.createRadioGroup(
            [
                new RadioButtonParam(0, '${wiredcontracts.element.type.0}'),
                new RadioButtonParam(1, '${wiredcontracts.element.type.1}'),
            ],
            this.onElementTypeChange
        );

        const typeSection = presetManager.createSection('${wiredcontracts.element.type}', this._elementType);

        // The input caps at MAX_COINS; the *furniture* cap is enforced by validate() instead,
        // because the same field serves both types.
        this._amount = presetManager.createNumberInput(
            new NumberInputParam(1, 1, AddEditContractElement.MAX_COINS, 80)
        );

        const amountSection = presetManager.createSection('${wiredcontracts.element.amount}', this._amount);
        const header = presetManager.createHorizontalSectionListPreset([typeSection, amountSection]);

        this._itemTypeSection = presetManager.createItemTypeSelectionSection();

        const frame = presetManager.createFramePreset(
            [header, this._itemTypeSection, ...(this.footerPreset ? [this.footerPreset] : [])],
            () => this.onCloseClicked()
        );

        frame.resizeToWidth(420);

        this.framePreset = frame;
    }

    /**
	 * The only wired window that remembers where it was put — it reopens per chip, and re-centring
	 * it each time would fight the player.
	 */
    // AS3: AddEditContractElement.as::get isRememberLocation()
    protected override get isRememberLocation(): boolean
    {
        return true;
    }

    // AS3: AddEditContractElement.as::get isBoundToParentRect()
    protected override get isBoundToParentRect(): boolean
    {
        return true;
    }

    /**
	 * Opens well right of centre so it does not land on top of the contract window that opened it.
	 */
    // AS3: AddEditContractElement.as::get xOffsetFromCenter()
    override get xOffsetFromCenter(): number
    {
        return 375;
    }

    // AS3: AddEditContractElement.as::onElementTypeChange()
    private onElementTypeChange = (type: number): void =>
    {
        if(this._itemTypeSection) this._itemTypeSection.disabled = type !== TradeRequirementNode.TYPE_FURNI;
    };

    // AS3: AddEditContractElement.as::set isEditMode()
    set isEditMode(value: boolean)
    {
        this._isEditMode = value;

        const frame = this.framePreset;

        if(frame)
        {
            frame.title = value ? '${wiredcontracts.edit_element.title}' : '${wiredcontracts.add_element.title}';
        }
    }

    // AS3: AddEditContractElement.as::onEdit()
    onEdit = (editor: TradeRuleEditorPreset, uniqueId: number, node: TradeRequirementNode | null): void =>
    {
        if(node === null) return;

        this.isEditMode = true;
        this._targetEditor = editor;
        this._targetNodeId = uniqueId;

        const footer = this.footerPreset;

        if(footer) footer.saveButtonDisabled = this.roomEvents.wiredMenu.hasWritePermission !== true;

        this._itemTypeSection?.resetInteractions();

        if(this._itemTypeSection) this._itemTypeSection.selectedItem = node.itemType;
        if(this._elementType) this._elementType.selected = node.type;
        if(this._amount) this._amount.value = node.amount;

        this.onElementTypeChange(node.type);
        this.showFrame();
    };

    /**
	 * Adding defaults to coins, amount 1 — and `-1` marks "no chip yet", which is what
	 * `onSaveClicked` branches on.
	 */
    // AS3: AddEditContractElement.as::onAdd()
    onAdd = (editor: TradeRuleEditorPreset): void =>
    {
        this.isEditMode = false;
        this._targetEditor = editor;
        this._targetNodeId = -1;

        const footer = this.footerPreset;

        if(footer) footer.saveButtonDisabled = this.roomEvents.wiredMenu.hasWritePermission !== true;

        this._itemTypeSection?.resetInteractions();

        if(this._itemTypeSection) this._itemTypeSection.selectedItem = null;
        if(this._elementType) this._elementType.selected = TradeRequirementNode.TYPE_COIN;
        if(this._amount) this._amount.value = 1;

        this.onElementTypeChange(TradeRequirementNode.TYPE_COIN);
        this.showFrame();
    };

    // AS3: AddEditContractElement.as::createNode()
    private createNode(): TradeRequirementNode
    {
        const type = this._elementType?.selected ?? TradeRequirementNode.TYPE_COIN;

        return new TradeRequirementNode(
            type,
            this._amount?.value ?? 1,
            type === TradeRequirementNode.TYPE_FURNI ? this._itemTypeSection?.selectedItem ?? null : null
        );
    }

    // AS3: AddEditContractElement.as::onSaveClicked()
    override onSaveClicked(): void
    {
        const error = this.validate();

        if(error !== null)
        {
            this.roomEvents.windowManager?.alert('${wiredfurni.error.title}', error, 0, null);

            return;
        }

        if(this._isEditMode)
        {
            this._targetEditor?.updateNode(this._targetNodeId, this.createNode());
        }
        else
        {
            this._targetEditor?.addNode(this.createNode());
        }

        this._targetEditor = null;
        this._targetNodeId = -1;

        this.hideFrame();
    }

    /**
	 * Two furniture-only refusals: more than {@link MAX_FURNI} of one item, and an item the player
	 * may not trade. Coins are unchecked here — the input's own cap is the whole limit.
	 */
    // AS3: AddEditContractElement.as::validate()
    private validate(): string | null
    {
        const type = this._elementType?.selected ?? TradeRequirementNode.TYPE_COIN;

        if(type !== TradeRequirementNode.TYPE_FURNI) return null;

        if((this._amount?.value ?? 0) > AddEditContractElement.MAX_FURNI)
        {
            return this.localization?.getLocalizationWithParams(
                'wiredcontracts.element.too_many_items', '', 'amount', String(AddEditContractElement.MAX_FURNI)
            ) ?? null;
        }

        const furniData = this._itemTypeSection?.furniDataForSelectedItem ?? null;

        if(furniData === null || !furniData.tradeable)
        {
            return '${wiredcontracts.element.item_not_allowed}';
        }

        return null;
    }

    // AS3: AddEditContractElement.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._elementType = null;
        this._amount = null;
        this._itemTypeSection = null;
        this._targetEditor = null;
        this._parentController = null;

        super.dispose();
    }
}
