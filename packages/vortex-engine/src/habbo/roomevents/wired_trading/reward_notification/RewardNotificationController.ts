import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import {OrderedMap} from '@core/utils/OrderedMap';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {
    WiredTransactionSuccessMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionSuccessMessageEvent';
import type {
    WiredTransactionSuccessMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/WiredTransactionSuccessMessageParser';
import type {
    WiredTransactionSuccessContents
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionSuccessContents';

import type {HabboUserDefinedRoomEvents} from '../../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../../wired_setup/uibuilder/PresetManager';
import {UbuntuPresetManager} from '../UbuntuPresetManager';
import type {IRewardNotification} from './IRewardNotification';
import {RewardNotificationView} from './RewardNotificationView';

/**
 * RewardNotificationController — owns the "you won this" windows raised by completed wired
 * transactions.
 *
 * **Arriving and opening are separate.** Every payload with a reward is stored, keyed by the
 * client-side `internalId` its parser assigned; only `openByDefault` pops a window immediately. The
 * rest wait for a `wiredrewards/open/<id>` link, which is why the map outlives the views.
 *
 * Several notifications can be open at once, cascaded 25px apart and capped at
 * {@link MAX_OPEN_REWARD_NOTIFICATIONS} — past that the oldest is closed to make room.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/reward_notification/RewardNotificationController.as
 */
export class RewardNotificationController extends Component implements ILinkEventTracker, IRewardNotification
{
    // AS3: RewardNotificationController.as::MAX_OPEN_REWARD_NOTIFICATIONS
    private static readonly MAX_OPEN_REWARD_NOTIFICATIONS: number = 10;

    /**
	 * The cascade step. AS3 inlines the literal 25 and, separately, the literal 10 where
	 * `MAX_OPEN_REWARD_NOTIFICATIONS` would do — the constant exists but the code does not use it.
	 */
    // AS3: RewardNotificationController.as::openRewardView() — inline literal (name derived)
    private static readonly CASCADE_STEP: number = 25;

    // AS3: RewardNotificationController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: RewardNotificationController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: RewardNotificationController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: RewardNotificationController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: RewardNotificationController.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: RewardNotificationController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: RewardNotificationController.as::_SafeStr_6996 (name derived: internalId -> payload)
    private _contentsById: OrderedMap<number, WiredTransactionSuccessContents> = new OrderedMap<number, WiredTransactionSuccessContents>();

    // AS3: RewardNotificationController.as::_SafeStr_4962 (name derived: the open windows)
    private _openViews: RewardNotificationView[] = [];

    // AS3: RewardNotificationController.as::_SafeStr_4640 (name derived: the preset manager)
    private _presetManager: PresetManager | null;

    // AS3: RewardNotificationController.as::_SafeStr_5769 (name derived: disposed)
    private _controllerDisposed: boolean = false;

    // AS3: RewardNotificationController.as::RewardNotificationController()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);

        this._roomEvents = roomEvents;
        this._messageEvents = [new WiredTransactionSuccessMessageEvent((event) => this.onTransactionSuccess(event))];
        this._presetManager = new UbuntuPresetManager(roomEvents);

        // AS3 registers the events here; this port defers to initComponent(), where the
        // communication manager is resolved — the same deviation the sibling controllers make.
    }

    // AS3: RewardNotificationController.as::get dependencies()
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
        ];
    }

    // AS3: RewardNotificationController.as::initComponent()
    protected override initComponent(): void
    {
        this.context.addLinkEventTracker(this);

        for(const messageEvent of this._messageEvents)
        {
            this.addMessageEvent(messageEvent);
        }

        // AS3 wires REE_DISPOSED through the RoomEngine dependency's listener list; RoomEngine emits
        // it on `events`, so subscribe there directly (same as the sibling controllers).
        this._roomEngine?.events.on('REE_DISPOSED', this._onRoomEngineEvent);
    }

    // AS3: RewardNotificationController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'wiredrewards/';
    }

    // AS3: RewardNotificationController.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2) return;

        if(parts[1] === 'open')
        {
            if(parts.length < 3) return;

            this.openRewardView(parseInt(parts[2], 10));
        }
    }

    /**
	 * A transaction with no reward block is dropped entirely — not stored, not shown.
	 */
    // AS3: RewardNotificationController.as::onTransactionSuccess()
    private onTransactionSuccess(event: IMessageEvent): void
    {
        const contents = (event.parser as WiredTransactionSuccessMessageParser).contents;

        if(contents === null || contents.rewardContents === null) return;

        this._contentsById.add(contents.internalId, contents);

        if(contents.openByDefault) this.openRewardView(contents.internalId);
    }

    /**
	 * Open, or re-focus if already open.
	 *
	 * The cascade: each window takes the next slot after the last one opened, modulo 10, and slots
	 * alternate down-right / up-left in 25px steps so a burst of rewards fans out instead of
	 * stacking. Slot 0 sits dead centre.
	 */
    // AS3: RewardNotificationController.as::openRewardView()
    openRewardView(internalId: number): void
    {
        if(this._controllerDisposed) return;

        for(const view of this._openViews)
        {
            if(view.contents !== null && view.contents.internalId === internalId)
            {
                view.window?.activate();

                return;
            }
        }

        while(this._openViews.length >= RewardNotificationController.MAX_OPEN_REWARD_NOTIFICATIONS)
        {
            this.closeRewardView(this._openViews[0]);
        }

        const contents = this._contentsById.getValue(internalId);

        if(!contents || this._presetManager === null) return;

        const view = new RewardNotificationView(this, this._presetManager);

        let offsetX = 0;
        let offsetY = 0;
        let slot = 0;

        if(this._openViews.length > 0)
        {
            slot = (this._openViews[this._openViews.length - 1].viewIndex + 1)
                % RewardNotificationController.MAX_OPEN_REWARD_NOTIFICATIONS;
        }

        if(slot > 0)
        {
            // AS3's `(slot + 1) / 2` is integer division; the pair (1,2) both land on step 1, (3,4)
            // on step 2, and so on, with the even member of each pair going the other way.
            const step = Math.floor((slot + 1) / 2);
            const distance = RewardNotificationController.CASCADE_STEP * step;

            offsetX = (slot + 1) % 2 === 0 ? distance : -distance;
            offsetY = offsetX;
        }

        view.show(contents, offsetX, offsetY, slot);
        this._openViews.push(view);
    }

    /**
	 * Called both by the caller closing a window and, re-entrantly, by the view's own `hideFrame()`.
	 * Removing before disposing is what stops that from looping.
	 */
    // AS3: RewardNotificationController.as::closeRewardView()
    closeRewardView(view: RewardNotificationView): void
    {
        const index = this._openViews.indexOf(view);

        if(index !== -1) this._openViews.splice(index, 1);

        view.dispose();
    }

    /**
	 * The room went away: every open reward goes with it. AS3 swaps the list out *before* disposing,
	 * because each dispose re-enters `closeRewardView()` and would otherwise mutate the list being
	 * iterated.
	 */
    // AS3: RewardNotificationController.as::roomEventHandler()
    private _onRoomEngineEvent = (event: unknown): void =>
    {
        if(this._roomEngine === null) return;

        if((event as { type: string }).type === 'REE_DISPOSED')
        {
            const views = this._openViews;

            this._openViews = [];

            for(const view of views)
            {
                view.dispose();
            }
        }
    };

    // AS3: RewardNotificationController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.addHabboConnectionMessageEvent(event);
    }

    // AS3: RewardNotificationController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager == null)
        {
            return;
        }

        this._communicationManager.removeHabboConnectionMessageEvent(event);
    }

    // AS3: RewardNotificationController.as::get communicationManager()
    get communicationManager(): IHabboCommunicationManager | null
    {
        return this._communicationManager;
    }

    // AS3: RewardNotificationController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: RewardNotificationController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: RewardNotificationController.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this._roomEngine;
    }

    // AS3: RewardNotificationController.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: RewardNotificationController.as::get disposed()
    override get disposed(): boolean
    {
        return this._controllerDisposed;
    }

    // AS3: RewardNotificationController.as::dispose()
    override dispose(): void
    {
        if(this._controllerDisposed)
        {
            return;
        }

        this._controllerDisposed = true;

        this._roomEngine?.events.off('REE_DISPOSED', this._onRoomEngineEvent);

        for(const messageEvent of this._messageEvents)
        {
            this.removeMessageEvent(messageEvent);
        }

        this._messageEvents = [];

        for(const view of this._openViews)
        {
            view.dispose();
        }

        this._openViews = [];
        this._contentsById = new OrderedMap<number, WiredTransactionSuccessContents>();
        this._communicationManager = null;
        this._windowManager = null;
        this._localizationManager = null;
        this._roomEngine = null;
        this._presetManager = null;

        super.dispose();
    }
}
