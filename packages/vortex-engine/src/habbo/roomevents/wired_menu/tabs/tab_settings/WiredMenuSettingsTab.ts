import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';

import {Util} from '../../../Util';
import {UserDefinedRoomEventsCtrl} from '../../../wired_setup/UserDefinedRoomEventsCtrl';
import type {WiredMenuController} from '../../WiredMenuController';
import type {WiredMenuSettingsParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredMenuSettingsParser';
import {WiredMenuSettingsEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredMenuSettingsEvent';
import {SaveWiredMenuSettingsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/SaveWiredMenuSettingsComposer';
import {ReloadWiredRoomStateComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/ReloadWiredRoomStateComposer';
import {RequestWiredMenuSettingsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestWiredMenuSettingsComposer';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';

/**
 * WiredMenuSettingsTab — the "settings" tab. Two halves: (1) room settings — the modify/read wired
 * permission bitmasks (checkbox grids with dependency cascades) + the room timezone dropdown +
 * reload/roll-back buttons; (2) personal preferences — toolbar/inspect buttons, play-test mode,
 * all-notifications, and the wired UI style dropdown. Permission-mask edits push
 * SaveWiredMenuSettingsComposer; preference edits push through the controller's preference setters.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_settings/WiredMenuSettingsTab.as
 */
export class WiredMenuSettingsTab extends WiredMenuDefaultTab
{
    // AS3: WiredMenuSettingsTab.as::MODIFY_PERMISSION_OPTIONS
    // (AS3 declares these as instance vars assigned constant literals in the ctor; ported as static
    // readonly constants since the values never depend on the instance.)
    private static readonly MODIFY_PERMISSION_OPTIONS: number[] = [1, 2, 3];

    // AS3: WiredMenuSettingsTab.as::READ_PERMISSION_OPTIONS
    private static readonly READ_PERMISSION_OPTIONS: number[] = [0, 1, 2, 3];

    // AS3: WiredMenuSettingsTab.as::_SafeStr_5370 (name derived: modify-permission bitmask)
    private _modifyPermissionMask: number = -1;

    // AS3: WiredMenuSettingsTab.as::_SafeStr_5475 (name derived: read-permission bitmask)
    private _readPermissionMask: number = -1;

    // AS3: WiredMenuSettingsTab.as::_SafeStr_5395 (name derived: room timezone)
    private _timezone: string | null = null;

    // AS3: WiredMenuSettingsTab.as::_ignoringCheckboxEvents
    private _ignoringCheckboxEvents: boolean = false;

    // AS3: WiredMenuSettingsTab.as::_ignoringTimezoneEvents
    private _ignoringTimezoneEvents: boolean = false;

    // AS3: WiredMenuSettingsTab.as::_ignoringUiStyleEvents
    private _ignoringUiStyleEvents: boolean = false;

    // AS3: WiredMenuSettingsTab.as::WiredMenuSettingsTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);

        this.addMessageEvent(new WiredMenuSettingsEvent((event) => this.onWiredSettings(event)));
        this.updateLoadingState();
        this.requestData();

        for(const option of WiredMenuSettingsTab.MODIFY_PERMISSION_OPTIONS)
        {
            const checkbox = this.getModifyCheckbox(option);
            checkbox.addEventListener('WE_SELECTED', this._onPermissionsChanged);
            checkbox.addEventListener('WE_UNSELECTED', this._onPermissionsChanged);
        }

        for(const option of WiredMenuSettingsTab.READ_PERMISSION_OPTIONS)
        {
            const checkbox = this.getReadCheckbox(option);
            checkbox.addEventListener('WE_SELECTED', this._onPermissionsChanged);
            checkbox.addEventListener('WE_UNSELECTED', this._onPermissionsChanged);
        }

        this.toolbarCheckbox.addEventListener('WE_SELECTED', this._onPreferencesChanged);
        this.toolbarCheckbox.addEventListener('WE_UNSELECTED', this._onPreferencesChanged);
        this.wiredInspectButton.addEventListener('WE_SELECTED', this._onPreferencesChanged);
        this.wiredInspectButton.addEventListener('WE_UNSELECTED', this._onPreferencesChanged);
        this.playtestCheckbox.addEventListener('WE_SELECTED', this._onPreferencesChanged);
        this.playtestCheckbox.addEventListener('WE_UNSELECTED', this._onPreferencesChanged);
        this.allNotificationsCheckbox.addEventListener('WE_SELECTED', this._onPreferencesChanged);
        this.allNotificationsCheckbox.addEventListener('WE_UNSELECTED', this._onPreferencesChanged);
        this.uiStyleDropdown.addEventListener('WE_SELECTED', this._onPreferencesChanged);
        this.saveReloadButton.addEventListener('WME_CLICK', this._onClickReload);
        this.rollbackButton.addEventListener('WME_CLICK', this._onClickRollback);
        this.timezoneDropdown.addEventListener('WE_SELECTED', this._onSelectTimezone);
        this.wiredStyleBorder.visible = this.controller.getBoolean('wired.ui_picker_enabled');
    }

    // AS3: WiredMenuSettingsTab.as::onClickRollback()
    private _onClickRollback = (_event: WindowMouseEvent): void =>
    {
        this.controller.windowManager!.confirm('${wiredmenu.settings.room_state.roll_back}', '${wiredmenu.settings.room_state.roll_back.warning}', 0, this._onRollbackConfirmed).titleBarColor = 13909337;
    };

    // AS3: WiredMenuSettingsTab.as::onRollbackConfirmed()
    private _onRollbackConfirmed = (dialog: IDisposable, event: WindowEvent): void =>
    {
        if(event.type === 'WE_OK')
        {
            this.controller.send(new ReloadWiredRoomStateComposer(true));
        }

        dialog.dispose();
    };

    // AS3: WiredMenuSettingsTab.as::onClickReload()
    private _onClickReload = (_event: WindowMouseEvent): void =>
    {
        this.controller.send(new ReloadWiredRoomStateComposer(false));
    };

    // AS3: WiredMenuSettingsTab.as::onWiredSettings()
    private onWiredSettings(event: IMessageEvent): void
    {
        const parser = event.parser as WiredMenuSettingsParser;
        this._modifyPermissionMask = parser.modifyPermissionMask;
        this._readPermissionMask = parser.readPermissionMask;
        this._timezone = parser.timezone;
        this.updateLoadingState();
    }

    // AS3: WiredMenuSettingsTab.as::isDataReady()
    protected override isDataReady(): boolean
    {
        return this._modifyPermissionMask !== -1 && this._readPermissionMask !== -1 && this._timezone !== null;
    }

    // AS3: WiredMenuSettingsTab.as::requestData()
    private requestData(): void
    {
        this.controller.send(new RequestWiredMenuSettingsComposer());
    }

    // AS3: WiredMenuSettingsTab.as::permissionsUpdated()
    override permissionsUpdated(): void
    {
        this.updateButtonsUI();
    }

    // AS3: WiredMenuSettingsTab.as::initializeInterface()
    protected override initializeInterface(): void
    {
        this.updatePermissionsUI();
        this.updatePreferencesUI();
        this.updateTimezoneUI();
        this.updateButtonsUI();
        this.updateUiStyleUI();
    }

    // AS3: WiredMenuSettingsTab.as::onPermissionsChanged()
    private _onPermissionsChanged = (event: WindowEvent): void =>
    {
        if(this._ignoringCheckboxEvents)
        {
            return;
        }

        const checkbox = event.target as unknown as ISelectableWindow;
        const bit = Math.trunc(checkbox.id);
        const isModify = checkbox.name.indexOf('modify_') === 0;
        const selected = event.type === 'WE_SELECTED';

        if(isModify)
        {
            if(selected)
            {
                this._modifyPermissionMask |= 1 << bit;
            }
            else
            {
                this._modifyPermissionMask &= ~(1 << bit);
            }
        }
        else if(selected)
        {
            this._readPermissionMask |= 1 << bit;
        }
        else
        {
            this._readPermissionMask &= ~(1 << bit);
        }

        this.updatePermissionsUI();
        this.updateTimezoneUI();
        this.controller.send(new SaveWiredMenuSettingsComposer(this._modifyPermissionMask, this._readPermissionMask, this._timezone ?? ''));
    };

    // AS3: WiredMenuSettingsTab.as::onSelectTimezone()
    private _onSelectTimezone = (_event: WindowEvent): void =>
    {
        if(this._ignoringTimezoneEvents)
        {
            return;
        }

        const selection = this.timezoneDropdown.selection;

        if(selection < 0 || selection >= this.timezoneDropdown.numMenuItems)
        {
            this._timezone = '';
        }
        else
        {
            this._timezone = this.timezoneDropdown.enumerateSelection()[selection];
        }

        this.controller.send(new SaveWiredMenuSettingsComposer(this._modifyPermissionMask, this._readPermissionMask, this._timezone ?? ''));
    };

    // AS3: WiredMenuSettingsTab.as::updateButtonsUI()
    private updateButtonsUI(): void
    {
        const isOwnerOrStaff = this.controller.isRoomOwnerOrStaff();
        const canWrite = this.controller.hasWritePermission;
        Util.disableSection(this.saveReloadButton, !canWrite);
        Util.disableSection(this.rollbackButton, !isOwnerOrStaff);
    }

    // AS3: WiredMenuSettingsTab.as::updateTimezoneUI()
    private updateTimezoneUI(): void
    {
        this._ignoringTimezoneEvents = true;
        const dropdown = this.timezoneDropdown;
        const timezonesProperty = this.controller.getProperty('wired.timezones');
        const timezones = !timezonesProperty ? ['UTC'] : timezonesProperty.split(',');
        const ordered: string[] = [];

        if(this._timezone !== '')
        {
            ordered.push(this._timezone ?? '');
        }

        for(const timezone of timezones)
        {
            if(timezone !== this._timezone)
            {
                ordered.push(timezone);
            }
        }

        dropdown.populateWithStrings(ordered);

        if(ordered.length > 0)
        {
            dropdown.selection = 0;
        }

        Util.disableSection(dropdown, ordered.length < 2 || !this.timezoneContainer.isEnabled());
        this._ignoringTimezoneEvents = false;
    }

    // AS3: WiredMenuSettingsTab.as::updateUiStyleUI()
    private updateUiStyleUI(): void
    {
        this._ignoringUiStyleEvents = true;
        const dropdown = this.uiStyleDropdown;
        const defaultLabel = this.localization.getLocalizationWithParams('wiredmenu.settings.preferences.wired_style.default', '', 'name', Util.snakeToTitle('illumina'));
        const items: string[] = [defaultLabel];

        for(const style of UserDefinedRoomEventsCtrl.STYLE_OPTIONS)
        {
            items.push(Util.snakeToTitle(style));
        }

        dropdown.populate(items);
        this.pickedWiredStyleName = this.controller.uiStyle;
        this._ignoringUiStyleEvents = false;
    }

    // AS3: WiredMenuSettingsTab.as::updatePermissionsUI()
    private updatePermissionsUI(): void
    {
        this._ignoringCheckboxEvents = true;
        this.selectedModifyMask = this._modifyPermissionMask;
        this.selectedReadMask = this._readPermissionMask;
        const isOwnerOrStaff = this.controller.isRoomOwnerOrStaff();
        Util.disableSection(this.modifySettingsContainer, !isOwnerOrStaff);
        Util.disableSection(this.readSettingsContainer, !isOwnerOrStaff);
        Util.disableSection(this.timezoneContainer, !isOwnerOrStaff);

        if(this.getModifyCheckbox(2).isSelected)
        {
            this.getModifyCheckbox(3).select();
            Util.disableSection(this.getModifyCheckbox(3));
        }

        if(this.getReadCheckbox(2).isSelected)
        {
            this.getReadCheckbox(3).select();
            Util.disableSection(this.getReadCheckbox(3));
        }

        if(this.getReadCheckbox(0).isSelected)
        {
            for(const option of WiredMenuSettingsTab.READ_PERMISSION_OPTIONS)
            {
                if(option !== 0)
                {
                    const checkbox = this.getReadCheckbox(option);
                    checkbox.select();
                    Util.disableSection(checkbox);
                }
            }
        }

        for(const option of WiredMenuSettingsTab.MODIFY_PERMISSION_OPTIONS)
        {
            const modifyCheckbox = this.getModifyCheckbox(option);

            if(modifyCheckbox.isSelected)
            {
                const readCheckbox = this.getReadCheckbox(option);
                readCheckbox.select();
                Util.disableSection(readCheckbox);
            }
        }

        this._ignoringCheckboxEvents = false;
    }

    // AS3: WiredMenuSettingsTab.as::updatePreferencesUI()
    updatePreferencesUI(): void
    {
        this._ignoringCheckboxEvents = true;
        Util.select(this.toolbarCheckbox, this.controller.wiredMenuButton);
        Util.select(this.wiredInspectButton, this.controller.wiredInspectButton);
        Util.select(this.playtestCheckbox, this.controller.playTestMode);
        Util.select(this.allNotificationsCheckbox, this.controller.showAllNotifications);
        this._ignoringCheckboxEvents = false;
    }

    // AS3: WiredMenuSettingsTab.as::onPreferencesChanged()
    private _onPreferencesChanged = (_event: WindowEvent): void =>
    {
        if(this._ignoringCheckboxEvents || this._ignoringUiStyleEvents)
        {
            return;
        }

        this.controller.wiredMenuButton = this.toolbarCheckbox.isSelected;
        this.controller.wiredInspectButton = this.wiredInspectButton.isSelected;
        this.controller.setPlayTestMode(this.playtestCheckbox.isSelected, true);
        this.controller.showAllNotifications = this.allNotificationsCheckbox.isSelected;
        this.controller.uiStyle = this.pickedWiredStyleName;
        this.controller.sendPreferences();
    };

    // AS3: WiredMenuSettingsTab.as::set pickedWiredStyleName()
    private set pickedWiredStyleName(value: string)
    {
        this._ignoringUiStyleEvents = true;

        if(value === '')
        {
            this.uiStyleDropdown.selection = 0;
            // AS3 returns here WITHOUT clearing _ignoringUiStyleEvents — preserved verbatim (the flag
            // stays true after selecting the default style).
            return;
        }

        const index = UserDefinedRoomEventsCtrl.STYLE_OPTIONS.indexOf(value) + 1;
        this.uiStyleDropdown.selection = index;
        this._ignoringUiStyleEvents = false;
    }

    // AS3: WiredMenuSettingsTab.as::get pickedWiredStyleName()
    private get pickedWiredStyleName(): string
    {
        if(this.uiStyleDropdown.selection <= 0)
        {
            return '';
        }

        return UserDefinedRoomEventsCtrl.STYLE_OPTIONS[this.uiStyleDropdown.selection - 1];
    }

    // AS3: WiredMenuSettingsTab.as::get modifySettingsContainer()
    private get modifySettingsContainer(): IWindowContainer
    {
        return this.container.findChildByName('modify_settings_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuSettingsTab.as::get readSettingsContainer()
    private get readSettingsContainer(): IWindowContainer
    {
        return this.container.findChildByName('read_settings_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuSettingsTab.as::get timezoneContainer()
    private get timezoneContainer(): IWindowContainer
    {
        return this.container.findChildByName('timezone_container') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuSettingsTab.as::get toolbarCheckbox()
    private get toolbarCheckbox(): ISelectableWindow
    {
        return this.container.findChildByName('preference_toolbar_checkbox') as unknown as ISelectableWindow;
    }

    // AS3: WiredMenuSettingsTab.as::get wiredInspectButton()
    private get wiredInspectButton(): ISelectableWindow
    {
        return this.container.findChildByName('preference_inspect_button_checkbox') as unknown as ISelectableWindow;
    }

    // AS3: WiredMenuSettingsTab.as::get playtestCheckbox()
    private get playtestCheckbox(): ISelectableWindow
    {
        return this.container.findChildByName('preference_playtest_checkbox') as unknown as ISelectableWindow;
    }

    // AS3: WiredMenuSettingsTab.as::get allNotificationsCheckbox()
    private get allNotificationsCheckbox(): ISelectableWindow
    {
        return this.container.findChildByName('preference_all_notifications_checkbox') as unknown as ISelectableWindow;
    }

    // AS3: WiredMenuSettingsTab.as::getModifyCheckbox()
    private getModifyCheckbox(index: number): ISelectableWindow
    {
        return this.container.findChildByName('modify_' + index + '_checkbox') as unknown as ISelectableWindow;
    }

    // AS3: WiredMenuSettingsTab.as::getReadCheckbox()
    private getReadCheckbox(index: number): ISelectableWindow
    {
        return this.container.findChildByName('read_' + index + '_checkbox') as unknown as ISelectableWindow;
    }

    // AS3: WiredMenuSettingsTab.as::get timezoneDropdown()
    private get timezoneDropdown(): IDropMenuWindow
    {
        return this.container.findChildByName('timezone_picker') as unknown as IDropMenuWindow;
    }

    // AS3: WiredMenuSettingsTab.as::get uiStyleDropdown()
    private get uiStyleDropdown(): IDropMenuWindow
    {
        return this.container.findChildByName('wired_style_picker') as unknown as IDropMenuWindow;
    }

    // AS3: WiredMenuSettingsTab.as::get wiredStyleBorder()
    private get wiredStyleBorder(): IWindowContainer
    {
        return this.container.findChildByName('wired_style_border') as unknown as IWindowContainer;
    }

    // AS3: WiredMenuSettingsTab.as::get saveReloadButton()
    private get saveReloadButton(): IInteractiveWindow
    {
        return this.container.findChildByName('reload_room_btn') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuSettingsTab.as::get rollbackButton()
    private get rollbackButton(): IInteractiveWindow
    {
        return this.container.findChildByName('roll_back_btn') as unknown as IInteractiveWindow;
    }

    // AS3: WiredMenuSettingsTab.as::get selectedModifyMask()
    private get selectedModifyMask(): number
    {
        let mask = 0;

        for(const option of WiredMenuSettingsTab.MODIFY_PERMISSION_OPTIONS)
        {
            if(this.getModifyCheckbox(option).isSelected)
            {
                mask |= 1 << option;
            }
        }

        return mask;
    }

    // AS3: WiredMenuSettingsTab.as::get selectedReadMask()
    private get selectedReadMask(): number
    {
        let mask = 0;

        for(const option of WiredMenuSettingsTab.READ_PERMISSION_OPTIONS)
        {
            if(this.getReadCheckbox(option).isSelected)
            {
                mask |= 1 << option;
            }
        }

        return mask;
    }

    // AS3: WiredMenuSettingsTab.as::set selectedModifyMask()
    private set selectedModifyMask(value: number)
    {
        for(const option of WiredMenuSettingsTab.MODIFY_PERMISSION_OPTIONS)
        {
            Util.select(this.getModifyCheckbox(option), (value & (1 << option)) !== 0);
        }
    }

    // AS3: WiredMenuSettingsTab.as::set selectedReadMask()
    private set selectedReadMask(value: number)
    {
        for(const option of WiredMenuSettingsTab.READ_PERMISSION_OPTIONS)
        {
            Util.select(this.getReadCheckbox(option), (value & (1 << option)) !== 0);
        }
    }
}
