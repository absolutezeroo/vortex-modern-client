import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {HabboUserDefinedRoomEvents} from '../../../HabboUserDefinedRoomEvents';
import type {IWiredChestControllerHost} from '../IWiredChestControllerHost';
import type {WiredChestWrapperView} from '../WiredChestWrapperView';
import type {IChestSubController} from './IChestSubController';

/**
 * Shared base for the two chest tabs — furniture and coins.
 *
 * It owns **the subscriptions**: `addMessageEvent()` both registers with the controller and keeps
 * the event, so `dispose()` can unregister every one without each subclass tracking its own. A tab
 * is torn down and rebuilt whenever a different chest is opened, so leaking a handler here would
 * leave a dead tab reacting to a live chest.
 *
 * Everything else is a default a subclass overrides. AS3 makes none of them abstract — an
 * unoverridden tab reports type -1, no view, and empty.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/subcontrollers/AbstractChestSubController.as
 */
export class AbstractChestSubController implements IChestSubController
{
    // AS3: AbstractChestSubController.as::_disposed
    private _disposed: boolean = false;

    // AS3: AbstractChestSubController.as::_SafeStr_5744 (name derived: the owning controller)
    private _parentController: IWiredChestControllerHost | null;

    // AS3: AbstractChestSubController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: AbstractChestSubController.as::AbstractChestSubController()
    constructor(parentController: IWiredChestControllerHost)
    {
        this._parentController = parentController;
    }

    // AS3: AbstractChestSubController.as::get parentController()
    get parentController(): IWiredChestControllerHost | null
    {
        return this._parentController;
    }

    // AS3: AbstractChestSubController.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents | null
    {
        return this._parentController?.roomEvents ?? null;
    }

    /**
	 * AS3 passes the key as its own fallback, so a missing translation shows the key rather than an
	 * empty string.
	 */
    // AS3: AbstractChestSubController.as::localize()
    localize(key: string): string
    {
        return this.localization?.getLocalization(key, key) ?? key;
    }

    // AS3: AbstractChestSubController.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._parentController?.localization ?? null;
    }

    // AS3: AbstractChestSubController.as::addMessageEvent()
    protected addMessageEvent(event: IMessageEvent): void
    {
        this._messageEvents.push(event);
        this._parentController?.addMessageEvent(event);
    }

    /**
	 * AS3 unregisters *and* disposes each event — the second half matters, since the events are
	 * built per tab rather than shared.
	 */
    // AS3: AbstractChestSubController.as::removeMessageEvents()
    private removeMessageEvents(): void
    {
        for(const event of this._messageEvents)
        {
            this._parentController?.removeMessageEvent(event);
            event.dispose();
        }

        this._messageEvents = [];
    }

    /**
	 * The three permissions are the wrapper view's, not this tab's — every tab of one chest shares
	 * them, so they live where the chest does.
	 */
    // AS3: AbstractChestSubController.as::get canEdit()
    get canEdit(): boolean
    {
        return this.wrapperView?.canEdit === true;
    }

    // AS3: AbstractChestSubController.as::get canRead()
    get canRead(): boolean
    {
        return this.wrapperView?.canRead === true;
    }

    // AS3: AbstractChestSubController.as::get canWithdraw()
    get canWithdraw(): boolean
    {
        return this.wrapperView?.canWithdraw === true;
    }

    // AS3: AbstractChestSubController.as::get wrapperView()
    get wrapperView(): WiredChestWrapperView | null
    {
        return this._parentController?.chestWrapperView ?? null;
    }

    // AS3: AbstractChestSubController.as::get viewingChestId()
    get viewingChestId(): number
    {
        return this.wrapperView?.viewingChestId ?? -1;
    }

    /**
	 * -1, not 0: 0 is `ChestType.TYPE_FURNI`, so a base instance must not read as a furniture tab.
	 */
    // AS3: AbstractChestSubController.as::get type()
    get type(): number
    {
        return -1;
    }

    // AS3: AbstractChestSubController.as::get view()
    get view(): IWindowContainer | null
    {
        return null;
    }

    // AS3: AbstractChestSubController.as::get title()
    get title(): string
    {
        return '';
    }

    // AS3: AbstractChestSubController.as::get isEmpty()
    get isEmpty(): boolean
    {
        return true;
    }

    // AS3: AbstractChestSubController.as::clear()
    clear(): void
    {
    }

    // AS3: AbstractChestSubController.as::get itemCount()
    get itemCount(): number
    {
        return 0;
    }

    // AS3: AbstractChestSubController.as::updateUI()
    updateUI(): void
    {
    }

    // AS3: AbstractChestSubController.as::get allowResizing()
    get allowResizing(): boolean
    {
        return true;
    }

    // AS3: AbstractChestSubController.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.removeMessageEvents();
        this._parentController = null;
        this._disposed = true;
    }

    // AS3: AbstractChestSubController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }
}
