import {Logger} from '@core/utils/Logger';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IBubbleWindow} from '@core/window/components/IBubbleWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

import {WiredChestWrapperView} from '../../chests/WiredChestWrapperView';
import {TransactionOverviewView} from './furni_overview/TransactionOverviewView';
import type {WiredTransactionDetailsController} from './WiredTransactionDetailsController';

const log = Logger.getLogger('habbo.roomevents.transactions.WiredTransactionDetailsView');

/**
 * One transaction, opened out: the summary fields down the left, and the two item breakdowns —
 * everything withdrawn and everything deposited — side by side.
 *
 * **The layout is a list of key/value/icon triplets.** Every field is an `IItemListWindow` named
 * `<property>_pair` whose first three children are the label, the value and an optional icon, so the
 * view addresses them by index rather than by name. Only the value is ever written.
 *
 * The "extra" bubble lives on the desktop rather than inside the frame so it can overhang the window
 * edge, and it borrows {@link WiredChestWrapperView.relocateBubbleFocus} to place itself — the same
 * anchoring the chest window's lock bubble uses.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/transactions/details/WiredTransactionDetailsView.as
 */
export class WiredTransactionDetailsView implements IDisposable
{
    // AS3: WiredTransactionDetailsView.as::PROPERTY_TRANSACTION_TYPE
    private static readonly PROPERTY_TRANSACTION_TYPE: string = 'transaction_type';

    // AS3: WiredTransactionDetailsView.as::PROPERTY_TIMESTAMP
    private static readonly PROPERTY_TIMESTAMP: string = 'timestamp';

    // AS3: WiredTransactionDetailsView.as::PROPERTY_ROOM_ID
    private static readonly PROPERTY_ROOM_ID: string = 'room_id';

    // AS3: WiredTransactionDetailsView.as::PROPERTY_CHEST_IDS
    private static readonly PROPERTY_CHEST_IDS: string = 'chest_ids';

    // AS3: WiredTransactionDetailsView.as::PROPERTY_USERNAME
    private static readonly PROPERTY_USERNAME: string = 'username';

    /**
	 * Declared and never used in AS3 — the layout has no `furni_transactions_pair`; the two
	 * breakdowns are containers, not key/value rows. Kept so the constant list stays faithful.
	 */
    // AS3: WiredTransactionDetailsView.as::PROPERTY_FURNI_TRANSACTIONS
    private static readonly PROPERTY_FURNI_TRANSACTIONS: string = 'furni_transactions';

    // AS3: WiredTransactionDetailsView.as::PROPERTY_EXTRA
    private static readonly PROPERTY_EXTRA: string = 'extra';

    // AS3: WiredTransactionDetailsView.as::DESKTOP_WINDOW_LAYER
    static readonly DESKTOP_WINDOW_LAYER: number = 1;

    // AS3: WiredTransactionDetailsView.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredTransactionDetailsView.as::_SafeStr_4593 (name derived: the details controller)
    private _controller: WiredTransactionDetailsController | null;

    // AS3: WiredTransactionDetailsView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: WiredTransactionDetailsView.as::_SafeStr_6592 (name derived: the withdrawals half)
    private _withdrawalsView: TransactionOverviewView | null = null;

    // AS3: WiredTransactionDetailsView.as::_SafeStr_6710 (name derived: the deposits half)
    private _depositsView: TransactionOverviewView | null = null;

    // AS3: WiredTransactionDetailsView.as::_window
    private _window: IFrameWindow | null = null;

    // AS3: WiredTransactionDetailsView.as::_SafeStr_5300 (name derived: the extra-info bubble)
    private _extraInfoBubble: IBubbleWindow | null = null;

    // AS3: WiredTransactionDetailsView.as::WiredTransactionDetailsView()
    constructor(controller: WiredTransactionDetailsController, windowManager: IHabboWindowManager | null)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        const xml = controller.assets?.getAssetByName('transaction_details_xml')?.content ?? null;

