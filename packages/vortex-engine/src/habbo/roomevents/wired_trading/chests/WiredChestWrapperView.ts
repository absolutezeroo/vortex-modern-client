import {Logger} from '@core/utils/Logger';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IBubbleWindow} from '@core/window/components/IBubbleWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IIconButtonWindow} from '@core/window/components/IIconButtonWindow';
import type {IInteractiveWindow} from '@core/window/components/IInteractiveWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {WindowParam} from '@core/window/enum/WindowParam';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomObject} from '@room/object/IRoomObject';
import {
    RequestWiredChestLogsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/RequestWiredChestLogsComposer';
import {
    StartWiredChestDepositComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/StartWiredChestDepositComposer';
import {
    WithdrawAllWiredChestContentsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/WithdrawAllWiredChestContentsComposer';
import {
    SetWiredChestOptionsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/SetWiredChestOptionsComposer';

import {Util} from '../../Util';
import type {PresetManager} from '../../wired_setup/uibuilder/PresetManager';
import {UbuntuPresetManager} from '../UbuntuPresetManager';
import {TransactionConfig} from '../transactions/overview/TransactionConfig';
import {ChestType} from './ChestType';
import {ChestNotificationSettingsUI} from './settings/ChestNotificationSettingsUI';
import {ChestSettingsUI} from './settings/ChestSettingsUI';
import type {IChestSubController} from './subcontrollers/IChestSubController';
import {WiredChestUpgradeConfirmationView} from './upgrade_confirmation/WiredChestUpgradeConfirmationView';
import type {WiredChestController} from './WiredChestController';

const log = Logger.getLogger('habbo.roomevents.chests.WiredChestWrapperView');

/**
 * The chest window itself — one frame that hosts whichever sub-controller's contents view belongs to
 * the chest being looked at, plus the locking, capacity and permission controls around it.
 *
 * **Three layouts out of one XML.** `updateLayout()` picks between a visitor's view (contents and a
 * donate button, nothing else), an owner's view of a chest without the wired upgrade (no locking
 * row), and the full view. Nothing is built or destroyed for this — every control exists in the
 * layout and the three branches are pure visibility.
 *
 * **Height is computed, not laid out.** The constructor measures the chrome once —
 * {@link _widthPadding} and {@link _heightPadding} — and from then on every change ends with
 * `window.height = mainList.height + padding`. `_ignoreResizeEvents` guards the WE_RESIZED handler
 * while that runs, or the assignment would feed itself.
 *
 * **The lock checkbox asks before it moves.** Both WE_SELECT and WE_UNSELECT cancel the window's own
 * operation and raise a confirmation; only the confirmed callback flips the box, behind
 * `_ignoreCheckboxSelectEvents` so the programmatic flip does not re-ask. A separate flag,
 * `_ignoreCheckboxSelectedEvents`, keeps the *result* (WE_SELECTED) from being sent back to the
 * server while the view is populating itself from a server update.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/WiredChestWrapperView.as
 */
export class WiredChestWrapperView implements IDisposable
{
    // AS3: WiredChestWrapperView.as::LOCKED_KEY
    static readonly LOCKED_KEY: string = 'locked';

    // AS3: WiredChestWrapperView.as::AUTO_LOCK_KEY
    static readonly AUTO_LOCK_KEY: string = 'auto_lock';

    // AS3: WiredChestWrapperView.as::CAPACITY_KEY
    static readonly CAPACITY_KEY: string = 'capacity';

    // AS3: WiredChestWrapperView.as::CONTENTS_COUNT_KEY
    static readonly CONTENTS_COUNT_KEY: string = 'contents_count';

    // AS3: WiredChestWrapperView.as::CAPACITY_LEVEL_KEY
    static readonly CAPACITY_LEVEL_KEY: string = 'capacity_level';

    // AS3: WiredChestWrapperView.as::CHEST_NAME_KEY
    static readonly CHEST_NAME_KEY: string = 'chest_name';

    // AS3: WiredChestWrapperView.as::CHEST_DESC_KEY
    static readonly CHEST_DESC_KEY: string = 'chest_desc';

    // AS3: WiredChestWrapperView.as::EVERYONE_CAN_OPEN_KEY (name derived from its value)
    static readonly EVERYONE_CAN_OPEN_KEY: string = 'everyone_can_open';

    // AS3: WiredChestWrapperView.as::EVERYONE_CAN_DONATE_KEY (name derived from its value)
    static readonly EVERYONE_CAN_DONATE_KEY: string = 'everyone_can_donate';

    // AS3: WiredChestWrapperView.as::STATE_CONTROL_MODE
    static readonly STATE_CONTROL_MODE: string = 'state_control_mode';

    // AS3: WiredChestWrapperView.as::IS_WIRED_ENABLED
    static readonly IS_WIRED_ENABLED: string = 'is_wired_enabled';

    // AS3: WiredChestWrapperView.as::NOTIFY_MODE
    static readonly NOTIFY_MODE: string = 'notify_mode';

    // AS3: WiredChestWrapperView.as::PREVIEW_MODE_KEY
    static readonly PREVIEW_MODE_KEY: string = 'preview_mode';

    // AS3: WiredChestWrapperView.as::PREVIEW_AMOUNT_KEY
    static readonly PREVIEW_AMOUNT_KEY: string = 'preview_amount';

    // AS3: WiredChestWrapperView.as::DESKTOP_WINDOW_LAYER
    static readonly DESKTOP_WINDOW_LAYER: number = 1;

    /**
	 * Furniture. AS3 inlines 10 at all three call sites and never names it.
	 */
    // AS3: WiredChestWrapperView.as::roomObjectRemovedHandler() — inline category (name derived)
    private static readonly CATEGORY_FLOOR: number = 10;

    /**
	 * "No cached size" for the resizable furniture view. AS3 seeds the height with -1 and tests it
	 * alone; the width is only ever read when the height says a size was cached.
	 */
    // AS3: WiredChestWrapperView.as::_SafeStr_8717 initial value (name derived)
    private static readonly NO_CACHED_SIZE: number = -1;

    // AS3: WiredChestWrapperView.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredChestWrapperView.as::_SafeStr_4593 (name derived: the chest controller)
    private _controller: WiredChestController | null;

    // AS3: WiredChestWrapperView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: WiredChestWrapperView.as::_window
    private _window: IFrameWindow | null = null;

    // AS3: WiredChestWrapperView.as::_SafeStr_5180 (name derived: the lock-info bubble)
    private _lockInfoBubble: IBubbleWindow | null = null;

    // AS3: WiredChestWrapperView.as::_SafeStr_5932 (name derived: the paid-upgrade dialog)
    private _upgradeConfirmation: WiredChestUpgradeConfirmationView | null = null;

    // AS3: WiredChestWrapperView.as::_SafeStr_4933 (name derived: the chest on screen)
    private _viewingChestId: number = 0;

    // AS3: WiredChestWrapperView.as::_SafeStr_4984 (name derived: the chest's room object)
    private _viewingChestFurni: IRoomObject | null = null;

    // AS3: WiredChestWrapperView.as::_SafeStr_5323 (name derived: the player owns this chest)
    private _isChestOwner: boolean = false;

    // AS3: WiredChestWrapperView.as::_SafeStr_7421 (name derived: the player owns the room)
    private _isRoomOwner: boolean = false;

    // AS3: WiredChestWrapperView.as::_SafeStr_4709 (name derived: the active sub-controller)
    private _subController: IChestSubController | null = null;

    // AS3: WiredChestWrapperView.as::_maxCapacityCache
    private _maxCapacityCache: number = -1;

    // AS3: WiredChestWrapperView.as::_ignoreCheckboxSelectedEvents
    private _ignoreCheckboxSelectedEvents: boolean = false;

    // AS3: WiredChestWrapperView.as::_ignoreCapacityChangeEvents
    private _ignoreCapacityChangeEvents: boolean = false;

    // AS3: WiredChestWrapperView.as::_ignoreCheckboxSelectEvents
    private _ignoreCheckboxSelectEvents: boolean = false;

    // AS3: WiredChestWrapperView.as::_ignoreResizeEvents
    private _ignoreResizeEvents: boolean = false;

    // AS3: WiredChestWrapperView.as::_lastResizableWidth
    private _lastResizableWidth: number = -1;

    // AS3: WiredChestWrapperView.as::_SafeStr_8717 (name derived: the cached resizable height)
    private _lastResizableHeight: number = WiredChestWrapperView.NO_CACHED_SIZE;

    // AS3: WiredChestWrapperView.as::_SafeStr_8412 (name derived: the frame's horizontal chrome)
    private _widthPadding: number = 0;

    // AS3: WiredChestWrapperView.as::_SafeStr_6895 (name derived: the frame's vertical chrome)
    private _heightPadding: number = 0;

    // AS3: WiredChestWrapperView.as::_chestSettings
    private _chestSettings: ChestSettingsUI | null = null;

    // AS3: WiredChestWrapperView.as::_chestNotificationSettings
    private _chestNotificationSettings: ChestNotificationSettingsUI | null = null;

    // AS3: WiredChestWrapperView.as::_SafeStr_4640 (name derived: the preset manager)
    private _presetManager: PresetManager | null = null;

    /**
	 * AS3 ends the constructor with `show(null, ...)` followed by `hide()`: showing with no
	 * sub-controller only detaches whatever was in the contents slot, and hiding then puts the frame
	 * back in its closed state. The pair exists so the window is never left half-initialised.
	 */
    // AS3: WiredChestWrapperView.as::WiredChestWrapperView()
    constructor(controller: WiredChestController, windowManager: IHabboWindowManager)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        const xml = controller.assets?.getAssetByName('chest_generic_xml')?.content ?? null;

        if(!xml)
        {
            // AS3 dereferences the asset unguarded and would throw; a missing layout is a shipping
            // problem rather than a code one, so it is reported instead.
            log.warn('chest_generic_xml is not in the asset library — the chest window is not built');

            return;
        }

        this._window = windowManager.buildFromXML(xml as string, 1) as IFrameWindow;
        this._window.enableLookupCache();

        // Measure the chrome once, while the layout is still at its authored size.
        this._widthPadding = this._window.width - (this.chestContents?.width ?? 0);
        this._heightPadding = this._window.height
            - (this.chestContents?.height ?? 0)
            - (this.footer?.height ?? 0)
            - (this.header?.height ?? 0);

        this.closeButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.lockInfoButton?.addEventListener('WME_CLICK', this.onInfoButtonClick);
        this.withdrawAllButton?.addEventListener('WME_CLICK', this.onWithdrawAllClick);
        this.startDepositButton?.addEventListener('WME_CLICK', this.onDepositClick);
        this.viewLogsButton?.addEventListener('WME_CLICK', this.onViewLogsClick);
        this.lockChestCheckbox?.addEventListener('WE_SELECT', this.onAttemptLockChest);
        this.lockChestCheckbox?.addEventListener('WE_UNSELECT', this.onAttemptUnlockChest);

        for(const checkbox of [this.lockChestCheckbox, this.autoLockChestCheckbox])
        {
            checkbox?.addEventListener('WE_SELECTED', this.onOptionsChanged);
            checkbox?.addEventListener('WE_UNSELECTED', this.onOptionsChanged);
        }

        this.capacityInput?.addEventListener('WME_CLICK_AWAY', this.onOptionsChanged);
        this.capacityInput?.addEventListener('WKE_KEY_DOWN', this.onCapacityKeyDown);
        this.capacityInput?.addEventListener('WE_CHANGE', this.onCapacityChange);
        this.maxCapacityUpgradeButton?.addEventListener('WME_CLICK', this.onUpgradeCapacityClick);
        this.settingsButton?.addEventListener('WME_CLICK', this.onClickSettings);
        this.notificationSettingsButton?.addEventListener('WME_CLICK', this.onClickNotificationSettings);

        // The bubble lives on the desktop, not inside the frame, so it can overhang the window edge.
        this._lockInfoBubble = (this._window.findChildByName('lock_info_bubble') as IBubbleWindow | null) ?? null;

        if(this._lockInfoBubble)
        {
            (this._window.desktop as IWindowContainer | null)?.addChild(this._lockInfoBubble as unknown as IWindow);
            this._lockInfoBubble.visible = false;
            (this._lockInfoBubble as unknown as IWindow).addEventListener('WE_DEACTIVATED', this.onLockInfoBubbleDeactivates);
        }

        this._window.addEventListener('WE_RESIZED', this.onResizeWindow);

        this.show(null, null, 0, false, false);
        this.hide();
    }

    /**
	 * Park a bubble immediately to the right of the control it explains and give it focus — losing
	 * that focus is what closes it again.
	 */
    // AS3: WiredChestWrapperView.as::relocateBubbleFocus()
    static relocateBubbleFocus(bubble: IBubbleWindow, anchor: IWindow): void
    {
        const rectangle = {x: 0, y: 0, width: 0, height: 0};

        anchor.getGlobalRectangle(rectangle);

        const window = bubble as unknown as IWindow;

        window.position = {
            x: rectangle.x + rectangle.width + 3,
            y: rectangle.y + 1 + rectangle.height / 2 - window.height / 2,
        };

        window.activate();
    }

    // AS3: WiredChestWrapperView.as::onResizeWindow()
    private onResizeWindow = (): void =>
    {
        if(this._ignoreResizeEvents || !this._window) return;

        const contents = this.chestContents;

        if(contents)
        {
            contents.height = this._window.height
                - this._heightPadding
                - (this.footer?.height ?? 0)
                - (this.header?.height ?? 0);
        }
    };

    // AS3: WiredChestWrapperView.as::onClickSettings()
    private onClickSettings = (): void =>
    {
        const settings = this.getStuffDataMap();

        if(settings === null || this._viewingChestId === 0 || this._subController === null) return;

        this.chestSettingsUI?.onEdit(
            this._viewingChestId,
            this._subController.type,
            this._viewingChestFurni?.getModel()?.getNumber('furniture_type_id') ?? 0,
            this.isStarterChest,
            settings
        );
    };

    // AS3: WiredChestWrapperView.as::onClickNotificationSettings()
    private onClickNotificationSettings = (): void =>
    {
        const settings = this.getStuffDataMap();

        if(settings === null || this._viewingChestId === 0 || this._subController === null) return;

        this.chestNotificationSettingsUI?.onEdit(this._viewingChestId, this._subController.type, settings);
    };

    /**
	 * A starter chest is identified by a **substring of its class name**, configured server-side —
	 * there is no flag on the item. An empty config disables the test entirely, which is why the
	 * emptiness check comes before the `indexOf`.
	 */
    // AS3: WiredChestWrapperView.as::get isStarterChest()
    private get isStarterChest(): boolean
    {
        const itemType = this._viewingChestFurni?.getModel()?.getNumber('furniture_type_id') ?? 0;
        const furnitureData = this._controller?.sessionDataManager?.getFloorItemData(itemType) ?? null;

        if(furnitureData === null)
        {
            return false;
        }

        const infix = this._controller?.getProperty('wired.chests_starter_infix') ?? '';

        return infix !== '' && furnitureData.className.indexOf(infix) !== -1;
    }

    // AS3: WiredChestWrapperView.as::onUpgradeCapacityClick()
    private onUpgradeCapacityClick = (): void =>
    {
        if(this._viewingChestId === 0 || this._viewingChestFurni === null || this._controller === null) return;

        this._upgradeConfirmation ??= new WiredChestUpgradeConfirmationView(this._controller);

        this._upgradeConfirmation.initialize(
            this._viewingChestId,
            this._subController?.type ?? 0,
            this._viewingChestFurni.getModel()?.getNumber('furniture_type_id') ?? 0,
            this.currentCapacityLevel
        );

        this._upgradeConfirmation.show();
    };

    // AS3: WiredChestWrapperView.as::get viewingChestFurni()
    get viewingChestFurni(): IRoomObject | null
    {
        return this._viewingChestFurni;
    }

    // AS3: WiredChestWrapperView.as::onViewLogsClick()
    private onViewLogsClick = (): void =>
    {
        this._controller?.send(new RequestWiredChestLogsComposer(this._viewingChestId, TransactionConfig.PAGE_SIZE, 1));
    };

    // AS3: WiredChestWrapperView.as::onDepositClick()
    private onDepositClick = (): void =>
    {
        this._controller?.send(new StartWiredChestDepositComposer(this._viewingChestId));
    };

    // AS3: WiredChestWrapperView.as::onWithdrawAllClick()
    private onWithdrawAllClick = (): void =>
    {
        this._controller?.roomEvents?.windowManager?.confirm(
            '${wiredchests.withdraw_all.confirm.title}',
            '${wiredchests.withdraw_all.confirm.desc}',
            0,
            (dialog, event) => this.onWithdrawAllConfirmed(dialog, event)
        );
    };

    // AS3: WiredChestWrapperView.as::onWithdrawAllConfirmed()
    private onWithdrawAllConfirmed(dialog: IDisposable, event: WindowEvent): void
    {
        dialog.dispose();

        if(event.type === 'WE_OK')
        {
            this._controller?.send(new WithdrawAllWiredChestContentsComposer(this._viewingChestId));
        }
    }

    // AS3: WiredChestWrapperView.as::onLockInfoBubbleDeactivates()
    private onLockInfoBubbleDeactivates = (): void =>
    {
        if(this._lockInfoBubble) this._lockInfoBubble.visible = false;
    };

    // AS3: WiredChestWrapperView.as::onInfoButtonClick()
    private onInfoButtonClick = (): void =>
    {
        if(this._lockInfoBubble) this._lockInfoBubble.visible = true;

        this.relocateBubbleAndFocus();
    };

    // AS3: WiredChestWrapperView.as::relocateBubbleAndFocus()
    private relocateBubbleAndFocus(): void
    {
        const anchor = this.lockInfoButton;

        if(this._lockInfoBubble && anchor)
        {
            WiredChestWrapperView.relocateBubbleFocus(this._lockInfoBubble, anchor as unknown as IWindow);
        }
    }

    // AS3: WiredChestWrapperView.as::onWindowClose()
    private onWindowClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.hide();
    };

    // AS3: WiredChestWrapperView.as::isShowing()
    isShowing(): boolean
    {
        return this._window !== null && (this._window as unknown as IWindow).parent != null;
    }

    // AS3: WiredChestWrapperView.as::get viewingChestId()
    get viewingChestId(): number
    {
        return this._viewingChestId;
    }

    /**
	 * Swapping chests mid-flight: the outgoing sub-controller is cleared, and if it was the resizable
	 * one its size is remembered so the next furniture chest opens at the size the player left. The
	 * two settings windows are closed because they are about the chest that just went away.
	 */
    // AS3: WiredChestWrapperView.as::show()
    show(
        subController: IChestSubController | null,
        chestFurni: IRoomObject | null,
        chestId: number,
        isChestOwner: boolean,
        isRoomOwner: boolean
    ): void
    {
        this._viewingChestFurni = chestFurni;
        this._viewingChestId = chestId;
        this._isChestOwner = isChestOwner;
        this._isRoomOwner = isRoomOwner;

        if(this._subController !== null && this._subController !== subController)
        {
            this._subController.clear();

            if(this._subController.allowResizing)
            {
                this._lastResizableWidth = this.chestContents?.width ?? -1;
                this._lastResizableHeight = this.chestContents?.height ?? WiredChestWrapperView.NO_CACHED_SIZE;
            }

            if(this._chestSettings?.isShowing()) this._chestSettings.hide();

            if(this._chestNotificationSettings?.isShowing()) this._chestNotificationSettings.hide();
        }

        this._subController = subController;

        if(this._window !== null && (this._window as unknown as IWindow).parent == null)
        {
            const desktop = this._windowManager?.getDesktop(WiredChestWrapperView.DESKTOP_WINDOW_LAYER) ?? null;

            if(desktop !== null) (desktop as IWindowContainer).addChild(this._window as unknown as IWindow);
        }

        if(subController !== null)
        {
            this.resetChestCaches();
            this.setSubController(subController);
            this.updateLayout();
            this.updateUIOptions();
            this.updateUI();

            if(this._lockInfoBubble) this._lockInfoBubble.visible = false;

            (this._window as unknown as IWindow | null)?.activate();
        }
        else
        {
            this.setSubController(null);
        }
    }

    // AS3: WiredChestWrapperView.as::resetChestCaches()
    private resetChestCaches(): void
    {
        this._maxCapacityCache = -1;
    }

    /**
	 * The chest's stuff data changed under us. Losing read access while looking closes the window,
	 * unless the chest is open to everyone.
	 */
    // AS3: WiredChestWrapperView.as::viewingChestUpdated()
    viewingChestUpdated(): void
    {
        this.resetChestCaches();

        if(this.isShowing() && !this.canRead && !this.isVisibleForEveryone)
        {
            this.hide();
        }
        else
        {
            this.updateLayout();
            this.updateUIOptions();
            this.updateUI();
        }
    }

    // AS3: WiredChestWrapperView.as::get currentCapacityLevel()
    private get currentCapacityLevel(): number
    {
        const settings = this.getStuffDataMap();

        if(settings === null)
        {
            return 0;
        }

        return parseInt(settings.get(WiredChestWrapperView.CAPACITY_LEVEL_KEY) ?? '', 10) || 0;
    }

    /**
	 * Cached because `updateUI()` reads it on every server update and it is four config lookups deep.
	 * A starter chest has a flat cap and no upgrades; every other chest is `initial + upgrade x level`.
	 */
    // AS3: WiredChestWrapperView.as::get maxCapacity()
    private get maxCapacity(): number
    {
        if(this._maxCapacityCache !== -1)
        {
            return this._maxCapacityCache;
        }

        const kind = this._subController !== null && this._subController.type === ChestType.TYPE_COIN ? 'coins' : 'furni';

        if(this.isStarterChest)
        {
            this._maxCapacityCache = this._controller?.getInteger(`wired.${kind}_chest.starter_capacity`, 0) ?? 0;

            return this._maxCapacityCache;
        }

        const initial = this._controller?.getInteger(`wired.${kind}_chest.initial_capacity`, 0) ?? 0;
        const perUpgrade = this._controller?.getInteger(`wired.${kind}_chest.upgrade_capacity`, 0) ?? 0;

        this._maxCapacityCache = initial + perUpgrade * this.currentCapacityLevel;

        return this._maxCapacityCache;
    }

    /**
	 * Every setting on this screen lives in the furniture's own stuff data, so the room object is the
	 * source of truth and there is no client-side copy to go stale.
	 */
    // AS3: WiredChestWrapperView.as::getStuffDataMap()
    private getStuffDataMap(): Map<string, string> | null
    {
        const model = this._viewingChestFurni?.getModel() ?? null;

        if(model === null)
        {
            return null;
        }

        return model.getStringToStringMap('furniture_data');
    }

    /**
	 * Closing tells the server, through `setClosedStatus()` — a chest left open holds server state.
	 */
    // AS3: WiredChestWrapperView.as::hide()
    hide(): void
    {
        if(this.isShowing())
        {
            const desktop = this._windowManager?.getDesktop(WiredChestWrapperView.DESKTOP_WINDOW_LAYER) ?? null;

            if(desktop !== null) (desktop as IWindowContainer).removeChild(this._window as unknown as IWindow);

            if(this._lockInfoBubble) this._lockInfoBubble.visible = false;
        }

        this.setSubController(null);
        this._controller?.setClosedStatus();
        this._viewingChestId = 0;
        this._viewingChestFurni = null;

        if(this._subController !== null)
        {
            this._subController.clear();
            this._subController = null;
        }

        this.resetChestCaches();

        if(this._chestSettings?.isShowing()) this._chestSettings.hide();

        if(this._chestNotificationSettings?.isShowing()) this._chestNotificationSettings.hide();
    }

    // AS3: WiredChestWrapperView.as::get isVisibleForEveryone()
    get isVisibleForEveryone(): boolean
    {
        const settings = this.getStuffDataMap();

        return settings !== null && settings.get(WiredChestWrapperView.EVERYONE_CAN_OPEN_KEY) === '1';
    }

    /**
	 * The three layouts. Note the visitor branch turns off `itemCountText` and turns on
	 * `itemCountTextBottom` — the same count, moved under the contents where the controls used to be.
	 */
    // AS3: WiredChestWrapperView.as::updateLayout()
    updateLayout(): void
    {
        if(this._subController === null || this._viewingChestFurni === null || this._window === null) return;

        const settings = this.getStuffDataMap();

        if(settings === null) return;

        const wiredEnabled = settings.get(WiredChestWrapperView.IS_WIRED_ENABLED) === '1';

        this._ignoreResizeEvents = true;

        const settingsButton = this.settingsButton;
        const notificationSettingsButton = this.notificationSettingsButton;
        const lockingOptions = this.lockingOptions;
        const capacityOptions = this.capacityOptions;
        const capacityOverrideContainer = this.capacityOverrideContainer;
        const upgradeCapacityContainer = this.upgradeCapacityContainer;
        const itemCountText = this.itemCountText;
        const itemCountTextBottom = this.itemCountTextBottom;
        const lockInfoButton = this.lockInfoButton;
        const viewLogsButton = this.viewLogsButton;
        const withdrawAllButton = this.withdrawAllButton;
        const startDepositButton = this.startDepositButton;

        if(!this.canRead)
        {
            if(settingsButton) settingsButton.visible = false;
            if(notificationSettingsButton) notificationSettingsButton.visible = false;
            if(lockingOptions) lockingOptions.visible = false;
            if(capacityOptions) capacityOptions.visible = false;
            if(upgradeCapacityContainer) upgradeCapacityContainer.visible = false;
            if(itemCountText) itemCountText.visible = false;
            if(itemCountTextBottom) itemCountTextBottom.visible = true;
            if(lockInfoButton) lockInfoButton.visible = false;
            if(viewLogsButton) viewLogsButton.visible = false;
            if(withdrawAllButton) withdrawAllButton.visible = false;
            if(startDepositButton) startDepositButton.caption = '${wiredchests.donate}';
        }
        else if(!wiredEnabled)
        {
            if(settingsButton) settingsButton.visible = true;
            if(notificationSettingsButton) notificationSettingsButton.visible = true;
            if(lockingOptions) lockingOptions.visible = false;
            if(capacityOptions) capacityOptions.visible = true;
            if(capacityOverrideContainer) capacityOverrideContainer.visible = false;
            if(upgradeCapacityContainer) upgradeCapacityContainer.visible = true;
            if(itemCountText) itemCountText.visible = true;
            if(itemCountTextBottom) itemCountTextBottom.visible = false;
            if(lockInfoButton) lockInfoButton.visible = false;
            if(viewLogsButton) viewLogsButton.visible = true;
            if(withdrawAllButton) withdrawAllButton.visible = true;
            if(startDepositButton) startDepositButton.caption = '${wiredchests.start_deposit}';
        }
        else
        {
            if(settingsButton) settingsButton.visible = true;
            if(notificationSettingsButton) notificationSettingsButton.visible = true;
            if(lockingOptions) lockingOptions.visible = true;
            if(capacityOptions) capacityOptions.visible = true;
            if(capacityOverrideContainer) capacityOverrideContainer.visible = true;
            if(upgradeCapacityContainer) upgradeCapacityContainer.visible = true;
            if(itemCountText) itemCountText.visible = false;
            if(itemCountTextBottom) itemCountTextBottom.visible = false;
            if(lockInfoButton) lockInfoButton.visible = true;
            if(viewLogsButton) viewLogsButton.visible = true;
            if(withdrawAllButton) withdrawAllButton.visible = true;
            if(startDepositButton) startDepositButton.caption = '${wiredchests.start_deposit}';
        }

        this._window.height = (this.mainList?.height ?? 0) + this._heightPadding;
        this._ignoreResizeEvents = false;
    }

    /**
	 * Both lock flags read `!= "0"`, not `== "1"` — an absent key means locked, which is the safe
	 * default for a chest whose settings never reached the client.
	 */
    // AS3: WiredChestWrapperView.as::updateUIOptions()
    updateUIOptions(): void
    {
        this._ignoreCheckboxSelectedEvents = true;
        this._ignoreCapacityChangeEvents = true;

        const settings = this.getStuffDataMap();

        if(settings === null)
        {
            this._ignoreCheckboxSelectedEvents = false;
            this._ignoreCapacityChangeEvents = false;

            return;
        }

        const lockChestCheckbox = this.lockChestCheckbox;
        const autoLockChestCheckbox = this.autoLockChestCheckbox;
        const capacityInput = this.capacityInput;

        if(lockChestCheckbox) Util.select(lockChestCheckbox, settings.get(WiredChestWrapperView.LOCKED_KEY) !== '0');
        if(autoLockChestCheckbox) Util.select(autoLockChestCheckbox, settings.get(WiredChestWrapperView.AUTO_LOCK_KEY) !== '0');
        if(capacityInput) capacityInput.text = settings.get(WiredChestWrapperView.CAPACITY_KEY) ?? '';

        this._ignoreCheckboxSelectedEvents = false;
        this._ignoreCapacityChangeEvents = false;

        const maxCapacityText = this.maxCapacityText;

        if(maxCapacityText)
        {
            maxCapacityText.text = this._controller?.localization?.getLocalizationWithParams(
                'wiredchests.max_capacity', '', 'max_capacity', String(this.maxCapacity)
            ) ?? '';
        }
    }

    /**
	 * Every enablement rule in one place. The two worth reading twice:
	 *
	 * - the **lock checkbox** is enabled for a non-owner only while it is *unlocked* and they own the
	 *   room — a room owner may lock someone else's chest, but not unlock it again;
	 * - **depositing** is open to anyone when the chest allows donations, and otherwise needs edit
	 *   rights *and* an unlocked chest.
	 *
	 * The upgrade button's disabled reason is a tooltip on the region around it rather than on the
	 * button, because a disabled button swallows the hover.
	 */
    // AS3: WiredChestWrapperView.as::updateUI()
    updateUI(): void
    {
        if(this._subController === null || this._viewingChestFurni === null || this._window === null) return;

        const settings = this.getStuffDataMap();

        if(settings === null) return;

        this._ignoreResizeEvents = true;

        const everyoneCanDonate = settings.get(WiredChestWrapperView.EVERYONE_CAN_DONATE_KEY) === '1';
        const chestName = settings.get(WiredChestWrapperView.CHEST_NAME_KEY) ?? null;

        let chestDescription = settings.get(WiredChestWrapperView.CHEST_DESC_KEY) ?? null;

        if(chestDescription === null || chestDescription === '')
        {
            chestDescription = '${wiredchests.description_placeholder}';
        }

        const capacity = parseInt(settings.get(WiredChestWrapperView.CAPACITY_KEY) ?? '', 10) || 0;
        const localization = this._controller?.localization ?? null;

        const itemCountText = this.itemCountText;
        const itemCountTextBottom = this.itemCountTextBottom;

        if(itemCountText)
        {
            itemCountText.caption = localization?.getLocalizationWithParams(
                'wiredchests.space_used2', '', 'count', String(this._subController.itemCount), 'total', String(capacity)
            ) ?? '';
        }

        if(itemCountTextBottom)
        {
            itemCountTextBottom.caption = localization?.getLocalizationWithParams(
                'wiredchests.space_used', '', 'count', String(this._subController.itemCount), 'total', String(capacity)
            ) ?? '';
        }

        this._window.caption = chestName !== null && chestName.length > 0 ? chestName : this._subController.title;

        const description = this.description;

        if(description) description.text = chestDescription;

        const lockChestCheckbox = this.lockChestCheckbox;
        const autoLockChestCheckbox = this.autoLockChestCheckbox;
        const capacityInputBorder = this.capacityInputBorder;
        const withdrawAllButton = this.withdrawAllButton;
        const startDepositButton = this.startDepositButton;
        const viewLogsButton = this.viewLogsButton;
        const settingsButton = this.settingsButton;
        const notificationSettingsButton = this.notificationSettingsButton;
        const isLocked = lockChestCheckbox?.isSelected ?? false;

        if(lockChestCheckbox)
        {
            Util.disableSection(lockChestCheckbox, !this._isChestOwner && (!this._isRoomOwner || isLocked));
        }

        if(autoLockChestCheckbox) Util.disableSection(autoLockChestCheckbox, !this._isChestOwner);
        if(capacityInputBorder) Util.disableSection(capacityInputBorder, !this._isChestOwner);
        if(withdrawAllButton) Util.disableSection(withdrawAllButton, !this.canWithdraw);

        if(startDepositButton)
        {
            Util.disableSection(
                startDepositButton,
                !everyoneCanDonate && (!this.canEdit || (isLocked && !this._isChestOwner))
            );
        }

        if(viewLogsButton) Util.disableSection(viewLogsButton, !this.canRead);
        if(settingsButton) Util.disableSection(settingsButton, !this._isChestOwner);
        if(notificationSettingsButton) Util.disableSection(notificationSettingsButton, !this._isChestOwner);

        const upgradeButton = this.maxCapacityUpgradeButton;
        const upgradeRegion = this.upgradeCapacityRegion;

        if(this.isStarterChest)
        {
            if(upgradeButton) Util.disableSection(upgradeButton, true);
            if(upgradeRegion) upgradeRegion.toolTipCaption = '${wiredchests.upgrade.result.error.10}';
        }
        else if(!this._isChestOwner)
        {
            if(upgradeButton) Util.disableSection(upgradeButton, true);
            if(upgradeRegion) upgradeRegion.toolTipCaption = '${wiredchests.upgrade.error.reason.not_owner}';
        }
        else
        {
            if(upgradeButton) Util.disableSection(upgradeButton, false);
            if(upgradeRegion) upgradeRegion.toolTipCaption = '';
        }

        this._subController.updateUI();

        this._window.height = (this.mainList?.height ?? 0) + this._heightPadding;
        this._ignoreResizeEvents = false;
    }

    /**
	 * One message carries all three options, so changing any control sends the whole row.
	 */
    // AS3: WiredChestWrapperView.as::onOptionsChanged()
    private onOptionsChanged = (): void =>
    {
        if(this._ignoreCheckboxSelectedEvents) return;

        this._controller?.send(new SetWiredChestOptionsComposer(
            this._viewingChestId,
            this.lockChestCheckbox?.isSelected ?? false,
            this.autoLockChestCheckbox?.isSelected ?? false,
            parseInt(this.capacityInput?.text ?? '', 10) || 0
        ));
    };

    // AS3: WiredChestWrapperView.as::onCapacityChange()
    private onCapacityChange = (): void =>
    {
        if(this._ignoreCapacityChangeEvents) return;

        const capacityInput = this.capacityInput;

        if(capacityInput && (parseInt(capacityInput.text, 10) || 0) > this.maxCapacity)
        {
            this._ignoreCapacityChangeEvents = true;
            capacityInput.text = String(this.maxCapacity);
            this._ignoreCapacityChangeEvents = false;
        }
    };

    /**
	 * Enter commits the capacity without waiting for the field to lose focus.
	 */
    // AS3: WiredChestWrapperView.as::onCapacityKeyDown()
    private onCapacityKeyDown = (event: WindowKeyboardEvent): void =>
    {
        if(event.keyCode === 13)
        {
            this.onOptionsChanged();
        }
    };

    /**
	 * Locking is only confirmed for a *non-owner* — an owner locks their own chest with no dialog.
	 * Unlocking always asks, whoever is doing it.
	 */
    // AS3: WiredChestWrapperView.as::onAttemptLockChest()
    private onAttemptLockChest = (event: WindowEvent): void =>
    {
        if(this._ignoreCheckboxSelectedEvents || this._ignoreCheckboxSelectEvents) return;

        if(!this._isChestOwner)
        {
            event.preventWindowOperation();

            this._controller?.roomEvents?.windowManager?.confirm(
                '${wiredchests.lock.confirm.title}',
                '${wiredchests.lock.confirm.desc}',
                0,
                (dialog, confirmEvent) => this.onConfirmLockChest(dialog, confirmEvent)
            );
        }
    };

    // AS3: WiredChestWrapperView.as::onAttemptUnlockChest()
    private onAttemptUnlockChest = (event: WindowEvent): void =>
    {
        if(this._ignoreCheckboxSelectedEvents || this._ignoreCheckboxSelectEvents) return;

        event.preventWindowOperation();

        this._controller?.roomEvents?.windowManager?.confirm(
            '${wiredchests.unlock.confirm.title}',
            '${wiredchests.unlock.confirm.desc}',
            0,
            (dialog, confirmEvent) => this.onConfirmUnlockChest(dialog, confirmEvent)
        );
    };

    // AS3: WiredChestWrapperView.as::onConfirmLockChest()
    private onConfirmLockChest(dialog: IDisposable, event: WindowEvent): void
    {
        dialog.dispose();

        if(event.type === 'WE_OK')
        {
            this._ignoreCheckboxSelectEvents = true;
            this.lockChestCheckbox?.select();
            this._ignoreCheckboxSelectEvents = false;
        }
    }

    // AS3: WiredChestWrapperView.as::onConfirmUnlockChest()
    private onConfirmUnlockChest(dialog: IDisposable, event: WindowEvent): void
    {
        dialog.dispose();

        if(event.type === 'WE_OK')
        {
            this._ignoreCheckboxSelectEvents = true;
            this.lockChestCheckbox?.unselect();
            this._ignoreCheckboxSelectEvents = false;
        }
    }

    // AS3: WiredChestWrapperView.as::get canWithdraw()
    get canWithdraw(): boolean
    {
        return this._subController !== null
            && !this._subController.isEmpty
            && this.canEdit
            && (!(this.lockChestCheckbox?.isSelected ?? false) || this._isChestOwner);
    }

    // AS3: WiredChestWrapperView.as::get canEdit()
    get canEdit(): boolean
    {
        return this._isChestOwner || (this._controller?.roomEvents?.wiredMenu?.hasWritePermission ?? false);
    }

    // AS3: WiredChestWrapperView.as::get canRead()
    get canRead(): boolean
    {
        return this._isChestOwner || (this._controller?.roomEvents?.wiredMenu?.hasReadPermission ?? false);
    }

    /**
	 * Swap what sits in the contents slot, and size the frame around it.
	 *
	 * The stretch flags are cleared *before* the resize and set again after: a view still marked
	 * stretchable would fight the assignment. A fixed view sizes the window to itself; a resizable
	 * one restores the remembered size — the first time, there is none, so it falls back to the
	 * fixed path.
	 */
    // AS3: WiredChestWrapperView.as::setSubController()
    private setSubController(subController: IChestSubController | null): void
    {
        this._ignoreResizeEvents = true;

        const view = subController?.view ?? null;
        const contents = this.chestContents;

        if(contents && contents.numChildren > 0)
        {
            const current = contents.getChildAt(0);

            if((view as unknown as IWindow | null) === current)
            {
                this._ignoreResizeEvents = false;

                return;
            }

            current?.setParamFlag(WindowParam.RELATIVE_HORIZONTAL_SCALE_STRETCH, false);
            current?.setParamFlag(WindowParam.RELATIVE_VERTICAL_SCALE_STRETCH, false);

            if(current) contents.removeChild(current);
        }

        if(view !== null && contents && this._window !== null && subController !== null)
        {
            const viewWindow = view as unknown as IWindow;

            viewWindow.setParamFlag(WindowParam.RELATIVE_HORIZONTAL_SCALE_STRETCH, false);
            viewWindow.setParamFlag(WindowParam.RELATIVE_VERTICAL_SCALE_STRETCH, false);

            if(!subController.allowResizing || this._lastResizableHeight === WiredChestWrapperView.NO_CACHED_SIZE)
            {
                this._window.width = viewWindow.width + this._widthPadding;
                contents.height = viewWindow.height;
                this._window.height = (this.mainList?.height ?? 0) + this._heightPadding;
            }
            else
            {
                this._window.width = this._lastResizableWidth + this._widthPadding;
                contents.height = this._lastResizableHeight;
            }

            (this._window as unknown as IWindow).setParamFlag(WindowParam.MOUSE_SCALING_TARGET, subController.allowResizing);
            this._window.height = (this.mainList?.height ?? 0) + this._heightPadding;
            contents.addChild(viewWindow);

            if(subController.allowResizing)
            {
                viewWindow.width = contents.width;
                viewWindow.height = contents.height;
                viewWindow.setParamFlag(WindowParam.RELATIVE_HORIZONTAL_SCALE_STRETCH, true);
                viewWindow.setParamFlag(WindowParam.RELATIVE_VERTICAL_SCALE_STRETCH, true);
            }
        }

        this._ignoreResizeEvents = false;
    }

    /**
	 * Built on first use, and only then — most chests are opened and closed without either settings
	 * window ever being asked for. Both share one preset manager, created by whichever asks first.
	 */
    // AS3: WiredChestWrapperView.as::get chestSettingsUI()
    get chestSettingsUI(): ChestSettingsUI | null
    {
        if(this._controller === null) return null;

        this._presetManager ??= new UbuntuPresetManager(this._controller.roomEvents);
        this._chestSettings ??= new ChestSettingsUI(this._controller, this._presetManager);

        return this._chestSettings;
    }

    // AS3: WiredChestWrapperView.as::get chestNotificationSettingsUI()
    get chestNotificationSettingsUI(): ChestNotificationSettingsUI | null
    {
        if(this._controller === null) return null;

        this._presetManager ??= new UbuntuPresetManager(this._controller.roomEvents);
        this._chestNotificationSettings ??= new ChestNotificationSettingsUI(this._controller, this._presetManager);

        return this._chestNotificationSettings;
    }

    // AS3: WiredChestWrapperView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._chestSettings?.dispose();
        this._chestSettings = null;
        this._chestNotificationSettings?.dispose();
        this._chestNotificationSettings = null;
        this._upgradeConfirmation?.dispose();
        this._upgradeConfirmation = null;

        this.hide();
        this.setSubController(null);
        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        (this._lockInfoBubble as unknown as IWindow | null)?.dispose();
        this._lockInfoBubble = null;
        this._controller = null;
        this._windowManager = null;
        this._presetManager = null;
        this._viewingChestId = 0;
        this._viewingChestFurni = null;
        this.resetChestCaches();
        this._disposed = true;
    }

    // AS3: WiredChestWrapperView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredChestWrapperView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: WiredChestWrapperView.as::get mainList()
    private get mainList(): IItemListWindow | null
    {
        return (this._window?.findChildByName('main_list') as IItemListWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get chestContents()
    private get chestContents(): IWindowContainer | null
    {
        return (this._window?.findChildByName('chest_contents') as IWindowContainer | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get lockInfoButton()
    private get lockInfoButton(): IRegionWindow | null
    {
        return (this._window?.findChildByName('lock_info_button') as IRegionWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get description()
    private get description(): ITextWindow | null
    {
        return (this._window?.findChildByName('desc') as ITextWindow | null) ?? null;
    }

    /**
	 * Declared and never read in AS3 — the bubble's texts come from the layout. Kept so the class
	 * stays a faithful port rather than a tidied one.
	 */
    // AS3: WiredChestWrapperView.as::get lockInfoBubbleTexts()
    private get lockInfoBubbleTexts(): IItemListWindow | null
    {
        return (this._lockInfoBubble?.findChildByName('lock_info_bubble_texts') as IItemListWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get settingsButton()
    private get settingsButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('settings_button') as IInteractiveWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get notificationSettingsButton()
    private get notificationSettingsButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('notification_settings_button') as IInteractiveWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get lockingOptions()
    private get lockingOptions(): IItemListWindow | null
    {
        return (this._window?.findChildByName('locking_options') as IItemListWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get capacityOptions()
    private get capacityOptions(): IWindowContainer | null
    {
        return (this._window?.findChildByName('capacity_options') as IWindowContainer | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get capacityOverrideContainer()
    private get capacityOverrideContainer(): IItemListWindow | null
    {
        return (this._window?.findChildByName('capacity_override_container') as IItemListWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get upgradeCapacityContainer()
    private get upgradeCapacityContainer(): IItemListWindow | null
    {
        return (this._window?.findChildByName('upgrade_capacity_container') as IItemListWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get itemCountText()
    private get itemCountText(): ITextWindow | null
    {
        return (this._window?.findChildByName('item_count_text') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get itemCountTextBottom()
    private get itemCountTextBottom(): ITextWindow | null
    {
        return (this._window?.findChildByName('item_count_text_bottom') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get header()
    private get header(): IWindowContainer | null
    {
        return (this._window?.findChildByName('header') as IWindowContainer | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get footer()
    private get footer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('footer') as IWindowContainer | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get lockChestCheckbox()
    private get lockChestCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('lock_chest_cbx') as ISelectableWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get autoLockChestCheckbox()
    private get autoLockChestCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('auto_lock_chest_cbx') as ISelectableWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get capacityInput()
    private get capacityInput(): ITextFieldWindow | null
    {
        return (this._window?.findChildByName('capacity_input') as ITextFieldWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get capacityInputBorder()
    private get capacityInputBorder(): IWindowContainer | null
    {
        return (this._window?.findChildByName('capacity_input_border') as IWindowContainer | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get maxCapacityText()
    private get maxCapacityText(): ITextWindow | null
    {
        return (this._window?.findChildByName('max_capacity_txt') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get maxCapacityUpgradeButton()
    private get maxCapacityUpgradeButton(): IIconButtonWindow | null
    {
        return (this._window?.findChildByName('upgrade_capacity_btn') as IIconButtonWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get upgradeCapacityRegion()
    private get upgradeCapacityRegion(): IRegionWindow | null
    {
        return (this._window?.findChildByName('upgrade_capacity_region') as IRegionWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get withdrawAllButton()
    private get withdrawAllButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('withdraw_all_btn') as IInteractiveWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get startDepositButton()
    private get startDepositButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('start_deposit_btn') as IInteractiveWindow | null) ?? null;
    }

    // AS3: WiredChestWrapperView.as::get viewLogsButton()
    private get viewLogsButton(): IInteractiveWindow | null
    {
        return (this._window?.findChildByName('view_logs_btn') as IInteractiveWindow | null) ?? null;
    }
}
