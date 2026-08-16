import type {IDisposable} from '@core/runtime';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IIconWindow} from '@core/window/components/IIconWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowUtils} from '@core/window/utils/WindowUtils';
import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {ActivityPointTypeEnum} from '@habbo/catalog/purse/ActivityPointTypeEnum';
import {HabbiconAssetManager} from '@habbo/habbicons/assets/HabbiconAssetManager';
import type {
    HabbiconCollectionData
} from '@habbo/communication/messages/incoming/habbicons/HabbiconCollectionData';

import type {HabbiconController} from './HabbiconController';
import type {HabbiconEntryModel} from './HabbiconEntryModel';
import type {HabbiconSetModel} from './HabbiconSetModel';
import {HabbiconState} from './HabbiconState';

const log = Logger.getLogger('habbo.catalog.habbicons.HabbiconPurchaseConfirmationView');

/**
 * "Buy this habbicon?" — and, for a whole set, what it would cost one at a time versus in one go.
 *
 * **The confirm button locks and is only unlocked by an answer.** A refusal arrives as a generic
 * catalog error, and `purchaseFailed()` waits half a second before re-enabling — long enough that a
 * held-down click cannot fire twice into the same failure.
 *
 * **A successful purchase never unlocks anything**: the controller disposes this window on
 * PurchaseOK, so the pending state is simply thrown away with it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/habbicons/HabbiconPurchaseConfirmationView.as
 */
export class HabbiconPurchaseConfirmationView implements IDisposable
{
    // AS3: HabbiconPurchaseConfirmationView.as::DESKTOP_WINDOW_LAYER
    private static readonly DESKTOP_WINDOW_LAYER: number = 1;

    // AS3: HabbiconPurchaseConfirmationView.as::MODE_HABBICON
    private static readonly MODE_HABBICON: string = 'habbicon';

    // AS3: HabbiconPurchaseConfirmationView.as::MODE_SET
    private static readonly MODE_SET: string = 'set';

    // AS3: HabbiconPurchaseConfirmationView.as::RETRY_ENABLE_DELAY_MS
    private static readonly RETRY_ENABLE_DELAY_MS: number = 500;

    // AS3: HabbiconPurchaseConfirmationView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: HabbiconController | null;

    // AS3: HabbiconPurchaseConfirmationView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: HabbiconPurchaseConfirmationView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: HabbiconPurchaseConfirmationView.as::_SafeStr_4718 (name derived: the habbicon being bought)
    private _item: HabbiconEntryModel | null = null;

    // AS3: HabbiconPurchaseConfirmationView.as::_SafeStr_4833 (name derived: the set being bought)
    private _set: HabbiconSetModel | null = null;

    // AS3: HabbiconPurchaseConfirmationView.as::_mode
    private _mode: string = '';

    // AS3: HabbiconPurchaseConfirmationView.as::_SafeStr_5093 (name derived: the re-enable timer)
    private _retryTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: HabbiconPurchaseConfirmationView.as::_SafeStr_6547 (name derived: a purchase is in flight)
    private _pending: boolean = false;

    // AS3: HabbiconPurchaseConfirmationView.as::_disposed
    private _disposed: boolean = false;

    // AS3: HabbiconPurchaseConfirmationView.as::HabbiconPurchaseConfirmationView()
    constructor(controller: HabbiconController, windowManager: IHabboWindowManager | null)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        const asset = (controller.assets?.getAssetByName('habbicon_purchase_confirmation_xml') as XmlAsset | null) ?? null;
        const layout = asset?.content ?? null;

        if(layout === null || windowManager === null)
        {
            log.warn('Missing layout "habbicon_purchase_confirmation_xml" — the confirmation is not built');

            return;
        }

        this._window = windowManager.buildFromXML(
            layout, HabbiconPurchaseConfirmationView.DESKTOP_WINDOW_LAYER
        ) as IWindowContainer | null;

        if(this._window === null) return;

        this._window.enableLookupCache();

        const image = this.productImage;

        if(image !== null) image.disposesBitmap = true;

