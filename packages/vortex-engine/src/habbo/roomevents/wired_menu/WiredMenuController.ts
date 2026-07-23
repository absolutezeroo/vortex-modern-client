import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageComposer} from '@core';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import {RoomSessionEvent} from '@habbo/session/events/RoomSessionEvent';

import {WiredPermissionsEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredPermissionsEvent';
import type {WiredPermissionsEventParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredPermissionsEventParser';
import {AccountPreferencesEvent} from '@habbo/communication/messages/incoming/preferences/AccountPreferencesEvent';
import type {AccountPreferencesParser} from '@habbo/communication/messages/parser/preferences/AccountPreferencesParser';
import {YouAreControllerMessageEvent} from '@habbo/communication/messages/incoming/room/permissions/YouAreControllerMessageEvent';
import {SetWiredMenuPreferencesComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/SetWiredMenuPreferencesComposer';
import {RequestWiredRoomLogsComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/RequestWiredRoomLogsComposer';

import {WiredInputSourcePicker} from '../wired_setup/inputsources/WiredInputSourcePicker';
import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';
import type {WiredVariablesSynchronizer} from '../WiredVariablesSynchronizer';
import type {IWiredMenuController} from './IWiredMenuController';
import {WiredMenuView} from './WiredMenuView';
import {WiredMenuTabConfigs} from './tabs/WiredMenuTabConfigs';
import {WiredMenuInspectionTab} from './tabs/tab_inspection/WiredMenuInspectionTab';
import {WiredMenuSettingsTab} from './tabs/tab_settings/WiredMenuSettingsTab';
import {WiredMenuOverviewTab} from './tabs/tab_variable_overview/WiredMenuOverviewTab';
import {WiredRoomLogsConfig} from './roomlogs/WiredRoomLogsConfig';
import {WiredRoomLogListController} from './roomlogs/WiredRoomLogListController';
import {VariableManagementOverviewController} from './variables_management/overview/VariableManagementOverviewController';
import {VariableManagementDetailController} from './variables_management/detail/VariableManagementDetailController';

/**
 * WiredMenuController — the room-events menu controller. A DI component that owns the WiredMenuView
 * window, the three sub-controllers (variable overview/detail, room-log list), the wired permission
 * surface, and the account-preference toggles (menu/inspect buttons, play-test mode, whisper
 * suppression, notifications, UI style). Registers as a link-event tracker to open the menu / route
 * inspection & overview deep links.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/WiredMenuController.as
 */
export class WiredMenuController extends Component implements ILinkEventTracker, IWiredMenuController
{
    // AS3: WiredMenuController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: WiredMenuController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: WiredMenuController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: WiredMenuController.as::_avatarRenderManager
    private _avatarRenderManager: IAvatarRenderManager | null = null;

    // AS3: WiredMenuController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: WiredMenuController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: WiredMenuController.as::_roomSessionManager (holds the emitter for RSE_STARTED, port-only)
    private _roomSessionManager: IRoomSessionManager | null = null;

    // AS3: WiredMenuController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredMenuController.as::_SafeStr_4550 (name derived: the menu view)
    private _view: WiredMenuView | null = null;

    // AS3: WiredMenuController.as::_messageEvents
    private _messageEvents: IMessageEvent[];

    // AS3: WiredMenuController.as::_SafeStr_7662 (name derived: can-modify permission)
    private _canModify: boolean = false;

    // AS3: WiredMenuController.as::_SafeStr_8145 (name derived: can-read permission)
    private _canRead: boolean = false;

    // AS3: WiredMenuController.as::_SafeStr_7192 (name derived: variable-management overview controller)
    private _variableManagementOverview: VariableManagementOverviewController | null = null;

    // AS3: WiredMenuController.as::_SafeStr_7345 (name derived: variable-management detail controller)
    private _variableManagementDetail: VariableManagementDetailController | null = null;

    // AS3: WiredMenuController.as::_SafeStr_5525 (name derived: room-log list controller)
    private _roomLogListController: WiredRoomLogListController | null = null;

    // AS3: WiredMenuController.as::_SafeStr_7790 (name derived: wired-menu button preference)
    private _wiredMenuButton: boolean = false;

    // AS3: WiredMenuController.as::_SafeStr_7904 (name derived: wired-inspect button preference)
    private _wiredInspectButton: boolean = false;

    // AS3: WiredMenuController.as::_playTestMode
    private _playTestMode: boolean = false;

    // AS3: WiredMenuController.as::_SafeStr_7751 (name derived: wired-whisper-disabled preference)
    private _wiredWhisperDisabled: boolean = false;

    // AS3: WiredMenuController.as::_SafeStr_8158 (name derived: show-all-notifications preference)
    private _showAllNotifications: boolean = false;

    // AS3: WiredMenuController.as::_SafeStr_7179 (name derived: wired UI style)
    private _uiStyle: string = 'illumina';

    // AS3: WiredMenuController.as::_SafeStr_5769 (name derived: disposed flag)
    private _wiredDisposed: boolean = false;

    // AS3: WiredMenuController.as::WiredMenuController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);
        this._roomEvents = roomEvents;

        this._messageEvents = [];
        this._messageEvents.push(new WiredPermissionsEvent((event) => this.onWiredPermissions(event)));
        this._messageEvents.push(new AccountPreferencesEvent((event) => this.onAccountPreferences(event)));
        this._messageEvents.push(new YouAreControllerMessageEvent((event) => this.onControllerMessageEvent(event)));
        // AS3 registers each event here (addMessageEvent). In this port DI dependencies resolve after
        // construction, so _communicationManager is still null now and addMessageEvent() would no-op;
        // registration is deferred to initComponent() where communication is available (same deviation
        // as HabboUserDefinedRoomEvents).

        this._variableManagementOverview = new VariableManagementOverviewController(roomEvents, context, 0, assets);
        this._variableManagementDetail = new VariableManagementDetailController(roomEvents, context, 0, assets);
        this._roomLogListController = new WiredRoomLogListController(roomEvents, context, 0, assets);
    }

    // AS3: WiredMenuController.as::get dependencies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => { this._communicationManager = manager; },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) => { this._sessionDataManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => { this._windowManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => { this._localizationManager = manager; }
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (engine: IRoomEngine | null) => { this._roomEngine = engine; },
                false
            ),
            // AS3 registers the RSE_STARTED listener via the dependency's event-listener list, which the
            // port attaches to `events`; RoomSessionManager emits RSE_* on `sessionEvents` instead
            // (rule 20-architecture #4), so subscribe there in the resolve callback — same pattern as
            // HabboUserDefinedRoomEvents.
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: IRoomSessionManager | null) =>
                {
                    this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_STARTED, this._onRoomSessionEvent);
                    this._roomSessionManager = manager;
                    manager?.sessionEvents.on(RoomSessionEvent.RSE_STARTED, this._onRoomSessionEvent);
                },
                false
            ),
            new ComponentDependency(
                IID_AvatarRenderManager,
                (manager: IAvatarRenderManager | null) => { this._avatarRenderManager = manager; }
            )
        ];
    }

    // AS3: WiredMenuController.as::initComponent()
    protected override initComponent(): void
    {
        this.context.addLinkEventTracker(this);

        // Deferred from the ctor (see note there): register the incoming message events now that the
        // communication manager has been resolved.
        for(const messageEvent of this._messageEvents)
        {
            this.addMessageEvent(messageEvent);
        }

        // AS3 wires REE_DISPOSED through the RoomEngine dependency's event-listener list; RoomEngine
        // emits it on `events`, so subscribe there directly (same as HabboUserDefinedRoomEvents).
        this._roomEngine?.events.on('REE_DISPOSED', this._onRoomEngineEvent);
    }

    // AS3: WiredMenuController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'wiredmenu/';
    }

    // AS3: WiredMenuController.as::linkReceived()
    linkReceived(link: string): void
    {
        if(!this.isEnabled || !this.hasReadPermission)
        {
            this._windowManager?.alert('${wiredmenu.invalid_room.title}', '${wiredmenu.invalid_room.desc}', 0, null);
            return;
        }

        const parts = link.split('/');

        if(parts.length < 2)
        {
            return;
        }

        if(parts[1] === 'open')
        {
            this.showView();

            if(parts.length >= 3)
            {
                this.view!.selectTab(parts[2]);

                if(parts[2] === WiredMenuTabConfigs.TAB_INSPECTION_ID)
                {
                    this.routeInspectionLink(link);
                }
                else if(parts[2] === WiredMenuTabConfigs.TAB_OVERVIEW_ID)
                {
                    this.routeOverviewLink(link);
                }
            }
        }

        if(parts[1] === 'logs')
        {
            if(!this.isShowing())
            {
                this.showView();
                this.view!.selectTab(WiredMenuTabConfigs.TAB_MONITOR_ID);
            }

            const logView = this._roomLogListController!.view;

            if(logView == null || !logView.isShowing())
            {
                this._roomLogListController!.send(new RequestWiredRoomLogsComposer(1, WiredRoomLogsConfig.PAGE_SIZE, -1, -1, ''));
            }
            else
            {
                logView.activate();
            }
        }
    }

    // AS3: WiredMenuController.as::routeInspectionLink()
    routeInspectionLink(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 5)
        {
            return;
        }

        // AS3: `view.activeTab as WiredMenuInspectionTab` — a safe cast that yields null on type
        // mismatch; instanceof is the faithful TS equivalent.
        const activeTab = this.view!.activeTab;

        if(!(activeTab instanceof WiredMenuInspectionTab))
        {
            return;
        }

        const id = parseInt(parts[4], 10);

        if(parts[3] === String(WiredInputSourcePicker.FURNI_SOURCE))
        {
            activeTab.inspectFurni(id, true);
        }
        else if(parts[3] === String(WiredInputSourcePicker.USER_SOURCE))
        {
            activeTab.inspectUser(id, true);
        }
    }

    // AS3: WiredMenuController.as::routeOverviewLink()
    routeOverviewLink(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 4)
        {
            return;
        }

        const activeTab = this.view!.activeTab;

        if(!(activeTab instanceof WiredMenuOverviewTab))
        {
            return;
        }

        activeTab.jumpToVariableByName(parts[3]);
    }

    // AS3: WiredMenuController.as::toggleView()
    toggleView(): void
    {
        if(this.isShowing())
        {
            this.hideView();
        }
        else
        {
            this.showView();
        }
    }

    // AS3: WiredMenuController.as::showView()
    private showView(): void
    {
        if(!this.isEnabled || !this.hasReadPermission)
        {
            return;
        }

        if(this._view == null || this._view.disposed)
        {
            this._view = new WiredMenuView(this, this._windowManager!);
            this._view.initialize();
        }

        this._view.show();
    }

    // AS3: WiredMenuController.as::hideView()
    private hideView(): void
    {
        if(this._view == null || this._view.disposed)
        {
            return;
        }

        this._view.hide();
    }

    // AS3: WiredMenuController.as::isShowing()
    private isShowing(): boolean
    {
        return this._view != null && !this._view.disposed && this._view.isShowing();
    }

    // AS3: WiredMenuController.as::get isEnabled()
    get isEnabled(): boolean
    {
        return this.getBoolean('wired.menu.enabled');
    }

    // AS3: WiredMenuController.as::isRoomOwnerOrStaff()
    isRoomOwnerOrStaff(): boolean
    {
        const session = this._roomEvents.roomSession;

        if(session == null)
        {
            return false;
        }

        const isStaff = this._sessionDataManager?.hasSecurity(4) ?? false;
        const isOwner = session.isRoomOwner;

        return isStaff || isOwner;
    }

    // AS3: WiredMenuController.as::get hasReadPermission()
    get hasReadPermission(): boolean
    {
        if(this.isRoomOwnerOrStaff())
        {
            return true;
        }

        return this._canRead;
    }

    // AS3: WiredMenuController.as::get hasWritePermission()
    get hasWritePermission(): boolean
    {
        if(this.isRoomOwnerOrStaff())
        {
            return true;
        }

        return this._canModify;
    }

    // AS3: WiredMenuController.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: WiredMenuController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.addHabboConnectionMessageEvent(event);
    }

    // AS3: WiredMenuController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.removeHabboConnectionMessageEvent(event);
    }

    // AS3: WiredMenuController.as::roomEventHandler()
    private _onRoomEngineEvent = (event: unknown): void =>
    {
        if(this._roomEngine == null)
        {
            return;
        }

        const e = event as { type: string };

        if(e.type === 'REE_DISPOSED')
        {
            if(this._view != null)
            {
                this._view.dispose();
                this._view = null;
            }
        }
    };

    // AS3: WiredMenuController.as::onWiredPermissions()
    private onWiredPermissions(event: IMessageEvent): void
    {
        const parser = event.parser as WiredPermissionsEventParser;
        this._canModify = parser.canModify;
        this._canRead = parser.canRead;

        if(this._view != null && !this._view.disposed)
        {
            if(!this._canRead)
            {
                this._view.dispose();
                this._view = null;
            }
            else
            {
                this._view.permissionsUpdated();
            }
        }

        // TODO(AS3): AS3 also calls _roomEvents.wiredChest.onPermissionsChanged(); the wired-chest
        // controller is not ported yet (see HabboUserDefinedRoomEvents scope note).
    }

    // AS3: WiredMenuController.as::onAccountPreferences()
    private onAccountPreferences(event: IMessageEvent): void
    {
        const parser = event.parser as AccountPreferencesParser;
        this._wiredMenuButton = parser.wiredMenuButton;
        this._wiredInspectButton = parser.wiredInspectButton;
        this.setPlayTestMode(parser.playTestMode);
        this._wiredWhisperDisabled = parser.wiredWhisperDisabled;
        this._showAllNotifications = parser.showAllNotifications;
        this.uiStyle = parser.wiredUiStyle;
    }

    // AS3: WiredMenuController.as::onControllerMessageEvent()
    private onControllerMessageEvent(_event: IMessageEvent): void
    {
        const session = this._roomEvents.roomSession;

        if(session != null && this._playTestMode)
        {
            // TODO(AS3): AS3 passes a 4th "wiredmenu/open/settings" click-link arg to addItem; the port's
            // IHabboNotifications.addItem takes no link param, so the notification is not click-routable.
            this._roomEvents.notifications.addItem(
                this._localizationManager!.getLocalization('wiredmenu.settings.preferences.notification.playtest'),
                'info',
                'icon_wired_notification_png'
            );
        }
    }

    // AS3: WiredMenuController.as::roomSessionEventHandler()
    private _onRoomSessionEvent = (event: unknown): void =>
    {
        const e = event as { type: string; session: IRoomSession };

        if(e.type !== RoomSessionEvent.RSE_STARTED)
        {
            return;
        }

        e.session.playTestMode = this._playTestMode;
    };

    // AS3: WiredMenuController.as::get wiredMenuButton()
    get wiredMenuButton(): boolean
    {
        return this._wiredMenuButton;
    }

    // AS3: WiredMenuController.as::set wiredMenuButton()
    set wiredMenuButton(value: boolean)
    {
        this._wiredMenuButton = value;
        // TODO(AS3): AS3 dispatches WiredMenuEvent('WIRED_MENU_BUTTON_PREFERENCE_CHANGED') on
        // roomEvents.events so the toolbar refreshes the wired button. The port keeps `events` for the
        // DI system (rule 20-architecture #4) and has no wired-domain emitter or toolbar listener for
        // this yet, so the dispatch is deferred.
    }

    // AS3: WiredMenuController.as::get wiredInspectButton()
    get wiredInspectButton(): boolean
    {
        return this._wiredInspectButton;
    }

    // AS3: WiredMenuController.as::set wiredInspectButton()
    set wiredInspectButton(value: boolean)
    {
        this._wiredInspectButton = value;
    }

    // AS3: WiredMenuController.as::get showAllNotifications()
    get showAllNotifications(): boolean
    {
        return this._showAllNotifications;
    }

    // AS3: WiredMenuController.as::set showAllNotifications()
    set showAllNotifications(value: boolean)
    {
        this._showAllNotifications = value;
    }

    // AS3: WiredMenuController.as::get uiStyle()
    get uiStyle(): string
    {
        return this._uiStyle;
    }

    // AS3: WiredMenuController.as::set uiStyle()
    set uiStyle(value: string)
    {
        if(value === this._uiStyle)
        {
            return;
        }

        this._uiStyle = value;

        if(this.getBoolean('wired.ui_picker_enabled'))
        {
            this._roomEvents.wiredCtrl.setPreferredWiredStyleByName(this._uiStyle === '' ? 'illumina' : this._uiStyle);
        }
    }

    // AS3: WiredMenuController.as::get wiredWhisperDisabled()
    get wiredWhisperDisabled(): boolean
    {
        return this._wiredWhisperDisabled;
    }

    // AS3: WiredMenuController.as::set wiredWhisperDisabled()
    set wiredWhisperDisabled(value: boolean)
    {
        this._wiredWhisperDisabled = value;
        this.sendPreferences();
    }

    // AS3: WiredMenuController.as::get playTestMode()
    get playTestMode(): boolean
    {
        return this._playTestMode;
    }

    // AS3: WiredMenuController.as::setPlayTestMode()
    setPlayTestMode(value: boolean, sendToServer: boolean = false, updateUI: boolean = false): void
    {
        const session = this._roomEvents.roomSession;

        if(session != null)
        {
            session.playTestMode = value;
        }

        if(this._playTestMode !== value && sendToServer)
        {
            this._playTestMode = value;
            const key = 'wiredmenu.settings.preferences.notification.playtest.' + (value ? 'enabled' : 'disabled');
            // TODO(AS3): AS3 passes a 4th "wiredmenu/open/settings" click-link arg (see onControllerMessageEvent).
            this._roomEvents.notifications.addItem(this._localizationManager!.getLocalization(key), 'info', 'icon_wired_notification_png');

            if(updateUI)
            {
                this.sendPreferences();

                if(this._view != null)
                {
                    const settingsTab = this._view.activeTab;

                    if(!(settingsTab instanceof WiredMenuSettingsTab))
                    {
                        return;
                    }

                    settingsTab.updatePreferencesUI();
                }
            }
        }
    }

    // AS3: WiredMenuController.as::furniSelected()
    furniSelected(id: number): void
    {
        if(!this.isEnabled || this._view == null || this._view.disposed)
        {
            return;
        }

        if(this._view.activeTabId === WiredMenuTabConfigs.TAB_INSPECTION_ID)
        {
            (this._view.activeTab as unknown as WiredMenuInspectionTab).inspectFurni(id);
        }
    }

    // AS3: WiredMenuController.as::userSelected()
    userSelected(id: number): void
    {
        if(!this.isEnabled || this._view == null || this._view.disposed)
        {
            return;
        }

        if(this._view.activeTabId === WiredMenuTabConfigs.TAB_INSPECTION_ID)
        {
            (this._view.activeTab as unknown as WiredMenuInspectionTab).inspectUser(id);
        }
    }

    // AS3: WiredMenuController.as::sendPreferences()
    sendPreferences(): void
    {
        this.send(new SetWiredMenuPreferencesComposer(this._wiredMenuButton, this._wiredInspectButton, this._playTestMode, this._wiredWhisperDisabled, this._showAllNotifications, this._uiStyle));
    }

    // AS3: WiredMenuController.as::hasUIOpen()
    hasUIOpen(): boolean
    {
        return this._view != null && this._view.isShowing();
    }

    // AS3: WiredMenuController.as::dispose()
    override dispose(): void
    {
        if(this._wiredDisposed)
        {
            return;
        }

        this._wiredDisposed = true;

        this._roomEngine?.events.off('REE_DISPOSED', this._onRoomEngineEvent);
        this._roomSessionManager?.sessionEvents.off(RoomSessionEvent.RSE_STARTED, this._onRoomSessionEvent);

        if(this._variableManagementOverview != null)
        {
            this._variableManagementOverview.dispose();
            this._variableManagementOverview = null;
        }

        if(this._variableManagementDetail != null)
        {
            this._variableManagementDetail.dispose();
            this._variableManagementDetail = null;
        }

        if(this._roomLogListController != null)
        {
            this._roomLogListController.dispose();
            this._roomLogListController = null;
        }

        if(this._view != null)
        {
            this._view.dispose();
            this._view = null;
        }

        for(const messageEvent of this._messageEvents)
        {
            this.removeMessageEvent(messageEvent);
        }

        this._messageEvents = null as unknown as IMessageEvent[];
        this._communicationManager = null;
        this._sessionDataManager = null;
        this._windowManager = null;
        this._localizationManager = null;
        this._roomEngine = null;

        super.dispose();
    }

    // AS3: WiredMenuController.as::get disposed()
    override get disposed(): boolean
    {
        return this._wiredDisposed;
    }

    // AS3: WiredMenuController.as::get communicationManager()
    get communicationManager(): IHabboCommunicationManager | null
    {
        return this._communicationManager;
    }

    // AS3: WiredMenuController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager
    {
        return this._localizationManager!;
    }

    // AS3: WiredMenuController.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: WiredMenuController.as::get avatarRenderManager()
    get avatarRenderManager(): IAvatarRenderManager | null
    {
        return this._avatarRenderManager;
    }

    // AS3: WiredMenuController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: WiredMenuController.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this._roomEngine;
    }

    // AS3: WiredMenuController.as::get view()
    get view(): WiredMenuView | null
    {
        return this._view;
    }

    // AS3: WiredMenuController.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: WiredMenuController.as::get variablesSynchronizer()
    get variablesSynchronizer(): WiredVariablesSynchronizer
    {
        return this._roomEvents.variablesSynchronizer;
    }

    // AS3: WiredMenuController.as::get roomLogListController()
    get roomLogListController(): WiredRoomLogListController | null
    {
        return this._roomLogListController;
    }
}
