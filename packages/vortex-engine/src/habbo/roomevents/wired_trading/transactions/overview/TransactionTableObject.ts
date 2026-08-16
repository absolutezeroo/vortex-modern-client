import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {
    WiredTransactionInfo
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionInfo';
import {
    RequestWiredTransactionDetailsComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/RequestWiredTransactionDetailsComposer';
import {
    GetExtendedProfileMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';

import {WiredTransactionLogsView} from './WiredTransactionLogsView';
import type {WiredTransactionLogsController} from './WiredTransactionLogsController';

/**
 * One row of the transaction log.
 *
 * **Two of the seven columns are links, and they send different messages**: the username opens that
 * player's profile, and "details" asks the server for the full breakdown of this transaction. The
 * rest are plain text.
 *
 * The deposit and withdrawal columns are summarised rather than listed — furniture only, coins only,
 * both, or `-` — because a row has no room for the breakdown; that is what the details window is
 * for.
 *
 * Rows never change once rendered (a page is replaced wholesale, not patched), so both
 * change-detection hooks return false.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/transactions/overview/TransactionTableObject.as
 */
export class TransactionTableObject implements ITableObject
{
    // AS3: TransactionTableObject.as::_SafeStr_4593 (name derived: the logs controller)
    private _controller: WiredTransactionLogsController;

    // AS3: TransactionTableObject.as::_transactionInfo
    private _transactionInfo: WiredTransactionInfo;

    // AS3: TransactionTableObject.as::TransactionTableObject()
    constructor(controller: WiredTransactionLogsController, transactionInfo: WiredTransactionInfo)
    {
        this._controller = controller;
        this._transactionInfo = transactionInfo;
    }

    // AS3: TransactionTableObject.as::get identifier()
    get identifier(): string
    {
        return `${this._transactionInfo.transactionId}`;
    }

    /**
	 * AS3's `ITableObject` declares this `:TableCell` yet returns null from the default branch; the
	 * port's signature is non-nullable, so an unknown column id gets an empty text cell instead. The
	 * seven ids come from the view's own column list, so the branch is unreachable in practice.
	 */
    // AS3: TransactionTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell | null
    {
        switch(columnId)
        {
            case WiredTransactionLogsView.LOG_COLUMN_TYPE:
                return new TableCell(
                    TableCell.TYPE_TEXT,
                    this.localize(`wired_transactions.type.${this._transactionInfo.transactionType}`)
                );
            case WiredTransactionLogsView.LOG_COLUMN_TIMESTAMP:
                return new TableCell(TableCell.TYPE_TEXT, this._transactionInfo.readableTimestamp);
            case WiredTransactionLogsView.LOG_COLUMN_USERNAME:
                return new TableCell(
                    TableCell.TYPE_LINK, this._transactionInfo.userName, false, true, null, this.onClickUsername
                );
            case WiredTransactionLogsView.LOG_COLUMN_DEPOSITS:
                return new TableCell(
                    TableCell.TYPE_TEXT,
                    this.summarize(this._transactionInfo.depositFurniCount, this._transactionInfo.depositCoinsCount)
                );
            case WiredTransactionLogsView.LOG_COLUMN_WITHDRAWS:
                return new TableCell(
                    TableCell.TYPE_TEXT,
                    this.summarize(this._transactionInfo.withdrawFurniCount, this._transactionInfo.withdrawCoinsCount)
                );
            case WiredTransactionLogsView.LOG_COLUMN_CHESTS:
                return new TableCell(TableCell.TYPE_TEXT, `${this._transactionInfo.chestCount}`);
            case WiredTransactionLogsView.LOG_COLUMN_DETAILS:
                return new TableCell(
                    TableCell.TYPE_LINK,
                    this.localize('wiredchests.logs.details_text'),
                    false,
                    false,
                    null,
                    this.onClickDetails
                );
            default:
                return new TableCell(TableCell.TYPE_TEXT, '');
        }
    }

    // AS3: TransactionTableObject.as::onClickUsername()
    private onClickUsername = (): void =>
    {
        this._controller.send(new GetExtendedProfileMessageComposer(this._transactionInfo.userId, true));
    };

    // AS3: TransactionTableObject.as::onClickDetails()
    private onClickDetails = (): void =>
    {
        this._controller.send(new RequestWiredTransactionDetailsComposer(this._transactionInfo.transactionId));
    };

    // AS3: TransactionTableObject.as::localize()
    private localize(key: string): string
    {
        return this.localization?.getLocalization(key) ?? key;
    }

    /**
	 * Four outcomes, and the two single-currency ones use different keys rather than one key with a
	 * zero — so a language can say "3 furni" and "500 coins" without a dangling second half.
	 */
    // AS3: TransactionTableObject.as::summarize()
    private summarize(furniCount: number, coinsCount: number): string
    {
        if(furniCount <= 0 && coinsCount <= 0)
        {
            return '-';
        }

        if(furniCount > 0 && coinsCount === 0)
        {
            return this.localization?.getLocalizationWithParams(
                'wiredchests.logs.only_furni', '', 'amount', String(furniCount)
            ) ?? '';
        }

        if(furniCount === 0 && coinsCount > 0)
        {
            return this.localization?.getLocalizationWithParams(
                'wiredchests.logs.only_coins', '', 'amount', String(coinsCount)
            ) ?? '';
        }

        return this.localization?.getLocalizationWithParams(
            'wiredchests.logs.furni_and_coins', '', 'amount', String(furniCount), 'amount2', String(coinsCount)
        ) ?? '';
    }

    // AS3: TransactionTableObject.as::get localization()
    private get localization(): IHabboLocalizationManager | null
    {
        return this._controller.localizationManager;
    }

    // AS3: TransactionTableObject.as::isPropertyUpdated()
    isPropertyUpdated(_columnId: string, _other: object): boolean
    {
        return false;
    }

    // AS3: TransactionTableObject.as::isUpdated()
    isUpdated(_other: object): boolean
    {
        return false;
    }
}