        if(!xml || !windowManager)
        {
            // AS3 dereferences both unguarded and would throw; a missing layout is a shipping
            // problem rather than a code one, so it is reported instead.
            log.warn('transaction_details_xml is not in the asset library — the details window is not built');

            return;
        }

        this._window = windowManager.buildFromXML(xml as string, 1) as IFrameWindow;

        this.closeButton?.addEventListener('WME_CLICK', this.onClose);
        (this.extraInfoButton as unknown as IWindow | null)?.addEventListener('WME_CLICK', this.onExtraButtonClick);

        const withdrawals = this.withdrawalsContainer;
        const deposits = this.depositsContainer;

        if(withdrawals) this._withdrawalsView = new TransactionOverviewView(controller, withdrawals);
        if(deposits) this._depositsView = new TransactionOverviewView(controller, deposits);

        this._extraInfoBubble = (this._window.findChildByName('extra_info_bubble') as IBubbleWindow | null) ?? null;

        if(this._extraInfoBubble)
        {
            ((this._window as unknown as IWindow).desktop as IWindowContainer | null)
                ?.addChild(this._extraInfoBubble as unknown as IWindow);
            this._extraInfoBubble.visible = false;
            (this._extraInfoBubble as unknown as IWindow)
                .addEventListener('WE_DEACTIVATED', this.onExtraInfoBubbleDeactivates);
        }
    }

    // AS3: WiredTransactionDetailsView.as::onClose()
    private onClose = (): void =>
    {
        this.hide();
    };

    /**
	 * Hiding clears both halves, so the cells go back to the pool rather than being held by a window
	 * nobody is looking at.
	 */
    // AS3: WiredTransactionDetailsView.as::hide()
    hide(): void
    {
        if(this.isShowing())
        {
            const desktop = this._windowManager?.getDesktop(WiredTransactionDetailsView.DESKTOP_WINDOW_LAYER) ?? null;

            if(desktop !== null) (desktop as IWindowContainer).removeChild(this._window as unknown as IWindow);

            this.clear();
        }
    }

    // AS3: WiredTransactionDetailsView.as::show()
    show(): void
    {
        if(this.isShowing()) return;

        const desktop = this._windowManager?.getDesktop(WiredTransactionDetailsView.DESKTOP_WINDOW_LAYER) ?? null;

        if(desktop !== null && this._window !== null)
        {
            (desktop as IWindowContainer).addChild(this._window as unknown as IWindow);
            (this._window as unknown as IWindow).center();
        }
    }

    // AS3: WiredTransactionDetailsView.as::clear()
    clear(): void
    {
        if(this._extraInfoBubble) this._extraInfoBubble.visible = false;

        this._withdrawalsView?.clear();
        this._depositsView?.clear();
    }

    // AS3: WiredTransactionDetailsView.as::isShowing()
    isShowing(): boolean
    {
        return this._window !== null && (this._window as unknown as IWindow).parent != null;
    }

    /**
	 * An empty definition string renders as `-` rather than as nothing, so the row keeps its height.
	 */
    // AS3: WiredTransactionDetailsView.as::updateUI()
    updateUI(): void
    {
        const details = this._controller?.details ?? null;

        if(details == null) return;

        const info = details.transactionInfo;

        this.setValue(WiredTransactionDetailsView.PROPERTY_TRANSACTION_TYPE, this.loc(`wired_transactions.type.${info.transactionType}`));
        this.setValue(WiredTransactionDetailsView.PROPERTY_TIMESTAMP, info.readableTimestamp);
        this.setValue(WiredTransactionDetailsView.PROPERTY_ROOM_ID, String(info.flatId));
        this.setValue(WiredTransactionDetailsView.PROPERTY_CHEST_IDS, details.chestIds.join(', '));
        this.setValue(WiredTransactionDetailsView.PROPERTY_USERNAME, info.userName);
        this.setValue(
            WiredTransactionDetailsView.PROPERTY_EXTRA,
            info.transactionDefinitionInfo === '' ? '-' : info.transactionDefinitionInfo
        );

        this._withdrawalsView?.itemsInitialize(
            info.withdrawCoinsCount, details.withdrawnFurnis, info.withdrawFurniCount, details.isIncompleteData
        );
        this._depositsView?.itemsInitialize(
            info.depositCoinsCount, details.depositedFurnis, info.depositFurniCount, details.isIncompleteData
        );

        if(this._extraInfoBubble) this._extraInfoBubble.visible = false;

        (this._window as unknown as IWindow | null)?.activate();
    }

    // TS-only: no AS3 counterpart; AS3 writes `getValueWindow(x).text = y` at each of its six call
    // sites, unguarded.
    private setValue(property: string, value: string): void
    {
        const window = this.getValueWindow(property);

        if(window) window.text = value;
    }

    // AS3: WiredTransactionDetailsView.as::loc()
    loc(key: string): string
    {
        return this._controller?.localizationManager?.getLocalization(key, key) ?? key;
    }

    // AS3: WiredTransactionDetailsView.as::onExtraInfoBubbleDeactivates()
    private onExtraInfoBubbleDeactivates = (): void =>
    {
        if(this._extraInfoBubble) this._extraInfoBubble.visible = false;
    };

    // AS3: WiredTransactionDetailsView.as::onExtraButtonClick()
    private onExtraButtonClick = (): void =>
    {
        const anchor = this.extraInfoButton;

        if(!this._extraInfoBubble || !anchor) return;

        this._extraInfoBubble.visible = true;
        WiredChestWrapperView.relocateBubbleFocus(this._extraInfoBubble, anchor as unknown as IWindow);
    };

    // AS3: WiredTransactionDetailsView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        (this._extraInfoBubble as unknown as IWindow | null)?.dispose();
        this._extraInfoBubble = null;
        this._withdrawalsView?.dispose();
        this._depositsView?.dispose();
        this._withdrawalsView = null;
        this._depositsView = null;
        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._controller = null;
        this._windowManager = null;
        this._disposed = true;
    }

    // AS3: WiredTransactionDetailsView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredTransactionDetailsView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: WiredTransactionDetailsView.as::getPairWindow()
    private getPairWindow(property: string): IItemListWindow | null
    {
        return (this._window?.findChildByName(`${property}_pair`) as IItemListWindow | null) ?? null;
    }

    /**
	 * Declared and never called in AS3 — only the value slot is ever written. Kept as a faithful port.
	 */
    // AS3: WiredTransactionDetailsView.as::getKeyWindow()
    private getKeyWindow(property: string): ITextWindow | null
    {
        return (this.getPairWindow(property)?.getListItemAt(0) as ITextWindow | null) ?? null;
    }

    // AS3: WiredTransactionDetailsView.as::getValueWindow()
    private getValueWindow(property: string): ITextWindow | null
    {
        return (this.getPairWindow(property)?.getListItemAt(1) as ITextWindow | null) ?? null;
    }

    /**
	 * Declared and never called in AS3, like {@link getKeyWindow}.
	 */
    // AS3: WiredTransactionDetailsView.as::getIconWindow()
    private getIconWindow(property: string): IIconWindow | null
    {
        return (this.getPairWindow(property)?.getListItemAt(2) as IIconWindow | null) ?? null;
    }

    // AS3: WiredTransactionDetailsView.as::get withdrawalsContainer()
    private get withdrawalsContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('withdrawals_container') as IWindowContainer | null) ?? null;
    }

    // AS3: WiredTransactionDetailsView.as::get depositsContainer()
    private get depositsContainer(): IWindowContainer | null
    {
        return (this._window?.findChildByName('deposits_container') as IWindowContainer | null) ?? null;
    }

    // AS3: WiredTransactionDetailsView.as::get extraInfoButton()
    private get extraInfoButton(): IRegionWindow | null
    {
        return (this._window?.findChildByName('extra_info_button') as IRegionWindow | null) ?? null;
    }
}