        this.closeButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.cancelButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.confirmButton?.addEventListener('WME_CLICK', this.onConfirmClicked);
    }

    // AS3: HabbiconPurchaseConfirmationView.as::initializeForHabbicon()
    initializeForHabbicon(item: HabbiconEntryModel): void
    {
        this._mode = HabbiconPurchaseConfirmationView.MODE_HABBICON;
        this._item = item;
        this._set = null;

        this.setPending(false);
        this.updateHabbiconUI();
    }

    // AS3: HabbiconPurchaseConfirmationView.as::initializeForSet()
    initializeForSet(set: HabbiconSetModel): void
    {
        this._mode = HabbiconPurchaseConfirmationView.MODE_SET;
        this._set = set;
        this._item = null;

        this.setPending(false);
        this.updateSetUI();
    }

    // AS3: HabbiconPurchaseConfirmationView.as::show()
    show(): void
    {
        if(this._window === null) return;

        const window = this._window as unknown as IWindow;

        if(window.parent === null)
        {
            const desktop = this._windowManager?.getDesktop(
                HabbiconPurchaseConfirmationView.DESKTOP_WINDOW_LAYER
            ) ?? null;

            if(desktop !== null) (desktop as unknown as IWindowContainer).addChild(window);
        }

        window.center();
        window.activate();
    }

    // AS3: HabbiconPurchaseConfirmationView.as::purchaseFailed()
    purchaseFailed(): void
    {
        if(this._retryTimer !== null) clearTimeout(this._retryTimer);

        this._retryTimer = setTimeout(this.onRetryTimerComplete, HabbiconPurchaseConfirmationView.RETRY_ENABLE_DELAY_MS);
    }

    // AS3: HabbiconPurchaseConfirmationView.as::setPending()
    setPending(pending: boolean): void
    {
        this._pending = pending;

        const confirm = this.confirmButton;
        const cancel = this.cancelButton;
        const close = this.closeButton;

        if(confirm !== null) WindowUtils.disableSection(confirm, pending);
        if(cancel !== null) WindowUtils.disableSection(cancel, pending);
        if(close !== null) WindowUtils.disableSection(close, pending);
    }

    // AS3: HabbiconPurchaseConfirmationView.as::updateHabbiconUI()
    private updateHabbiconUI(): void
    {
        if(this._item === null) return;

        this.setText(this.productName, this._item.name);
        this.setText(this.descriptionText, '${habbicon_purchase.confirm.habbicon.desc}');
        this.setText(this.previewLabel, this._item.collectionTitle);

        const receiveRow = this.receiveRow;

        if(receiveRow !== null) receiveRow.visible = true;

        this.setText(this.receiveText, this.getHabbiconProgressText(this._item));

        const normalRow = this.normalPriceRow;
        const discountRow = this.discountRow;

        if(normalRow !== null) normalRow.visible = false;
        if(discountRow !== null) discountRow.visible = false;

        this.setText(this.priceLabel, '${catalog.purchase.confirmation.dialog.cost}');

        this.updatePrice(this._item.priceCredits, this._item.priceActivityPoints, this._item.activityPointType);
        this.showProductImage(HabbiconPurchaseConfirmationView.createHabbiconBitmap(this._item.habbiconId));
    }

    /**
	 * The "normal price" is what the missing habbicons would cost bought singly, and the discount is
	 * the difference — both computed here from the set's own rows, because the server sends only the
	 * bundle price.
	 */
    // AS3: HabbiconPurchaseConfirmationView.as::updateSetUI()
    private updateSetUI(): void
    {
        if(this._set === null) return;

        const count = HabbiconPurchaseConfirmationView.getSetPurchaseCount(this._set);
        const bundlePrice = HabbiconPurchaseConfirmationView.getSetPrice(this._set);
        const individualPrice = HabbiconPurchaseConfirmationView.getSetIndividualPrice(this._set);
        const discount = individualPrice - bundlePrice;
        const localization = this._controller?.localizationManager ?? null;
        const currency = HabbiconPurchaseConfirmationView.getSetCurrencyType(this._set);

        this.setText(this.productName, this._set.title);
        this.setText(this.descriptionText, localization?.getLocalizationWithParams(
            'habbicon_purchase.confirm.set.desc',
            'Buy the %set_name% set?',
            'set_name', this._set.title
        ) ?? '');
        this.setText(this.previewLabel, '${habbicon_purchase.confirm.set.preview}');

        const receiveRow = this.receiveRow;

        if(receiveRow !== null) receiveRow.visible = true;

        this.setText(this.receiveText, localization?.getLocalizationWithParams(
            count === 1 ? 'habbicon_purchase.confirm.set.receive.one' : 'habbicon_purchase.confirm.set.receive',
            count === 1 ? "You'll receive 1 Habbicon" : "You'll receive %count% Habbicons",
            'count', String(count)
        ) ?? '');

        this.setText(this.priceLabel, '${habbicon_purchase.confirm.set_price}');
        this.updatePrice(this._set.priceCredits, this._set.priceActivityPoints, this._set.activityPointType);

        const normalRow = this.normalPriceRow;
        const discountRow = this.discountRow;

        if(normalRow !== null) normalRow.visible = individualPrice > bundlePrice;

        this.setText(this.normalPriceAmount, HabbiconPurchaseConfirmationView.formatInlinePrice(individualPrice, currency));

        if(discountRow !== null) discountRow.visible = discount > 0;

        this.setText(
            this.discountAmount,
            HabbiconPurchaseConfirmationView.formatInlinePrice(Math.max(0, discount), currency)
        );

        this.showProductImage(HabbiconPurchaseConfirmationView.createSetBitmap(this._set));
    }

    /**
	 * "Progress after buy" counts what the player already owns plus one — capped at the total, so a
	 * habbicon bought from a full set does not read 11/10.
	 */
    // AS3: HabbiconPurchaseConfirmationView.as::getHabbiconProgressText()
    private getHabbiconProgressText(item: HabbiconEntryModel): string
    {
        const localization = this._controller?.localizationManager ?? null;
        const collection = this.findCollection(item.collectionId);
        const total = HabbiconPurchaseConfirmationView.getCollectionTotal(collection);

        if(collection === null || total <= 0)
        {
            return localization?.getLocalizationWithParams(
                'habbicon_purchase.confirm.habbicon.set',
                'Set: %set_name%',
                'set_name', item.collectionTitle
            ) ?? '';
        }

        const owned = HabbiconPurchaseConfirmationView.getCollectionOwnedCount(collection);
        const progress = Math.min(total, owned + 1);

        return localization?.getLocalizationWithParams(
            'habbicon_purchase.confirm.habbicon.progress',
            'Progress after buy: %progress% / %total%',
            'progress', String(progress),
            'total', String(total)
        ) ?? '';
    }

    // AS3: HabbiconPurchaseConfirmationView.as::updatePrice()
    private updatePrice(credits: number, activityPoints: number, activityPointType: number): void
    {
        this.setText(this.priceAmount, HabbiconPurchaseConfirmationView.formatPriceAmount(credits, activityPoints));

        const icon = this.priceIcon;

        if(icon === null) return;

        icon.style = this.getPriceIconStyle(activityPoints, activityPointType);
        icon.fitToSize();
    }

    // AS3: HabbiconPurchaseConfirmationView.as::formatPriceAmount()
    private static formatPriceAmount(credits: number, activityPoints: number): string
    {
        if(credits > 0 && activityPoints > 0) return `${credits}c + ${activityPoints}`;

        if(credits > 0) return String(credits);

        return String(Math.max(0, activityPoints));
    }

    // AS3: HabbiconPurchaseConfirmationView.as::formatInlinePrice()
    private static formatInlinePrice(amount: number, currency: number): string
    {
        if(currency === ActivityPointTypeEnum.CREDITS) return `${amount}c`;

        return String(amount);
    }

    /**
	 * This one asks for the *big* icon, unlike the popup and reward panel — it is the only place the
	 * confirmation shows a price at full size.
	 */
    // AS3: HabbiconPurchaseConfirmationView.as::getPriceIconStyle()
    private getPriceIconStyle(activityPoints: number, activityPointType: number): number
    {
        const configuration = this._controller?.configuration ?? null;

        // AS3 passes a possibly-null manager and would throw on the loyalty/seasonal branches that
        // read it. Returning the credits style keeps the icon sane instead of taking down the paint.
        if(configuration === null) return 34;

        const type = activityPoints > 0 ? activityPointType : ActivityPointTypeEnum.CREDITS;

        return ActivityPointTypeEnum.getIconStyleFor(type, configuration, true);
    }

    // AS3: HabbiconPurchaseConfirmationView.as::getSetCurrencyType()
    private static getSetCurrencyType(set: HabbiconSetModel): number
    {
        return set.priceCredits > 0 ? ActivityPointTypeEnum.CREDITS : set.activityPointType;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::getSetPrice()
    private static getSetPrice(set: HabbiconSetModel): number
    {
        return set.priceCredits > 0 ? set.priceCredits : Math.max(0, set.priceActivityPoints);
    }

    // AS3: HabbiconPurchaseConfirmationView.as::findCollection()
    private findCollection(collectionId: number): HabbiconCollectionData | null
    {
        for(const collection of this._controller?.shopCollections ?? [])
        {
            if(collection !== null && collection.collectionId === collectionId) return collection;
        }

        return null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::getCollectionTotal()
    private static getCollectionTotal(collection: HabbiconCollectionData | null): number
    {
        return collection === null ? 0 : collection.habbicons.length;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::getCollectionOwnedCount()
    private static getCollectionOwnedCount(collection: HabbiconCollectionData | null): number
    {
        if(collection === null) return 0;

        let count = 0;

        for(const item of collection.habbicons)
        {
            if(item !== null && HabbiconPurchaseConfirmationView.isOwnedState(item.state)) count++;
        }

        return count;
    }

    /**
	 * Narrower than `HabbiconState.isStoredUserState()`: a claimable habbicon is *not* owned yet, so
	 * it still counts towards what the purchase would add.
	 */
    // AS3: HabbiconPurchaseConfirmationView.as::isOwnedState()
    private static isOwnedState(state: number): boolean
    {
        return state === HabbiconState.OWNED || state === HabbiconState.FAVOURITED;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::getSetPurchaseCount()
    private static getSetPurchaseCount(set: HabbiconSetModel): number
    {
        let count = 0;

        for(const entry of set.habbicons)
        {
            if(HabbiconPurchaseConfirmationView.isMissingForSetPurchase(entry)) count++;
        }

        return count;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::getSetIndividualPrice()
    private static getSetIndividualPrice(set: HabbiconSetModel): number
    {
        let total = 0;

        for(const entry of set.habbicons)
        {
            if(!HabbiconPurchaseConfirmationView.isMissingForSetPurchase(entry)) continue;

            total += entry.priceCredits > 0 ? entry.priceCredits : Math.max(0, entry.priceActivityPoints);
        }

        return total;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::isMissingForSetPurchase()
    private static isMissingForSetPurchase(entry: HabbiconEntryModel | null): boolean
    {
        return entry !== null && !entry.owned && !entry.favorite && !entry.claimable;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::createHabbiconBitmap()
    private static createHabbiconBitmap(habbiconId: number): ImageBitmap | null
    {
        return HabbiconAssetManager.getPreviewBitmap(habbiconId, false)
            ?? HabbiconPurchaseConfirmationView.createPlaceholderBitmap();
    }

    // AS3: HabbiconPurchaseConfirmationView.as::createSetBitmap()
    private static createSetBitmap(set: HabbiconSetModel): ImageBitmap | null
    {
        return set.bitmap ?? HabbiconPurchaseConfirmationView.createPlaceholderBitmap();
    }

    // AS3: HabbiconPurchaseConfirmationView.as::createSetBitmap() — the `new BitmapData(...)` fallback
    private static createPlaceholderBitmap(): ImageBitmap | null
    {
        const canvas = new OffscreenCanvas(40, 40);
        const context = canvas.getContext('2d');

        if(context === null) return null;

        context.fillStyle = '#8F94CF';
        context.fillRect(0, 0, 40, 40);

        return canvas.transferToImageBitmap();
    }

    // AS3: HabbiconPurchaseConfirmationView.as::showProductImage()
    private showProductImage(bitmap: ImageBitmap | null): void
    {
        this.clearProductImage();

        const image = this.productImage;

        if(image === null) return;

        image.bitmap = bitmap;
        (image as unknown as IWindow).visible = bitmap !== null;
        (image as unknown as IWindow).invalidate();
    }

    // AS3: HabbiconPurchaseConfirmationView.as::clearProductImage()
    private clearProductImage(): void
    {
        const image = this.productImage;

        if(image === null || image.bitmap === null) return;

        image.bitmap = null;
        (image as unknown as IWindow).invalidate();
    }

    /**
	 * A mode with no model unlocks the button again rather than sending nothing and locking the
	 * dialog — that branch is only reachable if `initializeFor*` was never called.
	 */
    // AS3: HabbiconPurchaseConfirmationView.as::onConfirmClicked()
    private onConfirmClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._pending) return;

        this.setPending(true);

        if(this._mode === HabbiconPurchaseConfirmationView.MODE_SET && this._set !== null)
        {
            this._controller?.buyHabbiconCollection(this._set.collectionId);
        }
        else if(this._mode === HabbiconPurchaseConfirmationView.MODE_HABBICON && this._item !== null)
        {
            this._controller?.buyHabbicon(this._item.habbiconId);
        }
        else
        {
            this.setPending(false);
        }
    };

    // AS3: HabbiconPurchaseConfirmationView.as::onRetryTimerComplete()
    private onRetryTimerComplete = (): void =>
    {
        this._retryTimer = null;
        this.setPending(false);
    };

    // AS3: HabbiconPurchaseConfirmationView.as::onWindowClose()
    private onWindowClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._pending) return;

        this._controller?.closeHabbiconPurchaseConfirmation();
    };

    // TS-only: AS3 writes `x.text = y` inline everywhere; extracted because every target is nullable here.
    private setText(target: ITextWindow | null, value: string): void
    {
        if(target !== null) target.text = value;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get productImage()
    private get productImage(): IBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('product_image') as IBitmapWrapperWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get previewLabel()
    private get previewLabel(): ITextWindow | null
    {
        return (this._window?.findChildByName('preview_label') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get productName()
    private get productName(): ITextWindow | null
    {
        return (this._window?.findChildByName('product_name') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get descriptionText()
    private get descriptionText(): ITextWindow | null
    {
        return (this._window?.findChildByName('description_text') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get receiveRow()
    private get receiveRow(): IWindow | null
    {
        return this._window?.findChildByName('receive_row') ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get receiveText()
    private get receiveText(): ITextWindow | null
    {
        return (this._window?.findChildByName('receive_text') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get priceLabel()
    private get priceLabel(): ITextWindow | null
    {
        return (this._window?.findChildByName('price_label') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get priceAmount()
    private get priceAmount(): ITextWindow | null
    {
        return (this._window?.findChildByName('price_amount') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get priceIcon()
    private get priceIcon(): IIconWindow | null
    {
        return (this._window?.findChildByName('price_icon') as IIconWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get normalPriceRow()
    private get normalPriceRow(): IWindow | null
    {
        return this._window?.findChildByName('normal_price_row') ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get normalPriceAmount()
    private get normalPriceAmount(): ITextWindow | null
    {
        return (this._window?.findChildByName('normal_price_amount') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get discountRow()
    private get discountRow(): IWindow | null
    {
        return this._window?.findChildByName('discount_row') ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get discountAmount()
    private get discountAmount(): ITextWindow | null
    {
        return (this._window?.findChildByName('discount_amount') as ITextWindow | null) ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get cancelButton()
    private get cancelButton(): IWindow | null
    {
        return this._window?.findChildByName('cancel_button') ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::get confirmButton()
    private get confirmButton(): IWindow | null
    {
        return this._window?.findChildByName('confirm_button') ?? null;
    }

    // AS3: HabbiconPurchaseConfirmationView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._retryTimer !== null)
        {
            clearTimeout(this._retryTimer);
            this._retryTimer = null;
        }

        this.closeButton?.removeEventListener('WME_CLICK', this.onWindowClose);
        this.cancelButton?.removeEventListener('WME_CLICK', this.onWindowClose);
        this.confirmButton?.removeEventListener('WME_CLICK', this.onConfirmClicked);

        const window = this._window as unknown as IWindow | null;

        if(window !== null && window.parent !== null)
        {
            (window.parent as unknown as IWindowContainer).removeChild(window);
        }

        this.clearProductImage();

        window?.dispose();
        this._window = null;
        this._windowManager = null;
        this._controller = null;
        this._item = null;
        this._set = null;
    }
}
