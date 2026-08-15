import {Logger} from '@core/utils/Logger';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import {Vector3d} from '@room/utils/Vector3d';
import {
    WiredChestUpgradeResultMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredtrading/chests/WiredChestUpgradeResultMessageEvent';
import type {
    WiredChestUpgradeResultMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/WiredChestUpgradeResultMessageParser';
import {
    UpgradeWiredChestComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/wiredtrading/chests/UpgradeWiredChestComposer';
import {Util} from '../../../Util';
import {ChestType} from '../ChestType';
import type {WiredChestController} from '../WiredChestController';

const log = Logger.getLogger('habbo.roomevents.chests.WiredChestUpgradeConfirmationView');

/**
 * Buy more capacity for a chest: pick how many upgrades, see the price and the resulting capacity,
 * confirm.
 *
 * **Every number on this screen comes from server configuration**, not from the chest — initial
 * capacity, per-upgrade capacity, the cap, and both prices are `getInteger()` lookups keyed by
 * chest kind. The already-purchased count is the only per-chest input.
 *
 * The dropdown is built to the *remaining* headroom rather than to the cap: it always offers "1",
 * then keeps adding while `alreadyPurchased + n + 1` stays within the maximum. A chest at the cap
 * gets a disabled dropdown holding only "1".
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/upgrade_confirmation/WiredChestUpgradeConfirmationView.as
 */
export class WiredChestUpgradeConfirmationView implements IGetImageListener
{
    /**
	 * The currency the diamond price is paid in. AS3 inlines 5 at the only call site.
	 */
    // AS3: WiredChestUpgradeConfirmationView.as::updateUI() — inline activity-point type (name derived)
    private static readonly ACTIVITY_POINT_TYPE_DIAMONDS: number = 5;

    // AS3: WiredChestUpgradeConfirmationView.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredChestUpgradeConfirmationView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: WiredChestUpgradeConfirmationView.as::_SafeStr_4593 (name derived: the chest controller)
    private _controller: WiredChestController | null;

    // AS3: WiredChestUpgradeConfirmationView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: WiredChestUpgradeConfirmationView.as::_SafeStr_8590 (name derived: the result subscription)
    private _upgradeResultEvent: IMessageEvent | null = null;

    // AS3: WiredChestUpgradeConfirmationView.as::_chestId
    private _chestId: number = -1;

    // AS3: WiredChestUpgradeConfirmationView.as::_chestType
    private _chestType: number = 0;

    // AS3: WiredChestUpgradeConfirmationView.as::_chestItemType
    private _chestItemType: number = 0;

    // AS3: WiredChestUpgradeConfirmationView.as::_SafeStr_7301 (name derived: upgrades already bought)
    private _alreadyPurchased: number = 0;

    // AS3: WiredChestUpgradeConfirmationView.as::WiredChestUpgradeConfirmationView()
    constructor(controller: WiredChestController)
    {
        this._controller = controller;
        this._windowManager = controller.windowManager;

        const xml = controller.assets?.getAssetByName('chest_upgrade_xml')?.content ?? null;

        if(!xml || !this._windowManager)
        {
            log.warn('chest_upgrade_xml is not in the asset library — upgrade confirmation not built');

            return;
        }

        this._window = this._windowManager.buildFromXML(xml as string, 1) as unknown as IWindowContainer;
        this._window.enableLookupCache();

        this.closeButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.cancelButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.buyButton?.addEventListener('WME_CLICK', this.onBuyClicked);
        (this.amountSelection as unknown as IWindow | null)?.addEventListener('WE_SELECTED', this.onAmountSelected);

        this._upgradeResultEvent = new WiredChestUpgradeResultMessageEvent((event) => this.onUpgradeChestResult(event));
        controller.addMessageEvent(this._upgradeResultEvent);
    }

    /**
	 * Both outcomes are a notification and a close — failure never leaves the dialog up for a retry.
	 * The failure key is built from the server's code, so an unknown code renders its own key.
	 */
    // AS3: WiredChestUpgradeConfirmationView.as::onUpgradeChestResult()
    private onUpgradeChestResult(event: IMessageEvent): void
    {
        const parser = event.parser as WiredChestUpgradeResultMessageParser;
        const resultCode = parser.resultCode;
        const localization = this._controller?.localization ?? null;
        const notifications = this._controller?.roomEvents?.notifications ?? null;

        if(resultCode === 0)
        {
            notifications?.addItem('${wiredchests.upgrade.result.success}', 'info');
        }
        else
        {
            const reason = localization?.getLocalization(`wiredchests.upgrade.result.error.${resultCode}`) ?? '';

            notifications?.addItem(
                localization?.getLocalizationWithParams('wiredchests.upgrade.result.error', '', 'reason', reason) ?? '',
                'info'
            );
        }

        this.hide();
    }

    /**
	 * The dropdown's *selection index* plus one is the quantity — position 0 buys one upgrade.
	 */
    // AS3: WiredChestUpgradeConfirmationView.as::onBuyClicked()
    private onBuyClicked = (): void =>
    {
        this.buyButton?.disable();
        this._controller?.send(new UpgradeWiredChestComposer(this._chestId, (this.amountSelection?.selection ?? 0) + 1));
    };

    // AS3: WiredChestUpgradeConfirmationView.as::initialize()
    initialize(chestId: number, chestType: number, chestItemType: number, alreadyPurchased: number): void
    {
        this._chestId = chestId;
        this._chestType = chestType;
        this._chestItemType = chestItemType;
        this._alreadyPurchased = alreadyPurchased;

        this.initializeDropMenu();
        this.updateUI();
    }

    // AS3: WiredChestUpgradeConfirmationView.as::initializeDropMenu()
    private initializeDropMenu(): void
    {
        const maxUpgrades = this.configInt('max_upgrades');
        const options: string[] = ['1'];

        // AS3 walks two counters together: the label (from 2) and the resulting total (from
        // alreadyPurchased + 2), stopping when the total would exceed the cap.
        let label = 2;
        let total = this._alreadyPurchased + 2;

        while(total <= maxUpgrades)
        {
            options.push(String(label));
            label += 1;
            total += 1;
        }

        const selection = this.amountSelection;

        if(selection)
        {
            // AS3 calls this `populateWithVector` (it took a `Vector.<String>`); the port names the
            // same member `populateWithStrings`.
            selection.populateWithStrings(options);
            selection.selection = 0;

            Util.disableSection(selection as unknown as IWindow, this._alreadyPurchased >= maxUpgrades);
        }
    }

    // AS3: WiredChestUpgradeConfirmationView.as::onAmountSelected()
    private onAmountSelected = (): void =>
    {
        this.updateUI();
    };

    /**
	 * Two refusals, checked in AS3's order: already at the cap, or not enough of *either* currency.
	 * A price of zero hides its own label, so a chest priced only in credits shows no diamond line
	 * and no "+".
	 */
    // AS3: WiredChestUpgradeConfirmationView.as::updateUI()
    private updateUI(): void
    {
        const quantity = (this.amountSelection?.selection ?? 0) + 1;

        this.buyButton?.enable();
        this.cancelButton?.enable();

        const image = this._controller?.roomEngine?.getFurnitureImage(this._chestItemType, new Vector3d(90, 0, 0), 64, this);

        if(image?.data) this.showChestPreview(image.data);

        const initialCapacity = this.configInt('initial_capacity');
        const upgradeCapacity = this.configInt('upgrade_capacity');
        const maxUpgrades = this.configInt('max_upgrades');
        const creditCost = this._controller?.getInteger('wired.chests.upgrade_cost_credits', 999) ?? 999;
        const diamondCost = this._controller?.getInteger('wired.chests.upgrade_cost_diamonds', 999) ?? 999;

        const atCapacity = this._alreadyPurchased >= maxUpgrades;
        const purse = this._controller?.catalog?.getPurse() ?? null;
        const tooPoor = (purse?.credits ?? 0) < creditCost * quantity
            || (purse?.getActivityPointsForType(WiredChestUpgradeConfirmationView.ACTIVITY_POINT_TYPE_DIAMONDS) ?? 0)
                < diamondCost * quantity;

        let reasonKey: string | null = null;

        if(atCapacity)
        {
            reasonKey = 'wiredchests.upgrade.error.reason.at_capacity';
        }
        else if(tooPoor)
        {
            reasonKey = 'wiredchests.upgrade.error.reason.not_enough_currency';
        }

        const currentCapacity = initialCapacity + (this._alreadyPurchased * upgradeCapacity);
        const extraCapacity = upgradeCapacity * quantity;
        const localization = this._controller?.localization ?? null;

        const productName = this.productNameText;
        const currentText = this.currentCapacityText;
        const newText = this.newCapacity;

        if(productName)
        {
            productName.text = localization?.getLocalizationWithParams(
                'wiredchests.upgrade.capacity.extra', '', 'purchase_capacity', String(extraCapacity)
            ) ?? '';
        }

        if(currentText)
        {
            currentText.text = localization?.getLocalizationWithParams(
                'wiredchests.upgrade.capacity.current', '', 'current_capacity', String(currentCapacity)
            ) ?? '';
        }

        if(newText)
        {
            newText.text = localization?.getLocalizationWithParams(
                'wiredchests.upgrade.capacity.new', '', 'new_capacity', String(currentCapacity + extraCapacity)
            ) ?? '';
        }

        const credits = this.priceCreditsText;
        const diamonds = this.priceDiamondsText;
        const plus = this.pricePlusText;

        if(credits)
        {
            credits.text = String(creditCost * quantity);
            credits.visible = creditCost !== 0;
        }

        if(diamonds)
        {
            diamonds.text = String(diamondCost * quantity);
            diamonds.visible = diamondCost !== 0;
        }

        if(plus) plus.visible = creditCost !== 0 && diamondCost !== 0;

        const error = this.errorText;

        if(error) error.visible = reasonKey !== null;

        if(reasonKey !== null && error)
        {
            this.buyButton?.disable();

            error.text = localization?.getLocalizationWithParams(
                'wiredchests.upgrade.error', '', 'reason', localization?.getLocalization(reasonKey) ?? reasonKey
            ) ?? '';
        }
    }

    // TS-only: no AS3 counterpart; AS3 rebuilds the `wired.<kind>_chest.<key>` name at each of its
    // five lookups.
    private configInt(key: string): number
    {
        const kind = this._chestType === ChestType.TYPE_COIN ? 'coins' : 'furni';

        return this._controller?.getInteger(`wired.${kind}_chest.${key}`, 0) ?? 0;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::showChestPreview()
    private showChestPreview(bitmap: ImageBitmap | null): void
    {
        const image = this.productImage;

        if(image) image.bitmap = bitmap;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::show()
    show(): void
    {
        if(this._windowManager !== null && this._window !== null && (this._window as unknown as IWindow).parent == null)
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop) desktop.addChild(this._window as unknown as IWindow);
        }

        (this._window as unknown as IWindow | null)?.center();
        (this._window as unknown as IWindow | null)?.activate();
    }

    // AS3: WiredChestUpgradeConfirmationView.as::hide()
    private hide(): void
    {
        if(this._windowManager === null || this._window === null) return;

        if((this._window as unknown as IWindow).parent != null)
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop) desktop.removeChild(this._window as unknown as IWindow);
        }
    }

    // AS3: WiredChestUpgradeConfirmationView.as::onWindowClose()
    private onWindowClose = (event: {type: string}): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.hide();
    };

    // AS3: WiredChestUpgradeConfirmationView.as::imageReady()
    imageReady(_id: number, data: ImageBitmap | null): void
    {
        this.showChestPreview(data);
    }

    // AS3: WiredChestUpgradeConfirmationView.as::imageFailed()
    imageFailed(_id: number): void
    {
        this.showChestPreview(null);
    }

    /**
	 * AS3 checks the controller is not already disposed before unregistering — this view outlives
	 * nothing, but the controller's own dispose tears both down and the order is not guaranteed.
	 */
    // AS3: WiredChestUpgradeConfirmationView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        if(this._controller?.disposed === false && this._upgradeResultEvent)
        {
            this._controller.removeMessageEvent(this._upgradeResultEvent);
        }

        this._upgradeResultEvent = null;

        this.hide();
        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._windowManager = null;
        this._controller = null;
        this._disposed = true;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get productImage()
    get productImage(): IBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('product_image') as IBitmapWrapperWindow | null) ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get productNameText()
    get productNameText(): ITextWindow | null
    {
        return (this._window?.findChildByName('product_name') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get currentCapacityText()
    get currentCapacityText(): ITextWindow | null
    {
        return (this._window?.findChildByName('current_capacity') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get newCapacity()
    get newCapacity(): ITextWindow | null
    {
        return (this._window?.findChildByName('new_capacity') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get amountSelection()
    get amountSelection(): IDropMenuWindow | null
    {
        return (this._window?.findChildByName('amount_selection_dropmenu') as IDropMenuWindow | null) ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get priceCreditsText()
    get priceCreditsText(): ITextWindow | null
    {
        return (this._window?.findChildByName('price_credits') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get pricePlusText()
    get pricePlusText(): ITextWindow | null
    {
        return (this._window?.findChildByName('plus') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get priceDiamondsText()
    get priceDiamondsText(): ITextWindow | null
    {
        return (this._window?.findChildByName('price_diamonds') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get errorText()
    get errorText(): ITextWindow | null
    {
        return (this._window?.findChildByName('error_text') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get cancelButton()
    get cancelButton(): IWindow | null
    {
        return this._window?.findChildByName('cancel_button') ?? null;
    }

    // AS3: WiredChestUpgradeConfirmationView.as::get buyButton()
    get buyButton(): IWindow | null
    {
        return this._window?.findChildByName('buy_button') ?? null;
    }
}
