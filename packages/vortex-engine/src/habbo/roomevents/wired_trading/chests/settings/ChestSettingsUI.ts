import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {
    WiredChestUpdateSuccessMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/chests/WiredChestUpdateSuccessMessageEvent';
import type {
    WiredChestUpdateSuccessMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestUpdateSuccessMessageParser';
import {
    SaveWiredChestSettingsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/SaveWiredChestSettingsComposer';
import type {PresetManager} from '../../../wired_setup/uibuilder/PresetManager';
import {CheckboxOptionParam} from '../../../wired_setup/uibuilder/params/CheckboxOptionParam';
import {TextInputParam} from '../../../wired_setup/uibuilder/params/TextInputParam';
import {TextAreaParam} from '../../../wired_setup/uibuilder/params/TextAreaParam';
import {TextParam} from '../../../wired_setup/uibuilder/params/TextParam';
import {DropdownParam} from '../../../wired_setup/uibuilder/params/DropdownParam';
import {ListScrollParams} from '../../../wired_setup/uibuilder/params/ListScrollParams';
import {
    ExpandableDropdownOption
} from '../../../wired_setup/common/advanced_dropdown/ExpandableDropdownOption';
import type {CheckboxGroupPreset} from '../../../wired_setup/uibuilder/presets/CheckboxGroupPreset';
import type {TextInputPreset} from '../../../wired_setup/uibuilder/presets/TextInputPreset';
import type {TextAreaPreset} from '../../../wired_setup/uibuilder/presets/TextAreaPreset';
import type {DropdownPreset} from '../../../wired_setup/uibuilder/presets/DropdownPreset';
import type {SectionPreset} from '../../../wired_setup/uibuilder/presets/SectionPreset';
import type {SimpleListViewPreset} from '../../../wired_setup/uibuilder/presets/SimpleListViewPreset';
import type {ContainerButtonPreset} from '../../../wired_setup/uibuilder/presets/ContainerButtonPreset';
import type {
    StaticBitmapAssetWrapperPreset
} from '../../../wired_setup/uibuilder/presets/StaticBitmapAssetWrapperPreset';
import {AbstractUbuntuWiredUI} from '../../AbstractUbuntuWiredUI';
import {ChestType} from '../ChestType';
import type {WiredChestController} from '../WiredChestController';
import {WiredChestWiredUpdateConfirmationView} from './WiredChestWiredUpdateConfirmationView';

/**
 * A chest's own settings: who may open it, its name and description, how it looks, and the wired
 * upgrade.
 *
 * **Three of the controls are furniture-only.** The preview dropdowns are hidden outright for a coin
 * chest, and `onEdit` does not even read their settings for one — so a coin chest saves whatever
 * those dropdowns happened to hold. That is AS3's behaviour and the composer note records it.
 *
 * The upgrade is a one-way door: buying it disables the button and shows a checkmark, and a chest
 * that already has wired arrives with both already in that state.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/settings/ChestSettingsUI.as
 */
export class ChestSettingsUI extends AbstractUbuntuWiredUI
{
    /**
	 * AS3 sizes the scroll box off `Capabilities.screenResolutionY`, the screen rather than the
	 * window. Same divisor as the notification screen.
	 */
    // TS-only: AS3 inlines the divisor at its one use; named here because the sibling screen repeats it.
    private static readonly SCROLL_HEIGHT_DIVISOR: number = 2.4;

    // AS3: ChestSettingsUI.as::_chestController
    private _chestController: WiredChestController | null;

    // AS3: ChestSettingsUI.as::_SafeStr_5952 (name derived: the access checkbox group)
    private _accessGroup: CheckboxGroupPreset | null;

    // AS3: ChestSettingsUI.as::_chestName
    private _chestName: TextInputPreset | null;

    // AS3: ChestSettingsUI.as::_chestDesc
    private _chestDesc: TextAreaPreset | null;

    // AS3: ChestSettingsUI.as::_chestState
    private _chestState: DropdownPreset | null;

    // AS3: ChestSettingsUI.as::_SafeStr_7366 (name derived: the preview-mode section)
    private _previewSection: SectionPreset | null;

    // AS3: ChestSettingsUI.as::_openStateDropdown
    private _openStateDropdown: DropdownPreset | null;

    // AS3: ChestSettingsUI.as::_SafeStr_6177 (name derived: the preview-amount section)
    private _previewAmountSection: SectionPreset | null;

    // AS3: ChestSettingsUI.as::_amountPreviewDropdown
    private _amountPreviewDropdown: DropdownPreset | null;

    // AS3: ChestSettingsUI.as::_SafeStr_9637 (name derived: the upgrade row)
    private _upgradeRow: SimpleListViewPreset | null = null;

    // AS3: ChestSettingsUI.as::_SafeStr_6306 (name derived: the upgrade button)
    private _upgradeButton: ContainerButtonPreset | null;

    // AS3: ChestSettingsUI.as::_SafeStr_6603 (name derived: the "already upgraded" checkmark)
    private _upgradedCheckmark: StaticBitmapAssetWrapperPreset | null;

    // AS3: ChestSettingsUI.as::_SafeStr_5575 (name derived: the upgrade confirmation)
    private _upgradeConfirmation: WiredChestWiredUpdateConfirmationView | null = null;

    // AS3: ChestSettingsUI.as::_SafeStr_7346 (name derived: the ack subscription)
    private _updateSuccessEvent: IMessageEvent | null;

    // AS3: ChestSettingsUI.as::_chestType
    private _chestType: number = 0;

    // AS3: ChestSettingsUI.as::_chestId
    private _chestId: number = -1;

    // AS3: ChestSettingsUI.as::_chestItemType
    private _chestItemType: number = 0;

    // AS3: ChestSettingsUI.as::_SafeStr_9541 (name derived: passed on to the confirmation view)
    private _upgradeFlag: boolean = false;

    // AS3: ChestSettingsUI.as::ChestSettingsUI()
    constructor(controller: WiredChestController, presetManager: PresetManager)
    {
        super(controller.roomEvents, presetManager);

        this._updateSuccessEvent = new WiredChestUpdateSuccessMessageEvent((event) => this.onUpdateSuccess(event));
        controller.addMessageEvent(this._updateSuccessEvent);

        this._chestController = controller;

        const style = presetManager.wiredStyle;

        // These two are left at the default id (-1) and auto-numbered 0 and 1 by the group.
        this._accessGroup = presetManager.createCheckboxGroup([
            new CheckboxOptionParam('${wiredchests.settings.access.open}'),
            new CheckboxOptionParam('${wiredchests.settings.access.donate}'),
        ], null);

        const accessSection = presetManager.createBorderSection('${wiredchests.settings.access}', this._accessGroup);

        this._chestName = presetManager.createTextInput(new TextInputParam('', 30));
        this._chestDesc = presetManager.createTextArea(
            new TextAreaParam(64, -1, 4, -1, 200, '', null, null, true, true)
        );

        const nameSection = presetManager.createSection('${wiredchests.settings.info.name}', this._chestName);

        nameSection.splitterVisible = false;

        const descSection = presetManager.createSection('${wiredchests.settings.info.desc}', this._chestDesc);
        const infoList = presetManager.createSimpleListView(true, [nameSection, descSection]);

        infoList.spacing = style.sectionSpacing;

        const infoSection = presetManager.createBorderSection('${wiredchests.settings.info}', infoList);

        const stateOptions = [0, 1, 2, 3].map(
            (id) => new ExpandableDropdownOption(id, `\${wiredchests.settings.appearance.state.${id}}`)
        );
        const previewOptions = [0, 1, 2, 3, 4, 5, 6, 7].map(
            (id) => new ExpandableDropdownOption(id, `\${wiredchests.settings.appearance.preview.${id}}`)
        );
        // Unlocalized: the amounts are literally "1".."4", and their ids start at 1, not 0.
        const amountOptions = [1, 2, 3, 4].map((id) => new ExpandableDropdownOption(id, String(id)));

        this._chestState = presetManager.createDropdown(
            new DropdownParam('${wiredchests.settings.appearance.state}', stateOptions)
        );

        const stateSection = presetManager.createSection('${wiredchests.settings.appearance.state}', this._chestState);

        stateSection.splitterVisible = false;

        this._openStateDropdown = presetManager.createDropdown(new DropdownParam(
            '${wiredchests.settings.appearance.preview}',
            previewOptions,
            this.onChangePreviewItems as (...args: unknown[]) => void
        ));

        this._previewSection = presetManager.createSection(
            '${wiredchests.settings.appearance.preview}',
            presetManager.createSimpleListView(true, [
                this._openStateDropdown,
                presetManager.createText('${wiredchests.settings.appearance.preview.note}').halfBlend(),
            ])
        );

        this._amountPreviewDropdown = presetManager.createDropdown(
            new DropdownParam('${wiredchests.settings.appearance.preview_amount}', amountOptions)
        );

        this._previewAmountSection = presetManager.createSection(
            '${wiredchests.settings.appearance.preview_amount}',
            this._amountPreviewDropdown
        );

        const appearanceList = presetManager.createSimpleListView(true, [
            stateSection,
            this._previewSection,
            this._previewAmountSection,
        ]);

        appearanceList.spacing = style.sectionSpacing;

        const appearanceSection = presetManager.createBorderSection(
            '${wiredchests.settings.appearance}',
            appearanceList
        );

        const upgradeLabel = presetManager.createSimpleListView(false, [
            presetManager.createBitmapWrapperPreset('${image.library.url}catalogue/icon_80.png'),
            presetManager.createText('${wiredchests.settings.wired.upgrade}', new TextParam(0)),
        ], true);

        this._upgradeButton = presetManager.createContainerButtonPreset(
            upgradeLabel.alignCenter(),
            this.onClickUpgrade,
            false
        );
        this._upgradedCheckmark = presetManager.createBitmapWrapperPreset('icon_checkmark_small');
        this._upgradeRow = presetManager.createSimpleListView(false, [this._upgradeButton, this._upgradedCheckmark], true);

        const wiredSection = presetManager.createBorderSection('${wiredchests.settings.wired}', this._upgradeRow);

        const maxHeight = Math.floor(
            (typeof screen !== 'undefined' ? screen.height : 1080) / ChestSettingsUI.SCROLL_HEIGHT_DIVISOR
        );

        const frame = presetManager.createFramePreset(
            [accessSection, infoSection, appearanceSection, wiredSection, ...(this.footerPreset ? [this.footerPreset] : [])],
            () => this.onCloseClicked(),
            null,
            -1,
            false,
            false,
            new ListScrollParams(false, 420, maxHeight, true)
        );

        frame.resizeToWidth(300);

        this.framePreset = frame;
    }

    /**
	 * The mirror of the notification screen's guard: this one closes on the acknowledgement that is
	 * *not* about notification preferences.
	 */
    // AS3: ChestSettingsUI.as::onUpdateSuccess()
    private onUpdateSuccess(event: IMessageEvent): void
    {
        const parser = event.parser as WiredChestUpdateSuccessMessageParser;

        if(parser.chestId === this._chestId && !parser.isNotificationPreferences)
        {
            this.hideFrame();
        }
    }

    /**
	 * Closing the settings takes the confirmation dialog with it — it is a child window in spirit,
	 * though not in the window tree.
	 */
    // AS3: ChestSettingsUI.as::hideFrame()
    protected override hideFrame(): void
    {
        super.hideFrame();

        this._upgradeConfirmation?.hide();
    }

    // AS3: ChestSettingsUI.as::onClickUpgrade()
    private onClickUpgrade = (): void =>
    {
        this._upgradeConfirmation ??= new WiredChestWiredUpdateConfirmationView(this);

        this._upgradeConfirmation.initialize(this._chestId, this._chestType, this._chestItemType, this._upgradeFlag);
        this._upgradeConfirmation.show();
    };

    /**
	 * Confirming the upgrade does not send its own message — it flips the button to its bought state
	 * and saves the whole settings screen, so the upgrade rides along in the 9th field.
	 */
    // AS3: ChestSettingsUI.as::confirmUpgrade()
    confirmUpgrade(): void
    {
        if(this._upgradeButton) this._upgradeButton.disabled = true;
        if(this._upgradedCheckmark) this._upgradedCheckmark.visible = true;

        this.onSaveClicked();
    }

    /**
	 * Preview mode 0 means "no preview", and the amount is meaningless without one.
	 */
    // AS3: ChestSettingsUI.as::onChangePreviewItems()
    private onChangePreviewItems = (option: ExpandableDropdownOption): void =>
    {
        if(this._previewAmountSection) this._previewAmountSection.disabled = option.id === 0;
    };

    // AS3: ChestSettingsUI.as::set chestType()
    set chestType(value: number)
    {
        this._chestType = value;

        const isFurni = value === ChestType.TYPE_FURNI;

        if(this._previewSection) this._previewSection.visible = isFurni;
        if(this._previewAmountSection) this._previewAmountSection.visible = isFurni;

        const typeName = this.localization?.getLocalization(`wiredchests.${isFurni ? 'furni' : 'coin'}_chest`) ?? '';
        const frame = this.framePreset;

        if(frame)
        {
            frame.title = this.localization?.getLocalizationWithParams(
                'wiredchests.settings.title', '', 'chest_type', typeName
            ) ?? '';
        }
    }

    /**
	 * `settings` is the furniture's stuff-data map. AS3 types it `_SafeCls_481` — the port's
	 * `OrderedMap` — but `IRoomObjectModel.getStringToStringMap()` hands out a native `Map` here, and
	 * that is where every caller gets it, so the signature follows the port's deviation.
	 */
    // AS3: ChestSettingsUI.as::onEdit()
    onEdit(
        chestId: number,
        chestType: number,
        chestItemType: number,
        upgradeFlag: boolean,
        settings: Map<string, string>
    ): void
    {
        this.chestType = chestType;
        this._chestId = chestId;
        this._chestItemType = chestItemType;
        this._upgradeFlag = upgradeFlag;

        const wiredEnabled = settings.get('is_wired_enabled') === '1';

        const open = this._accessGroup?.optionById(0) ?? null;
        const donate = this._accessGroup?.optionById(1) ?? null;

        if(open) open.selected = settings.get('everyone_can_open') === '1';
        if(donate) donate.selected = settings.get('everyone_can_donate') === '1';

        if(this._chestName) this._chestName.text = settings.get('chest_name') ?? '';
        if(this._chestDesc) this._chestDesc.text = settings.get('chest_desc') ?? '';
        if(this._chestState) this._chestState.selectedId = parseInt(settings.get('state_control_mode') ?? '0', 10) || 0;

        // Already upgraded: the button goes dead and the checkmark appears.
        if(this._upgradeButton) this._upgradeButton.disabled = wiredEnabled;
        if(this._upgradedCheckmark) this._upgradedCheckmark.visible = wiredEnabled;

        // Read only for a furniture chest — see the class note.
        if(chestType === ChestType.TYPE_FURNI)
        {
            const previewMode = parseInt(settings.get('preview_mode') ?? '0', 10) || 0;
            const previewAmount = parseInt(settings.get('preview_amount') ?? '0', 10) || 0;

            if(this._openStateDropdown) this._openStateDropdown.selectedId = previewMode;
            if(this._amountPreviewDropdown) this._amountPreviewDropdown.selectedId = previewAmount;
            if(this._previewAmountSection) this._previewAmountSection.disabled = previewMode === 0;
        }

        this.showFrame();
    }

    // AS3: ChestSettingsUI.as::onSaveClicked()
    override onSaveClicked(): void
    {
        this._chestController?.send(new SaveWiredChestSettingsComposer(
            this._chestId,
            this._chestName?.text ?? '',
            this._chestDesc?.text ?? '',
            this._accessGroup?.optionById(0)?.selected ?? false,
            this._accessGroup?.optionById(1)?.selected ?? false,
            this._chestState?.selectedId ?? 0,
            this._openStateDropdown?.selectedId ?? 0,
            this._amountPreviewDropdown?.selectedId ?? 0,
            this._upgradeButton?.disabled === true
        ));
    }

    // AS3: ChestSettingsUI.as::get chestController()
    get chestController(): WiredChestController | null
    {
        return this._chestController;
    }

    // AS3: ChestSettingsUI.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this._upgradeConfirmation !== null)
        {
            this._upgradeConfirmation.dispose();
            this._upgradeConfirmation = null;
        }

        if(this._updateSuccessEvent) this._chestController?.removeMessageEvent(this._updateSuccessEvent);

        this._updateSuccessEvent = null;
        this._accessGroup = null;
        this._chestName = null;
        this._chestDesc = null;
        this._chestState = null;
        this._previewSection = null;
        this._openStateDropdown = null;
        this._previewAmountSection = null;
        this._amountPreviewDropdown = null;
        this._upgradeRow = null;
        this._upgradeButton = null;
        this._upgradedCheckmark = null;
        this._chestController = null;
        this._chestType = 0;
        this._chestId = -1;

        super.dispose();
    }
}
