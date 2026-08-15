import {Logger} from '@core/utils/Logger';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import {Vector3d} from '@room/utils/Vector3d';
import type {ChestSettingsUI} from './ChestSettingsUI';

const log = Logger.getLogger('habbo.roomevents.chests.WiredChestWiredUpdateConfirmationView');

/**
 * "Buy the wired upgrade for this chest?" — a small confirmation over the settings screen.
 *
 * **Buying does not send anything from here.** The buy button disables itself and calls back into
 * `ChestSettingsUI.confirmUpgrade()`, which flips the settings screen's own upgrade state and saves
 * the whole form — the upgrade travels as one field of the settings message.
 *
 * The chest artwork is requested from the room engine and may arrive either synchronously (already
 * cached) or later through {@link imageReady}; both paths land in the same setter.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/settings/WiredChestWiredUpdateConfirmationView.as
 */
export class WiredChestWiredUpdateConfirmationView implements IGetImageListener
{
    // AS3: WiredChestWiredUpdateConfirmationView.as::_disposed
    private _disposed: boolean = false;

    // AS3: WiredChestWiredUpdateConfirmationView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: WiredChestWiredUpdateConfirmationView.as::_SafeStr_5527 (name derived: the settings screen)
    private _settingsUI: ChestSettingsUI | null;

    // AS3: WiredChestWiredUpdateConfirmationView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: WiredChestWiredUpdateConfirmationView.as::_chestId
    private _chestId: number = -1;

    // AS3: WiredChestWiredUpdateConfirmationView.as::_chestType
    private _chestType: number = 0;

    // AS3: WiredChestWiredUpdateConfirmationView.as::_chestItemType
    private _chestItemType: number = 0;

    /**
	 * The one condition that blocks the purchase. AS3 builds a nullable reason string with exactly
	 * one possible value, `rookie_chest` — the shape anticipates more reasons than the code has.
	 */
    // AS3: WiredChestWiredUpdateConfirmationView.as::_SafeStr_9541 (name derived: is a rookie chest)
    private _isRookieChest: boolean = false;

    // AS3: WiredChestWiredUpdateConfirmationView.as::WiredChestWiredUpdateConfirmationView()
    constructor(settingsUI: ChestSettingsUI)
    {
        this._settingsUI = settingsUI;
        this._windowManager = settingsUI.chestController?.windowManager ?? null;

        const xml = settingsUI.chestController?.assets?.getAssetByName('chest_wired_upgrade_xml')?.content ?? null;

        if(!xml || !this._windowManager)
        {
            // AS3 dereferences both unguarded and would throw; a missing layout is a shipping
            // problem rather than a code one, so it is reported instead.
            log.warn('chest_wired_upgrade_xml is not in the asset library — upgrade confirmation not built');

            return;
        }

        this._window = this._windowManager.buildFromXML(xml as string, 1) as unknown as IWindowContainer;
        this._window.enableLookupCache();

        this.closeButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.cancelButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.buyButton?.addEventListener('WME_CLICK', this.onBuyClicked);
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::onBuyClicked()
    private onBuyClicked = (): void =>
    {
        this.buyButton?.disable();
        this._settingsUI?.confirmUpgrade();
    };

    // AS3: WiredChestWiredUpdateConfirmationView.as::initialize()
    initialize(chestId: number, chestType: number, chestItemType: number, isRookieChest: boolean): void
    {
        this._chestId = chestId;
        this._chestType = chestType;
        this._chestItemType = chestItemType;
        this._isRookieChest = isRookieChest;

        this.updateUI();
    }

    /**
	 * Both buttons are re-enabled first, because the view is reused across opens and a previous
	 * purchase left the buy button dead.
	 */
    // AS3: WiredChestWiredUpdateConfirmationView.as::updateUI()
    private updateUI(): void
    {
        this.buyButton?.enable();
        this.cancelButton?.enable();

        const controller = this._settingsUI?.chestController ?? null;

        // A cached image comes back on the spot; anything else arrives via imageReady().
        const image = controller?.roomEngine?.getFurnitureImage(this._chestItemType, new Vector3d(90, 0, 0), 64, this);

        if(image?.data) this.showChestPreview(image.data);

        const reasonKey = this._isRookieChest ? 'wiredchests.upgrade.wired.error.reason.rookie_chest' : null;
        const error = this.errorText;

        if(error) error.visible = reasonKey !== null;

        if(reasonKey !== null && error)
        {
            this.buyButton?.disable();

            const localization = controller?.localization ?? null;

            error.text = localization?.getLocalizationWithParams(
                'wiredchests.upgrade.wired.error',
                '',
                'reason',
                localization?.getLocalization(reasonKey) ?? reasonKey
            ) ?? '';
        }
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::showChestPreview()
    private showChestPreview(bitmap: ImageBitmap | null): void
    {
        const image = this.productImage;

        if(image) image.bitmap = bitmap;
    }

    /**
	 * AS3 centres and activates **outside** the attach guard, so re-showing an already-open dialog
	 * re-centres it.
	 */
    // AS3: WiredChestWiredUpdateConfirmationView.as::show()
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

    // AS3: WiredChestWiredUpdateConfirmationView.as::hide()
    hide(): void
    {
        if(this._windowManager === null || this._window === null) return;

        if((this._window as unknown as IWindow).parent != null)
        {
            const desktop = this._windowManager.getDesktop(1) as unknown as IWindowContainer | null;

            if(desktop) desktop.removeChild(this._window as unknown as IWindow);
        }
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::onWindowClose()
    private onWindowClose = (event: {type: string}): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.hide();
    };

    // AS3: WiredChestWiredUpdateConfirmationView.as::imageReady()
    imageReady(_id: number, data: ImageBitmap | null): void
    {
        this.showChestPreview(data);
    }

    /**
	 * A failed image clears the preview rather than leaving the previous chest's artwork up.
	 */
    // AS3: WiredChestWiredUpdateConfirmationView.as::imageFailed()
    imageFailed(_id: number): void
    {
        this.showChestPreview(null);
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.hide();
        (this._window as unknown as IWindow | null)?.dispose();
        this._window = null;
        this._windowManager = null;
        this._settingsUI = null;
        this._disposed = true;
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::get productImage()
    get productImage(): IBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('product_image') as IBitmapWrapperWindow | null) ?? null;
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::get productNameText()
    get productNameText(): ITextWindow | null
    {
        return (this._window?.findChildByName('product_name') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::get errorText()
    get errorText(): ITextWindow | null
    {
        return (this._window?.findChildByName('error_text') as ITextWindow | null) ?? null;
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::get cancelButton()
    get cancelButton(): IWindow | null
    {
        return this._window?.findChildByName('cancel_button') ?? null;
    }

    // AS3: WiredChestWiredUpdateConfirmationView.as::get buyButton()
    get buyButton(): IWindow | null
    {
        return this._window?.findChildByName('buy_button') ?? null;
    }
}
