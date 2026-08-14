import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
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

import {
    WiredUserPermanentVariablesEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredUserPermanentVariablesEvent';
import {
    WiredSetUserPermanentVariableResultEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredSetUserPermanentVariableResultEvent';
import type {
    WiredUserPermanentVariablesEventParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredUserPermanentVariablesEventParser';
import type {
    WiredSetUserPermanentVariableResultEventParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredSetUserPermanentVariableResultEventParser';
import type {
    WiredUserPermanentVariablesList
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredUserPermanentVariablesList';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import type {IVariableManagementDetailController} from './IVariableManagementDetailController';
import {VariableManagementDetailView} from './VariableManagementDetailView';

/**
 * VariableManagementDetailController — DI component owning the per-holder permanent-variable editor.
 *
 * The window opens on data rather than on a command: nothing here shows it, `dataIsReady()` does,
 * the first time a list arrives. The list is requested from the *overview* (header 3777) and from
 * this window's own refresh button, so this controller only ever reacts.
 *
 * **Two sources have to agree before anything is drawn.** The wire sends variable ids and values; it
 * does not send what those variables *are*. `onGetData()` therefore asks the synchroniser for the
 * variable catalogue first and only then calls `initializeData()`, which is why the response handler
 * is asynchronous where its sibling controllers' are not.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/variables_management/detail/VariableManagementDetailController.as
 */
export class VariableManagementDetailController extends Component implements IVariableManagementDetailController
{
    // AS3: VariableManagementDetailController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: VariableManagementDetailController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: VariableManagementDetailController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: VariableManagementDetailController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: VariableManagementDetailController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: VariableManagementDetailController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: VariableManagementDetailController.as::_messageEvents
    private _messageEvents: IMessageEvent[];

    // AS3: VariableManagementDetailController.as::_view (obfuscated `_SafeStr_4550`)
    private _view: VariableManagementDetailView | null = null;

    // AS3: VariableManagementDetailController.as::_data (obfuscated `_SafeStr_4556`)
    private _data: WiredUserPermanentVariablesList | null = null;

    /**
	 * AS3 keeps this as a `Dictionary` keyed by variable id; a `Map` is the same lookup. It is
	 * rebuilt from scratch on every list, never merged — a variable the catalogue stopped
	 * describing must disappear rather than linger.
	 */
    // AS3: VariableManagementDetailController.as::_variablesById (obfuscated `_SafeStr_6056`)
    private _variablesById: Map<string, WiredVariable> = new Map();

    // AS3: VariableManagementDetailController.as::_disposed
    private _wiredDisposed: boolean = false;

    // AS3: VariableManagementDetailController.as::VariableManagementDetailController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);

        this._roomEvents = roomEvents;
        this._messageEvents = [];
        this._messageEvents.push(new WiredUserPermanentVariablesEvent((event) => this.onGetData(event)));
        this._messageEvents.push(new WiredSetUserPermanentVariableResultEvent((event) => this.onGetResult(event)));

        // AS3 registers each event right here; this port resolves DI dependencies after
        // construction, so the communication manager is still null and addMessageEvent() would
        // no-op. Registration is deferred to initComponent(), the same deviation
        // WiredRoomLogListController and WiredMenuController already make.
    }

    // AS3: VariableManagementDetailController.as::get dependencies()
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
            // AS3 also takes IIDHabboRoomSessionManager with an RSE_STARTED listener whose handler
            // (`roomSessionEventHandler`) has an empty body. Omitted as inert, exactly as
            // WiredRoomLogListController omits the same pair.
        ];
    }

    // AS3: VariableManagementDetailController.as::VariableManagementDetailController() — deferred registration
    protected override initComponent(): void
    {
        for(const messageEvent of this._messageEvents)
        {
            this.addMessageEvent(messageEvent);
        }

        // AS3 wires REE_DISPOSED through the RoomEngine dependency's listener list; RoomEngine emits
        // it on `events`, so subscribe there directly (same as the sibling controllers).
        this._roomEngine?.events.on('REE_DISPOSED', this._onRoomEngineEvent);
    }

    /**
	 * The holder's list arrived. The catalogue lookup runs first and the list is captured in the
	 * closure, so a second push landing mid-flight cannot make the callback apply the wrong one.
	 */
    // AS3: VariableManagementDetailController.as::onGetData()
    private onGetData(event: IMessageEvent): void
    {
        const list = (event.parser as WiredUserPermanentVariablesEventParser).list;

        if(list === null) return;

        this._roomEvents.variablesSynchronizer.getAllVariables((variables: WiredVariable[]) =>
        {
            this.initializeData(variables, list);
        });
    }

    // AS3: VariableManagementDetailController.as::initializeData()
    private initializeData(variables: WiredVariable[], list: WiredUserPermanentVariablesList): void
    {
        this._data = list;
        this._variablesById = new Map();

        for(const variable of variables)
        {
            this._variablesById.set(variable.variableId, variable);
        }

        this.dataIsReady();
    }

    /**
	 * Build on first data, then repaint. AS3 shows the window only when it is not already showing,
	 * so a refresh does not re-centre a window the player may have moved.
	 */
    // AS3: VariableManagementDetailController.as::dataIsReady()
    private dataIsReady(): void
    {
        if(this._view === null)
        {
            if(this._windowManager === null) return;

            this._view = new VariableManagementDetailView(this, this._windowManager);
        }

        this._view.displayNewData();

        if(!this._view.isShowing()) this._view.show();
    }

    /**
	 * AS3 says nothing on success — the refreshed list arrives as its own push — and raises a
	 * notification on failure. There is no error text on the wire, only the boolean.
	 */
    // AS3: VariableManagementDetailController.as::onGetResult()
    private onGetResult(event: IMessageEvent): void
    {
        const parser = event.parser as WiredSetUserPermanentVariableResultEventParser;

        if(parser.success) return;

        this._roomEvents.notifications.addItem(
            '${wiredmenu.variable_management_detail.notification.modification_failed}',
            'wired'
        );
    }

    // AS3: VariableManagementDetailController.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: VariableManagementDetailController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.addHabboConnectionMessageEvent(event);
    }

    // AS3: VariableManagementDetailController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.removeHabboConnectionMessageEvent(event);
    }

    // AS3: VariableManagementDetailController.as::roomEventHandler()
    private _onRoomEngineEvent = (event: unknown): void =>
    {
        if(this._roomEngine == null)
        {
            return;
        }

        if((event as { type: string }).type === 'REE_DISPOSED')
        {
            // The room went away; the window hides rather than disposing, so re-entering a room and
            // opening the editor again reuses it.
            this._view?.hide();
        }
    };

    // AS3: VariableManagementDetailController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: VariableManagementDetailController.as::get data()
    get data(): WiredUserPermanentVariablesList | null
    {
        return this._data;
    }

    // AS3: VariableManagementDetailController.as::get view()
    get view(): VariableManagementDetailView | null
    {
        return this._view;
    }

    // AS3: VariableManagementDetailController.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: VariableManagementDetailController.as::get variablesById()
    get variablesById(): Map<string, WiredVariable>
    {
        return this._variablesById;
    }

    // AS3: VariableManagementDetailController.as::get disposed()
    override get disposed(): boolean
    {
        return this._wiredDisposed;
    }

    // AS3: VariableManagementDetailController.as::dispose()
    override dispose(): void
    {
        if(this._wiredDisposed)
        {
            return;
        }

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

        this._messageEvents = [];
        this._data = null;
        this._variablesById = new Map();
        this._communicationManager = null;
        this._localizationManager = null;
        this._sessionDataManager = null;
        this._windowManager = null;
        this._roomEngine = null;
        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        this._wiredDisposed = true;

        super.dispose();
    }
}
