import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {WiredMenuController} from '../WiredMenuController';
import type {IWiredMenuTab} from './IWiredMenuTab';

/**
 * WiredMenuDefaultTab — base class for every wired-menu tab. Owns the tab's container, its
 * controller back-reference, the active/viewing/loading state machine, and a message-event registry
 * that is torn down on dispose. Subclasses override isDataReady()/initializeInterface() to drive the
 * loading spinner and populate their UI. If a subclass also implements IUpdateReceiver it is
 * registered with the context for per-frame updates.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/WiredMenuDefaultTab.as
 */
export class WiredMenuDefaultTab implements IWiredMenuTab
{
    // AS3: WiredMenuDefaultTab.as::_SafeStr_5769 (name derived: disposed flag)
    private _disposed: boolean = false;

    // AS3: WiredMenuDefaultTab.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: WiredMenuController;

    // AS3: WiredMenuDefaultTab.as::_container
    private _container: IWindowContainer;

    // AS3: WiredMenuDefaultTab.as::_messageEvents
    private _messageEvents: IMessageEvent[];

    // AS3: WiredMenuDefaultTab.as::_SafeStr_5514 (name derived: is-active)
    private _active: boolean = false;

    // AS3: WiredMenuDefaultTab.as::_SafeStr_5622 (name derived: is-viewing)
    private _viewing: boolean = false;

    // AS3: WiredMenuDefaultTab.as::_SafeStr_5835 (name derived: is-loading)
    private _loading: boolean = false;

    // AS3: WiredMenuDefaultTab.as::WiredMenuDefaultTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        this._controller = controller;
        this._container = container;
        this._messageEvents = [];

        // AS3: `var _loc3_:_SafeCls_64 = this as _SafeCls_64;` — register for per-frame updates only
        // when the concrete subclass implements IUpdateReceiver. TS `as` never yields null, so this
        // is a runtime duck-type check on the update() method instead.
        const receiver = this as unknown as IUpdateReceiver;

        if(typeof receiver.update === 'function')
        {
            controller.context.registerUpdateReceiver(receiver, 1);
        }
    }

    // AS3: WiredMenuDefaultTab.as::setTabActive()
    setTabActive(): void
    {
        this._active = true;
    }

    // AS3: WiredMenuDefaultTab.as::setTabInactive()
    setTabInactive(): void
    {
        this._active = false;
    }

    // AS3: WiredMenuDefaultTab.as::startViewing()
    startViewing(): void
    {
        this._viewing = true;
    }

    // AS3: WiredMenuDefaultTab.as::stopViewing()
    stopViewing(): void
    {
        this._viewing = false;

        if(this._loading)
        {
            this._controller.view!.loadingContainer.visible = false;
        }
    }

    // AS3: WiredMenuDefaultTab.as::updateLoadingState()
    protected updateLoadingState(): void
    {
        const ready = this.isDataReady();

        if(this._loading && ready)
        {
            this.initializeInterface();
        }

        this._loading = !ready;

        const loadingContainer = this._controller.view!.loadingContainer;

        if(this._viewing && loadingContainer.visible !== this._loading)
        {
            loadingContainer.visible = this._loading;
            this.controller.view!.window.caption = this.controller.localizationManager.getLocalization(this._loading ? 'wiredmenu.title.loading' : 'wiredmenu.title');
        }
    }

    // AS3: WiredMenuDefaultTab.as::isDataReady()
    protected isDataReady(): boolean
    {
        return true;
    }

    // AS3: WiredMenuDefaultTab.as::initializeInterface()
    protected initializeInterface(): void
    {
    }

    // AS3: WiredMenuDefaultTab.as::get controller()
    get controller(): WiredMenuController
    {
        return this._controller;
    }

    // AS3: WiredMenuDefaultTab.as::get localization()
    protected get localization(): IHabboLocalizationManager
    {
        return this._controller.localizationManager;
    }

    // AS3: WiredMenuDefaultTab.as::loc()
    protected loc(key: string): string
    {
        return this.localization.getLocalization(key, '');
    }

    // AS3: WiredMenuDefaultTab.as::get container()
    get container(): IWindowContainer
    {
        return this._container;
    }

    // AS3: WiredMenuDefaultTab.as::get isActive()
    get isActive(): boolean
    {
        return this._active;
    }

    // AS3: WiredMenuDefaultTab.as::get isViewing()
    get isViewing(): boolean
    {
        return this._viewing;
    }

    // AS3: WiredMenuDefaultTab.as::get isLoading()
    get isLoading(): boolean
    {
        return this._loading;
    }

    // AS3: WiredMenuDefaultTab.as::addMessageEvent()
    protected addMessageEvent(event: IMessageEvent): void
    {
        this._messageEvents.push(event);
        this._controller.addMessageEvent(event);
    }

    // AS3: WiredMenuDefaultTab.as::removeMessageEvents()
    private removeMessageEvents(): void
    {
        if(this._messageEvents == null)
        {
            return;
        }

        for(const event of this._messageEvents)
        {
            this._controller.removeMessageEvent(event);
            event.dispose();
        }

        this._messageEvents = null as unknown as IMessageEvent[];
    }

    // AS3: WiredMenuDefaultTab.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.removeMessageEvents();

        const receiver = this as unknown as IUpdateReceiver;

        if(typeof receiver.update === 'function')
        {
            this.controller.context.removeUpdateReceiver(receiver);
        }

        this._container = null as unknown as IWindowContainer;
        this._controller = null as unknown as WiredMenuController;
        this._active = false;
        this._viewing = false;
        this._loading = false;
        this._disposed = true;
    }

    // AS3: WiredMenuDefaultTab.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredMenuDefaultTab.as::permissionsUpdated()
    permissionsUpdated(): void
    {
    }
}
