import type {IUpdateReceiver, IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';

import {TableView} from '@habbo/window/utils/tableview/TableView';
import {TableColumn} from '@habbo/window/utils/tableview/TableColumn';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {
    WiredTransactionLogsEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionLogsEvent';
import type {
    WiredTransactionLogsEventParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/WiredTransactionLogsEventParser';
import type {
    WiredTransactionInfo
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionInfo';
import {
    WiredTransactionLogList
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionLogList';
import {
    RequestWiredTransactionLogsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/RequestWiredTransactionLogsComposer';
import {
    SetWiredChestsLockedComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/SetWiredChestsLockedComposer';

import {Util} from '../../../Util';
import {TransactionConfig} from '../../../wired_trading/transactions/overview/TransactionConfig';
import type {WiredMenuController} from '../../WiredMenuController';
import {WiredMenuDefaultTab} from '../WiredMenuDefaultTab';
import {TransactionPreviewTableObject} from './TransactionPreviewTableObject';

/**
 * WiredMenuChestsTab — the "chests" tab: lock or unlock the room's wired chests, and a ten-row
 * preview of their most recent transactions.
 *
 * The preview **polls**: `update()` re-requests every 20 seconds while the tab is being viewed,
 * because nothing pushes a chest transaction unprompted.
 *
 * Locking is deliberately awkward on purpose. The two per-player buttons need write permission; the
 * "lock all" button needs room ownership *and* a confirmation dialog. All three then go quiet for
 * half a second (`LOCK_TIMEOUT_MS`) so a double click cannot send the same command twice.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_chests/WiredMenuChestsTab.as
 */
export class WiredMenuChestsTab extends WiredMenuDefaultTab implements IUpdateReceiver
{
    // AS3: WiredMenuChestsTab.as::POLL_PREVIEW_MS
    private static readonly POLL_PREVIEW_MS: number = 20000;

    // AS3: WiredMenuChestsTab.as::_SafeStr_10365 (name derived: the post-lock button cool-down)
    private static readonly LOCK_TIMEOUT_MS: number = 500;

    // AS3: WiredMenuChestsTab.as::LOG_COLUMN_TYPE
    static readonly LOG_COLUMN_TYPE: string = 'type';

    // AS3: WiredMenuChestsTab.as::LOG_COLUMN_USERNAME
    static readonly LOG_COLUMN_USERNAME: string = 'username';

    // AS3: WiredMenuChestsTab.as::LOG_COLUMN_WITHDRAWS
    static readonly LOG_COLUMN_WITHDRAWS: string = 'withdraws';

    // AS3: WiredMenuChestsTab.as::_SafeStr_9661 (name derived from its value, "deposits" — the
    // other three column ids kept their real names)
    static readonly LOG_COLUMN_DEPOSITS: string = 'deposits';

    // AS3: WiredMenuChestsTab.as::TRANSACTIONS_PREVIEW_AMOUNT
    static readonly TRANSACTIONS_PREVIEW_AMOUNT: number = 10;

    // AS3: WiredMenuChestsTab.as::TRANSACTIONS_FIRST_PAGE
    static readonly TRANSACTIONS_FIRST_PAGE: number = 1;

    // AS3: WiredMenuChestsTab.as::_SafeStr_6336 (name derived: the transactions table)
    private _table: TableView | null = null;

    // AS3: WiredMenuChestsTab.as::_SafeStr_9274 (name derived: when the lock cool-down started)
    private _lockTimeoutStart: number = 0;

    // AS3: WiredMenuChestsTab.as::_SafeStr_6416 (name derived: lock cool-down active)
    private _lockTimeoutActive: boolean = false;

    // AS3: WiredMenuChestsTab.as::_SafeStr_8981 (name derived: when the last poll was sent)
    private _lastRequest: number = 0;

    // AS3: WiredMenuChestsTab.as::_SafeStr_5983 (name derived: the previewed transactions)
    private _transactions: WiredTransactionInfo[] | null = null;

    // AS3: WiredMenuChestsTab.as::WiredMenuChestsTab()
    constructor(controller: WiredMenuController, container: IWindowContainer)
    {
        super(controller, container);

        this.createTransactionTable();
        this.addMessageEvent(new WiredTransactionLogsEvent((event) => this.onLogListResults(event)));

        this.lockYourChestsButton?.addEventListener('WME_CLICK', this.onLockChestsClick);
        this.unlockYourChestsButton?.addEventListener('WME_CLICK', this.onUnlockChestsClick);
        this.lockAllChestsButton?.addEventListener('WME_CLICK', this.onLockAllChestsClick);
        this.viewInDetailButton?.addEventListener('WME_CLICK', this.onViewInDetailClick);
    }

    /**
	 * The same header answers this tab and the paged transactions window, so a page is only ours if
	 * all three of its shape fields match what we asked for — ten rows, page one, preview type.
	 * Anything else belongs to the other consumer and is dropped.
	 */
    // AS3: WiredMenuChestsTab.as::onLogListResults()
    private onLogListResults(event: IMessageEvent): void
    {
        const logs = (event.parser as WiredTransactionLogsEventParser).logs;

        if(!logs) return;

        if(logs.amount === WiredMenuChestsTab.TRANSACTIONS_PREVIEW_AMOUNT
            && logs.currentPage === WiredMenuChestsTab.TRANSACTIONS_FIRST_PAGE
            && logs.logListType === WiredTransactionLogList.LOG_LIST_TYPE_PREVIEW)
        {
            this._transactions = logs.logs;

            // AS3 routes through the loading state while it is still up, so the tab leaves its
            // spinner by the same path every other tab does rather than painting behind it.
            if(this.isLoading)
            {
                this.updateLoadingState();
            }
            else
            {
                this.updateTransactionLogsUI();
            }
        }
    }

    // AS3: WiredMenuChestsTab.as::createTransactionTable()
    private createTransactionTable(): void
    {
        const container = this.transactionsTableViewContainer;

        if(!container || !this.controller.windowManager) return;

        this._table = new TableView(this.controller.windowManager, container);

        this._table.initialize([
            new TableColumn(WiredMenuChestsTab.LOG_COLUMN_TYPE, this.loc('wiredmenu.chests.room_logs.column.type'), 0.28),
            new TableColumn(WiredMenuChestsTab.LOG_COLUMN_USERNAME, this.loc('wiredmenu.chests.room_logs.column.username'), 0.24),
            new TableColumn(WiredMenuChestsTab.LOG_COLUMN_WITHDRAWS, this.loc('wiredmenu.chests.room_logs.column.withdraws'), 0.24),
            new TableColumn(WiredMenuChestsTab.LOG_COLUMN_DEPOSITS, this.loc('wiredmenu.chests.room_logs.column.deposits'), 0.24),
        ]);
    }

    /**
	 * Every visit starts empty and asks again — a preview kept from last time would show stale
	 * balances for however long the first poll takes.
	 */
    // AS3: WiredMenuChestsTab.as::startViewing()
    override startViewing(): void
    {
        super.startViewing();

        this.clearData();
        this.updateLoadingState();
        this.requestData();
    }

    // AS3: WiredMenuChestsTab.as::clearData()
    private clearData(): void
    {
        this._transactions = null;
    }

    // AS3: WiredMenuChestsTab.as::isDataReady()
    protected override isDataReady(): boolean
    {
        return this._transactions !== null;
    }

    // AS3: WiredMenuChestsTab.as::initializeInterface()
    protected override initializeInterface(): void
    {
        this.updateTransactionLogsUI();
        this.updateButtonsUI();
    }

    // AS3: WiredMenuChestsTab.as::permissionsUpdated()
    override permissionsUpdated(): void
    {
        this.updateButtonsUI();
    }

    /**
	 * Lock-all is the only one gated on ownership rather than write permission — it reaches every
	 * player's chests, not just the caller's.
	 */
    // AS3: WiredMenuChestsTab.as::updateButtonsUI()
    private updateButtonsUI(): void
    {
        const writable = this.controller.hasWritePermission && !this._lockTimeoutActive;
        const lockYours = this.lockYourChestsButton;
        const unlockYours = this.unlockYourChestsButton;
        const lockAll = this.lockAllChestsButton;

        if(lockYours) Util.disableSection(lockYours, !writable);
        if(unlockYours) Util.disableSection(unlockYours, !writable);
        if(lockAll) Util.disableSection(lockAll, !this.controller.isRoomOwnerOrStaff() || this._lockTimeoutActive);
    }

    // AS3: WiredMenuChestsTab.as::updateTransactionLogsUI()
    private updateTransactionLogsUI(): void
    {
        const transactions = this._transactions ?? [];
        const container = this.transactionsTableViewContainer;

        // AS3 greys the whole table out when there is nothing in it, rather than showing an empty
        // grid with live headers.
        if(container) Util.disableSection(container, transactions.length === 0);

        const rows: ITableObject[] = [];

        for(const transaction of transactions)
        {
            rows.push(new TransactionPreviewTableObject(this, transaction));
        }

        this._table?.setObjects(rows);
    }

    // AS3: WiredMenuChestsTab.as::requestData()
    private requestData(): void
    {
        this._lastRequest = this.now();

        this.controller.send(new RequestWiredTransactionLogsComposer(
            WiredMenuChestsTab.TRANSACTIONS_PREVIEW_AMOUNT,
            WiredMenuChestsTab.TRANSACTIONS_FIRST_PAGE
        ));
    }

    // AS3: WiredMenuChestsTab.as::onLockChestsClick()
    private onLockChestsClick = (): void =>
    {
        this.controller.send(new SetWiredChestsLockedComposer(true, false));
        this.startLockTimeout();
    };

    // AS3: WiredMenuChestsTab.as::onUnlockChestsClick()
    private onUnlockChestsClick = (): void =>
    {
        this.controller.send(new SetWiredChestsLockedComposer(false, false));
        this.startLockTimeout();
    };

    // AS3: WiredMenuChestsTab.as::onLockAllChestsClick()
    private onLockAllChestsClick = (): void =>
    {
        this.controller.roomEvents.windowManager?.confirm(
            '${wiredmenu.chests.chest_control.lock_all.warning.title}',
            '${wiredmenu.chests.chest_control.lock_all.warning.desc}',
            0,
            this.onConfirmLockAllChest
        );
    };

    /**
	 * AS3 disposes the dialog first and only then reads the outcome, so the window is gone whichever
	 * button was pressed.
	 */
    // AS3: WiredMenuChestsTab.as::onConfirmLockAllChest()
    private onConfirmLockAllChest = (dialog: IDisposable, event: WindowEvent): void =>
    {
        dialog.dispose();

        if(event.type === 'WE_OK')
        {
            this.controller.send(new SetWiredChestsLockedComposer(true, true));
            this.startLockTimeout();
        }
    };

    // AS3: WiredMenuChestsTab.as::startLockTimeout()
    private startLockTimeout(): void
    {
        this._lockTimeoutActive = true;
        this._lockTimeoutStart = this.now();

        // While the spinner is up the buttons are not on screen to grey out; `initializeInterface()`
        // repaints them when it comes down.
        if(!this.isLoading)
        {
            this.updateButtonsUI();
        }
    }

    /**
	 * "View in detail" asks for the *other* list — the full page size — which is what the paged
	 * transactions window reads. This tab's own `onLogListResults` then drops that reply.
	 */
    // AS3: WiredMenuChestsTab.as::onViewInDetailClick()
    private onViewInDetailClick = (): void =>
    {
        this.controller.send(new RequestWiredTransactionLogsComposer(TransactionConfig.PAGE_SIZE, 1));
    };

    // AS3: WiredMenuChestsTab.as::update()
    update(_deltaTime: number): void
    {
        if(!this.isViewing) return;

        const now = this.now();

        if(this._lastRequest < now - WiredMenuChestsTab.POLL_PREVIEW_MS)
        {
            this.requestData();
        }

        if(!this.isLoading && this._lockTimeoutActive && this._lockTimeoutStart < now - WiredMenuChestsTab.LOCK_TIMEOUT_MS)
        {
            this._lockTimeoutActive = false;
            this.updateButtonsUI();
        }
    }

    /**
	 * TS-only: AS3's `flash.utils.getTimer()`, milliseconds since start-up. Both uses here are
	 * elapsed-time comparisons, so any monotonic source works.
	 */
    private now(): number
    {
        return performance.now();
    }

    // AS3: WiredMenuChestsTab.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._table?.dispose();
        this._table = null;
        this._transactions = null;

        super.dispose();
    }

    // AS3: WiredMenuChestsTab.as::get lockYourChestsButton()
    private get lockYourChestsButton(): IWindow | null
    {
        return this.container.findChildByName('lock_own_button');
    }

    // AS3: WiredMenuChestsTab.as::get unlockYourChestsButton()
    private get unlockYourChestsButton(): IWindow | null
    {
        return this.container.findChildByName('unlock_own_button');
    }

    // AS3: WiredMenuChestsTab.as::get lockAllChestsButton()
    private get lockAllChestsButton(): IWindow | null
    {
        return this.container.findChildByName('lock_all_button');
    }

    // AS3: WiredMenuChestsTab.as::get transactionsTableViewContainer()
    private get transactionsTableViewContainer(): IWindowContainer | null
    {
        return (this.container.findChildByName('logs_table_container') as IWindowContainer | null) ?? null;
    }

    // AS3: WiredMenuChestsTab.as::get viewInDetailButton()
    private get viewInDetailButton(): IWindow | null
    {
        return this.container.findChildByName('view_in_detail_button');
    }
}
