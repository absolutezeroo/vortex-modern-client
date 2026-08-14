import type {ITableObject} from '@habbo/window/utils/tableview/ITableObject';
import {TableCell} from '@habbo/window/utils/tableview/TableCell';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {
    WiredTransactionInfo
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/WiredTransactionInfo';
import {
    GetExtendedProfileMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileMessageComposer';
import {WiredMenuChestsTab} from './WiredMenuChestsTab';

/**
 * One row of the chests tab's transaction preview: what happened, who did it, and how much moved
 * each way.
 *
 * Withdrawals and deposits are each a *pair* of counts — furniture and coins — collapsed into one
 * cell by {@link summarize}, which picks one of four localization keys rather than rendering an
 * empty half.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_menu/tabs/tab_chests/TransactionPreviewTableObject.as
 */
export class TransactionPreviewTableObject implements ITableObject
{
    // AS3: TransactionPreviewTableObject.as::_chestsTab
    private _chestsTab: WiredMenuChestsTab;

    // AS3: TransactionPreviewTableObject.as::_transactionInfo
    private _transactionInfo: WiredTransactionInfo;

    // AS3: TransactionPreviewTableObject.as::TransactionPreviewTableObject()
    constructor(chestsTab: WiredMenuChestsTab, transactionInfo: WiredTransactionInfo)
    {
        this._chestsTab = chestsTab;
        this._transactionInfo = transactionInfo;
    }

    // AS3: TransactionPreviewTableObject.as::get identifier()
    get identifier(): string
    {
        return `${this._transactionInfo.transactionId}`;
    }

    /**
	 * The username cell is the only interactive one — a link that opens that player's profile. AS3
	 * marks it inspectable but not editable, and hands the click straight to `onClickUsername`.
	 */
    /**
	 * TODO(AS3): the `null` this returns for an unknown column is a lie to the type system.
	 * AS3's `ITableObject.getTableCell()` is declared `:TableCell` and its implementations return
	 * null from the default branch — object types are implicitly nullable there — so the port's
	 * non-nullable signature is a faithful transcription of a signature AS3 itself does not honour.
	 * `VariableValueTableObject` already casts the same way, and this follows it rather than
	 * inventing a second convention. Widening `ITableObject` to `TableCell | null` is the real fix,
	 * but `TableRowView` passes the result straight into `TableCellView` at three call sites without
	 * a guard, so it needs AS3's null path read first — a separate task, not a rider on this slice.
	 */
    // AS3: TransactionPreviewTableObject.as::getTableCell()
    getTableCell(columnId: string): TableCell
    {
        switch(columnId)
        {
            case WiredMenuChestsTab.LOG_COLUMN_TYPE:
                return new TableCell(
                    TableCell.TYPE_TEXT,
                    this.localize(`transaction.type.${this._transactionInfo.transactionType}`)
                );
            case WiredMenuChestsTab.LOG_COLUMN_USERNAME:
                return new TableCell(
                    TableCell.TYPE_LINK,
                    this._transactionInfo.userName,
                    false,
                    true,
                    null,
                    this.onClickUsername
                );
            case WiredMenuChestsTab.LOG_COLUMN_DEPOSITS:
                return new TableCell(
                    TableCell.TYPE_TEXT,
                    this.summarize(this._transactionInfo.depositFurniCount, this._transactionInfo.depositCoinsCount)
                );
            case WiredMenuChestsTab.LOG_COLUMN_WITHDRAWS:
                return new TableCell(
                    TableCell.TYPE_TEXT,
                    this.summarize(this._transactionInfo.withdrawFurniCount, this._transactionInfo.withdrawCoinsCount)
                );
            default:
                return null as unknown as TableCell;
        }
    }

    /**
	 * Four outcomes, in AS3's order: nothing moved, furniture only, coins only, both. The "-" for
	 * nothing is a literal, not a localization key.
	 */
    // AS3: TransactionPreviewTableObject.as::summarize()
    private summarize(furniCount: number, coinsCount: number): string
    {
        if(furniCount <= 0 && coinsCount <= 0)
        {
            return '-';
        }

        if(furniCount > 0 && coinsCount === 0)
        {
            return this.localization?.getLocalizationWithParams(
                'wiredmenu.chests.room_logs.only_furni', '', 'amount', String(furniCount)
            ) ?? '';
        }

        if(furniCount === 0 && coinsCount > 0)
        {
            return this.localization?.getLocalizationWithParams(
                'wiredmenu.chests.room_logs.only_coins', '', 'amount', String(coinsCount)
            ) ?? '';
        }

        return this.localization?.getLocalizationWithParams(
            'wiredmenu.chests.room_logs.furni_and_coins', '', 'amount', String(furniCount), 'amount2', String(coinsCount)
        ) ?? '';
    }

    // AS3: TransactionPreviewTableObject.as::onClickUsername()
    private onClickUsername = (): void =>
    {
        this._chestsTab.controller.send(new GetExtendedProfileMessageComposer(this._transactionInfo.userId, true));
    };

    /**
	 * Every key this row reads sits under one prefix, which AS3 applies here rather than at each
	 * call site.
	 */
    // AS3: TransactionPreviewTableObject.as::localize()
    private localize(key: string): string
    {
        return this.localization?.getLocalization(`wiredmenu.chests.${key}`) ?? '';
    }

    // AS3: TransactionPreviewTableObject.as::get localization()
    private get localization(): IHabboLocalizationManager | null
    {
        return this._chestsTab.controller.localizationManager;
    }

    // AS3: TransactionPreviewTableObject.as::isPropertyUpdated()
    isPropertyUpdated(_property: string, _other: unknown): boolean
    {
        return false;
    }

    /**
	 * AS3 returns false unconditionally from both: a transaction row is immutable, so the table
	 * never needs to diff one against its predecessor.
	 */
    // AS3: TransactionPreviewTableObject.as::isUpdated()
    isUpdated(_other: unknown): boolean
    {
        return false;
    }
}
