import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageComposer} from '@core';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';

import {WiredUserVariablesPageMessageEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredUserVariablesPageMessageEvent';
import type {WiredUserVariablesPageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredUserVariablesPageParser';
import type {WiredUserVariablesPage} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredUserVariablesPage';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import {VariableManagementConfig} from './VariableManagementConfig';
import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import type {IVariableManagementOverviewController} from './IVariableManagementOverviewController';
import {VariableManagementOverviewView} from './VariableManagementOverviewView';

/**
 * VariableManagementOverviewController — DI component for the "manage variable" overview window. On a
 * page push it refreshes the variable cache, resolves the managed variable, and drives a
 * VariableManagementOverviewView (created on first page). Sends paging/detail requests through its own
 * communication manager.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/overview/VariableManagementOverviewController.as
 */
export class VariableManagementOverviewController extends Component implements IVariableManagementOverviewController
{
    // AS3: VariableManagementOverviewController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: VariableManagementOverviewController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: VariableManagementOverviewController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: VariableManagementOverviewController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: VariableManagementOverviewController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: VariableManagementOverviewController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: VariableManagementOverviewController.as::_messageEvents
    private _messageEvents: IMessageEvent[];

    // AS3: VariableManagementOverviewController.as::_SafeStr_4550 (name derived: the view)
    private _view: VariableManagementOverviewView | null = null;

    // AS3: VariableManagementOverviewController.as::_SafeStr_4734 (name derived: the current page)
    private _page: WiredUserVariablesPage | null = null;

    // AS3: VariableManagementOverviewController.as::_disposed
    private _wiredDisposed: boolean = false;

    // AS3: VariableManagementOverviewController.as::VariableManagementOverviewController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);
        this._roomEvents = roomEvents;
        this._messageEvents = [];
        this._messageEvents.push(new WiredUserVariablesPageMessageEvent((event) => this.onGetPage(event)));
        // Deferred to initComponent() — DI resolves the communication manager after construction (same
        // deviation as WiredMenuController / WiredRoomLogListController).
    }

    // AS3: VariableManagementOverviewController.as::get dependencies()
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
            )
            // AS3 also depends on IIDHabboRoomSessionManager with an empty RSE_STARTED handler — omitted
            // here as inert.
        ];
    }

    // AS3: VariableManagementOverviewController.as::initComponent() — deferred event registration + REE_DISPOSED.
    protected override initComponent(): void
    {
        for(const messageEvent of this._messageEvents)
        {
            this.addMessageEvent(messageEvent);
        }

        this._roomEngine?.events.on('REE_DISPOSED', this._onRoomEngineEvent);
    }

    // AS3: VariableManagementOverviewController.as::onGetPage()
    private onGetPage(event: IMessageEvent): void
    {
        const page = (event.parser as WiredUserVariablesPageParser).page;

        if(page.amount !== VariableManagementConfig.PAGE_SIZE)
        {
            return;
        }

        this._roomEvents.variablesSynchronizer.getAllVariables((variables) => this.initializeData(variables, page));
    }

    // AS3: VariableManagementOverviewController.as::initializeData()
    private initializeData(_variables: WiredVariable[], page: WiredUserVariablesPage): void
    {
        // AS3 stores the resolved variable (_SafeStr_5878) but never reads it in the controller; the
        // view re-resolves it, so only the existence guard is kept here.
        const variable = this._roomEvents.variablesSynchronizer.getCachedVariableById(page.variableId);

        if(variable == null)
        {
            return;
        }

        this._page = page;
        this.dataIsReady();
    }

    // AS3: VariableManagementOverviewController.as::dataIsReady()
    private dataIsReady(): void
    {
        if(this._view == null)
        {
            this._view = new VariableManagementOverviewView(this, this._windowManager!);
        }

        this._view.displayNewPage();

        if(!this._view.isShowing())
        {
            this._view.show();
        }
    }

    // AS3: VariableManagementOverviewController.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: VariableManagementOverviewController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.addHabboConnectionMessageEvent(event);
    }

    // AS3: VariableManagementOverviewController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.removeHabboConnectionMessageEvent(event);
    }

    // AS3: VariableManagementOverviewController.as::roomEventHandler()
    private _onRoomEngineEvent = (event: unknown): void =>
    {
        if(this._roomEngine == null)
        {
            return;
        }

        if((event as { type: string }).type === 'REE_DISPOSED')
        {
            if(this._view != null)
            {
                this._view.hide();
            }
        }
    };

    // AS3: VariableManagementOverviewController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager
    {
        return this._localizationManager!;
    }

    // AS3: VariableManagementOverviewController.as::get page()
    get page(): WiredUserVariablesPage | null
    {
        return this._page;
    }

    // AS3: VariableManagementOverviewController.as::get view()
    get view(): VariableManagementOverviewView | null
    {
        return this._view;
    }

    // AS3: VariableManagementOverviewController.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: VariableManagementOverviewController.as::dispose()
    override dispose(): void
    {
        if(this._wiredDisposed)
        {
            return;
        }

        this._wiredDisposed = true;

        this._roomEngine?.events.off('REE_DISPOSED', this._onRoomEngineEvent);

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
        this._page = null;
        this._communicationManager = null;
        this._localizationManager = null;
        this._sessionDataManager = null;
        this._windowManager = null;
        this._roomEngine = null;
        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        super.dispose();
    }

    // AS3: VariableManagementOverviewController.as::get disposed()
    override get disposed(): boolean
    {
        return this._wiredDisposed;
    }
}
