import type {IWindow} from '@core/window/IWindow';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {
    WiredOpenContractMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/contracts/WiredOpenContractMessageEvent';
import {
    WiredContractContentsMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/contracts/WiredContractContentsMessageEvent';
import {
    WiredContractUpdateResultMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/contracts/WiredContractUpdateResultMessageEvent';
import type {
    WiredOpenContractMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredOpenContractMessageParser';
import type {
    WiredContractContentsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredContractContentsMessageParser';
import type {
    WiredContractUpdateResultMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredContractUpdateResultMessageParser';
import {
    RequestWiredContractContentsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/contracts/RequestWiredContractContentsComposer';
import {
    SaveWiredContractComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/contracts/SaveWiredContractComposer';

import type {HabboUserDefinedRoomEvents} from '../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../wired_setup/uibuilder/PresetManager';
import {UbuntuPresetManager} from '../UbuntuPresetManager';
import type {IWiredContractController} from './IWiredContractController';
import type {IContract} from './subcontrollers/IContract';
import {AddEditContractElement} from './subcontrollers/AddEditContractElement';
import {PaymentContract} from './subcontrollers/PaymentContract';
import {RewardContract} from './subcontrollers/RewardContract';
import {TradeContract} from './subcontrollers/TradeContract';
import type {AbstractContract} from './subcontrollers/util/AbstractContract';

/**
 * WiredContractController — opens the right contract editor for whatever the server says to edit.
 *
 * **Two round trips per open.** 1479 says *which* contract, this asks for its contents on 1594, and
 * 2976 brings them back — at which point the payload's `contractType` selects one of three editors,
 * each built lazily and reused.
 *
 * The pending id is a **one-shot latch**: `onContractContents` ignores any payload whose id is not
 * the one just asked for, then clears it. A contents push nobody requested is dropped.
 *
 * Unlike its siblings this is a plain object, not a DI `Component` — AS3 constructs it with only
 * `roomEvents` and reaches communication through that.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/contracts/WiredContractController.as
 */
export class WiredContractController implements IWiredContractController
{
    /**
	 * "No cached position". AS3 uses `int.MAX_VALUE` as the sentinel rather than a nullable, and
	 * both axes are tested together.
	 */
    // AS3: WiredContractController.as::_xCache / _yCache initial value (name derived)
    private static readonly NO_CACHED_LOCATION: number = 2147483647;

    // AS3: WiredContractController.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredContractController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: WiredContractController.as::_SafeStr_4640 (name derived: the preset manager)
    private _presetManager: PresetManager | null;

    // AS3: WiredContractController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: WiredContractController.as::_SafeStr_7220 (name derived: the contract being opened)
    private _pendingContractId: number = -1;

    // AS3: WiredContractController.as::_SafeStr_5388 (name derived: the element editor)
    private _addEditContractElement: AddEditContractElement | null = null;

    // AS3: WiredContractController.as::_SafeStr_5445 (name derived: the payment editor)
    private _paymentContract: PaymentContract | null = null;

    // AS3: WiredContractController.as::_SafeStr_5367 (name derived: the reward editor)
    private _rewardContract: RewardContract | null = null;

    // AS3: WiredContractController.as::_SafeStr_5446 (name derived: the trade editor)
    private _tradeContract: TradeContract | null = null;

    // AS3: WiredContractController.as::_xCache
    private _xCache: number = WiredContractController.NO_CACHED_LOCATION;

    // AS3: WiredContractController.as::_yCache
    private _yCache: number = WiredContractController.NO_CACHED_LOCATION;

    // AS3: WiredContractController.as::WiredContractController()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
        this._presetManager = new UbuntuPresetManager(roomEvents);

        this._messageEvents = [
            new WiredOpenContractMessageEvent((event) => this.onOpenContract(event)),
            new WiredContractContentsMessageEvent((event) => this.onContractContents(event)),
            new WiredContractUpdateResultMessageEvent((event) => this.onContractUpdateResult(event)),
        ];

        for(const messageEvent of this._messageEvents)
        {
            this.addMessageEvent(messageEvent);
        }
    }

    // AS3: WiredContractController.as::onOpenContract()
    private onOpenContract(event: IMessageEvent): void
    {
        const parser = event.parser as WiredOpenContractMessageParser;

        this._pendingContractId = parser.contractId;
        this.communicationManager?.connection?.send(new RequestWiredContractContentsComposer(this._pendingContractId));
    }

    /**
	 * The editors are created on first use and kept — reopening a contract of the same type reuses
	 * the window rather than rebuilding it, which is what makes the cached location worth having.
	 */
    // AS3: WiredContractController.as::onContractContents()
    private onContractContents(event: IMessageEvent): void
    {
        const parser = event.parser as WiredContractContentsMessageParser;

        if(parser.contractId !== this._pendingContractId) return;

        this._pendingContractId = -1;
        this.closeAllOpenFrames();

        let shown: IContract | null = null;

        if(parser.contractType === 0)
        {
            this._paymentContract ??= new PaymentContract(this, this._presetManager!);
            this._paymentContract.show(parser);
            shown = this._paymentContract;
        }
        else if(parser.contractType === 1)
        {
            this._tradeContract ??= new TradeContract(this, this._presetManager!);
            this._tradeContract.show(parser);
            shown = this._tradeContract;
        }
        else if(parser.contractType === 2)
        {
            this._rewardContract ??= new RewardContract(this, this._presetManager!);
            this._rewardContract.show(parser);
            shown = this._rewardContract;
        }

        // Restore where the player last left a contract window, if there is one. AS3 sets y before
        // x; both axes are only valid together, so one sentinel disables both.
        if(shown !== null
            && this._yCache !== WiredContractController.NO_CACHED_LOCATION
            && this._xCache !== WiredContractController.NO_CACHED_LOCATION)
        {
            const window = shown.window;

            if(window)
            {
                window.y = this._yCache;
                window.x = this._xCache;
            }
        }
    }

    /**
	 * Validation runs here as well as inside the editor: `AbstractContract.onSaveClicked()` routes
	 * through this, so this is the single gate before anything reaches the wire.
	 */
    // AS3: WiredContractController.as::saveContract()
    saveContract(contract: AbstractContract): void
    {
        const error = contract.validate();

        if(error !== null)
        {
            this._roomEvents.windowManager?.alert('${wiredfurni.error.title}', error, 0, null);

            return;
        }

        const contents: unknown[] = [];

        contract.addContentsToComposer(contents);
        this.communicationManager?.connection?.send(new SaveWiredContractComposer(contents));
    }

    /**
	 * Success closes everything; failure keeps the editor open and reports. The failure key is built
	 * from the server's code, and AS3 passes it as its own fallback so an unknown code shows the key
	 * rather than an empty dialog.
	 */
    // AS3: WiredContractController.as::onContractUpdateResult()
    private onContractUpdateResult(event: IMessageEvent): void
    {
        const parser = event.parser as WiredContractUpdateResultMessageParser;

        if(parser.isSuccess)
        {
            this.closeAllOpenFrames();

            return;
        }

        const key = `wiredcontracts.error.${parser.failCode}`;

        this._roomEvents.windowManager?.alert(
            '${wiredfurni.error.title}',
            this._roomEvents.localization?.getLocalizationWithParams(key, key) ?? key,
            0,
            null
        );
    }

    // AS3: WiredContractController.as::clear()
    clear(): void
    {
        this.closeAllOpenFrames();

        this._xCache = WiredContractController.NO_CACHED_LOCATION;
        this._yCache = WiredContractController.NO_CACHED_LOCATION;

        this._addEditContractElement?.forgetLocation();
    }

    /**
	 * The element editor always closes; the three contract editors are an `else if` chain in AS3, so
	 * only the first one found showing is hidden. Only one can be open at a time — `onContractContents`
	 * closes everything before showing the next — so the chain is equivalent to closing all three.
	 * Transcribed as written.
	 */
    // AS3: WiredContractController.as::closeAllOpenFrames()
    closeAllOpenFrames(): void
    {
        this._addEditContractElement?.hide();

        if(this._paymentContract?.isShowing())
        {
            this._paymentContract.hide();
        }
        else if(this._rewardContract?.isShowing())
        {
            this._rewardContract.hide();
        }
        else if(this._tradeContract?.isShowing())
        {
            this._tradeContract.hide();
        }
    }

    // AS3: WiredContractController.as::cacheWindowLocation()
    cacheWindowLocation(window: IWindow): void
    {
        this._yCache = window.y;
        this._xCache = window.x;
    }

    /**
	 * Built on first access, not in the constructor — every contract editor asks for it while being
	 * constructed, to take its `onEdit`/`onAdd` callbacks.
	 */
    // AS3: WiredContractController.as::get addEditContractElement()
    get addEditContractElement(): AddEditContractElement | null
    {
        if(this._addEditContractElement === null && this._presetManager !== null)
        {
            this._addEditContractElement = new AddEditContractElement(this, this._presetManager);
        }

        return this._addEditContractElement;
    }

    // AS3: WiredContractController.as::get communicationManager()
    get communicationManager(): IHabboCommunicationManager | null
    {
        return this._roomEvents?.communication ?? null;
    }

    // AS3: WiredContractController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        this.communicationManager?.addHabboConnectionMessageEvent(event);
    }

    // AS3: WiredContractController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        this.communicationManager?.removeHabboConnectionMessageEvent(event);
    }

    // AS3: WiredContractController.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: WiredContractController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredContractController.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._addEditContractElement?.dispose();
        this._addEditContractElement = null;
        this._tradeContract?.dispose();
        this._tradeContract = null;
        this._rewardContract?.dispose();
        this._rewardContract = null;
        this._paymentContract?.dispose();
        this._paymentContract = null;

        for(const messageEvent of this._messageEvents)
        {
            this.removeMessageEvent(messageEvent);
        }

        this._messageEvents = [];
        this._presetManager = null;
        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        this._disposed = true;
    }
}
