import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {
    WiredChestUpdateSuccessMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/chests/WiredChestUpdateSuccessMessageEvent';
import type {
    WiredChestUpdateSuccessMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestUpdateSuccessMessageParser';
import {
    SetWiredChestNotificationSettingsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/SetWiredChestNotificationSettingsComposer';
import type {PresetManager} from '../../../wired_setup/uibuilder/PresetManager';
import {CheckboxOptionParam} from '../../../wired_setup/uibuilder/params/CheckboxOptionParam';
import {DropdownParam} from '../../../wired_setup/uibuilder/params/DropdownParam';
import {ListScrollParams} from '../../../wired_setup/uibuilder/params/ListScrollParams';
import {
    ExpandableDropdownOption
} from '../../../wired_setup/common/advanced_dropdown/ExpandableDropdownOption';
import type {CheckboxGroupPreset} from '../../../wired_setup/uibuilder/presets/CheckboxGroupPreset';
import type {DropdownPreset} from '../../../wired_setup/uibuilder/presets/DropdownPreset';
import type {SectionPreset} from '../../../wired_setup/uibuilder/presets/SectionPreset';
import {AbstractUbuntuWiredUI} from '../../AbstractUbuntuWiredUI';
import {ChestType} from '../ChestType';
import type {WiredChestController} from '../WiredChestController';

/**
 * Which chest events raise a notification, and when.
 *
 * **Two checkbox groups, and the second is conditional**: the "generic" pair always applies, while
 * the three "wired" ones are greyed out for a chest with wired disabled — read from the chest's own
 * `is_wired_enabled` setting rather than from a permission.
 *
 * The window closes on the server's acknowledgement rather than on the click, and only for the
 * acknowledgement that is about *notification* preferences — the same header answers the chest
 * settings screen, and `isNotificationPreferences` is what tells them apart.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/settings/ChestNotificationSettingsUI.as
 */
export class ChestNotificationSettingsUI extends AbstractUbuntuWiredUI
{
    /**
	 * AS3 sizes the scroll box as `Capabilities.screenResolutionY / 2.4`, the *screen* height rather
	 * than the window's. `screen.height` is the browser's equivalent; the divisor is AS3's and
	 * unexplained there too.
	 */
    // TS-only: AS3 inlines the divisor at its one use; named here because the sibling screen repeats it.
    private static readonly SCROLL_HEIGHT_DIVISOR: number = 2.4;

    // AS3: ChestNotificationSettingsUI.as::_chestController
    private _chestController: WiredChestController | null;

    // AS3: ChestNotificationSettingsUI.as::_SafeStr_5883 (name derived: the generic checkbox group)
    private _genericGroup: CheckboxGroupPreset | null;

    // AS3: ChestNotificationSettingsUI.as::_SafeStr_7002 (name derived: the wired section)
    private _wiredSection: SectionPreset | null;

    // AS3: ChestNotificationSettingsUI.as::_SafeStr_5480 (name derived: the wired checkbox group)
    private _wiredGroup: CheckboxGroupPreset | null;

    // AS3: ChestNotificationSettingsUI.as::_notificationMode
    private _notificationMode: DropdownPreset | null;

    // AS3: ChestNotificationSettingsUI.as::_SafeStr_7346 (name derived: the ack subscription)
    private _updateSuccessEvent: IMessageEvent | null;

    // AS3: ChestNotificationSettingsUI.as::_chestType
    private _chestType: number = 0;

    // AS3: ChestNotificationSettingsUI.as::_chestId
    private _chestId: number = -1;

    // AS3: ChestNotificationSettingsUI.as::ChestNotificationSettingsUI()
    constructor(controller: WiredChestController, presetManager: PresetManager)
    {
        super(controller.roomEvents, presetManager);

        this._updateSuccessEvent = new WiredChestUpdateSuccessMessageEvent((event) => this.onUpdateSuccess(event));
        controller.addMessageEvent(this._updateSuccessEvent);

        this._chestController = controller;

        const style = presetManager.wiredStyle;
        const info = presetManager.createUsageInfoSection(
            '${wiredchests.notification_settings.notification_info.desc}',
            true,
            '${wiredchests.notification_settings.notification_info}'
        );

        // The explicit ids matter: `CheckboxGroupPreset` only auto-numbers options left at -1.
        this._genericGroup = presetManager.createCheckboxGroup([
            new CheckboxOptionParam('${wiredchests.notification_settings.enable_notifications.generic.0}', 0),
            new CheckboxOptionParam('${wiredchests.notification_settings.enable_notifications.generic.1}', 1),
        ], null);

        this._wiredGroup = presetManager.createCheckboxGroup([
            new CheckboxOptionParam('${wiredchests.notification_settings.enable_notifications.wired.0}', 0),
            new CheckboxOptionParam('${wiredchests.notification_settings.enable_notifications.wired.1}', 1),
            new CheckboxOptionParam('${wiredchests.notification_settings.enable_notifications.wired.2}', 2),
        ], null);

        const genericSection = presetManager.createSection(
            '${wiredchests.notification_settings.enable_notifications.generic}',
            this._genericGroup
        );

        genericSection.splitterVisible = false;

        this._wiredSection = presetManager.createSection(
            '${wiredchests.notification_settings.enable_notifications.wired}',
            this._wiredGroup
        );

        const groups = presetManager.createSimpleListView(true, [genericSection, this._wiredSection]);

        groups.spacing = style.sectionSpacing;

        const enableSection = presetManager.createBorderSection(
            '${wiredchests.notification_settings.enable_notifications}',
            groups
        );

        this._notificationMode = presetManager.createDropdown(new DropdownParam(
            '${wiredchests.notification_settings.notification_mode.when}',
            [
                new ExpandableDropdownOption(0, '${wiredchests.notification_settings.notification_mode.when.0}'),
                new ExpandableDropdownOption(1, '${wiredchests.notification_settings.notification_mode.when.1}'),
            ]
        ));

        const modeSection = presetManager.createSection(
            '${wiredchests.notification_settings.notification_mode.when}',
            this._notificationMode
        );

        modeSection.splitterVisible = false;

        const modeBorder = presetManager.createBorderSection(
            '${wiredchests.notification_settings.notification_mode}',
            modeSection
        );

        const maxHeight = Math.floor(
            (typeof screen !== 'undefined' ? screen.height : 1080) / ChestNotificationSettingsUI.SCROLL_HEIGHT_DIVISOR
        );

        const frame = presetManager.createFramePreset(
            [info, enableSection, modeBorder, ...(this.footerPreset ? [this.footerPreset] : [])],
            () => this.onCloseClicked(),
            null,
            -1,
            false,
            false,
            new ListScrollParams(false, 320, maxHeight, true)
        );

        frame.resizeToWidth(350);

        this.framePreset = frame;
    }

    // AS3: ChestNotificationSettingsUI.as::onUpdateSuccess()
    private onUpdateSuccess(event: IMessageEvent): void
    {
        const parser = event.parser as WiredChestUpdateSuccessMessageParser;

        if(parser.chestId === this._chestId && parser.isNotificationPreferences)
        {
            this.hideFrame();
        }
    }

    /**
	 * The title names the kind of chest, so the same window reads correctly for both.
	 */
    // AS3: ChestNotificationSettingsUI.as::set chestType()
    set chestType(value: number)
    {
        this._chestType = value;

        const typeName = this.localization?.getLocalization(
            `wiredchests.${value === ChestType.TYPE_FURNI ? 'furni' : 'coin'}_chest`
        ) ?? '';

        const frame = this.framePreset;

        if(frame)
        {
            frame.title = this.localization?.getLocalizationWithParams(
                'wiredchests.notification_settings.title', '', 'chest_type', typeName
            ) ?? '';
        }
    }

    /**
	 * Settings arrive as a string map and the booleans are `"1"` — an absent key reads as false,
	 * which is how a chest that never set a preference gets the off state.
	 *
	 * AS3 types the map `_SafeCls_481` (the port's `OrderedMap`), but the port's
	 * `IRoomObjectModel.getStringToStringMap()` hands out a native `Map` and that is where the caller
	 * gets it, so the signature follows the port's deviation.
	 */
    // AS3: ChestNotificationSettingsUI.as::onEdit()
    onEdit(chestId: number, chestType: number, settings: Map<string, string>): void
    {
        this.chestType = chestType;
        this._chestId = chestId;

        const generic0 = this._genericGroup?.optionById(0) ?? null;
        const generic1 = this._genericGroup?.optionById(1) ?? null;
        const wired0 = this._wiredGroup?.optionById(0) ?? null;
        const wired1 = this._wiredGroup?.optionById(1) ?? null;
        const wired2 = this._wiredGroup?.optionById(2) ?? null;

        if(generic0) generic0.selected = settings.get('notification_chest_full') === '1';
        if(generic1) generic1.selected = settings.get('notification_donation') === '1';
        if(wired0) wired0.selected = settings.get('notification_someone_withdraws') === '1';
        if(wired1) wired1.selected = settings.get('notification_chest_empty') === '1';
        if(wired2) wired2.selected = settings.get('notification_wired_transaction') === '1';

        if(this._notificationMode)
        {
            this._notificationMode.selectedId = parseInt(settings.get('notify_mode') ?? '0', 10) || 0;
        }

        if(this._wiredSection) this._wiredSection.disabled = settings.get('is_wired_enabled') !== '1';

        this.showFrame();
    }

    // AS3: ChestNotificationSettingsUI.as::onSaveClicked()
    override onSaveClicked(): void
    {
        this._chestController?.send(new SetWiredChestNotificationSettingsComposer(
            this._chestId,
            this._notificationMode?.selectedId ?? 0,
            this._genericGroup?.optionById(0)?.selected ?? false,
            this._genericGroup?.optionById(1)?.selected ?? false,
            this._wiredGroup?.optionById(0)?.selected ?? false,
            this._wiredGroup?.optionById(1)?.selected ?? false,
            this._wiredGroup?.optionById(2)?.selected ?? false
        ));
    }

    // AS3: ChestNotificationSettingsUI.as::get chestController()
    get chestController(): WiredChestController | null
    {
        return this._chestController;
    }

    // AS3: ChestNotificationSettingsUI.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        if(this._updateSuccessEvent) this._chestController?.removeMessageEvent(this._updateSuccessEvent);

        this._updateSuccessEvent = null;
        this._genericGroup = null;
        this._wiredSection = null;
        this._wiredGroup = null;
        this._notificationMode = null;
        this._chestController = null;
        this._chestType = 0;
        this._chestId = -1;

        super.dispose();
    }
}
