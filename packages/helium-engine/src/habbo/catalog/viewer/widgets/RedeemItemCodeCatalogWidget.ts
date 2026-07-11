import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowKeyboardEvent} from '@core/window/events/WindowKeyboardEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * Lets the user type a voucher code and redeem it via HabboCatalog.redeemVoucher().
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/RedeemItemCodeCatalogWidget.as
 */
export class RedeemItemCodeCatalogWidget extends CatalogWidget
{
    private _redeemButton: IWindow | null = null;
    private _voucherInput: ITextFieldWindow | null = null;

    constructor(window: IWindowContainer)
    {
        super(window);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this._redeemButton?.removeEventListener(WindowMouseEvent.CLICK, this.onRedeem);
        this._redeemButton = null;

        this._voucherInput?.removeEventListener(WindowKeyboardEvent.KEY_DOWN, this.windowKeyEventProcessor);
        this._voucherInput = null;

        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this._redeemButton = this.window.findChildByName('redeem');
        this._redeemButton?.addEventListener(WindowMouseEvent.CLICK, this.onRedeem);

        this._voucherInput = this.window.findChildByName('voucher_code') as unknown as ITextFieldWindow | null;
        this._voucherInput?.addEventListener(WindowKeyboardEvent.KEY_DOWN, this.windowKeyEventProcessor);

        return true;
    }

    private onRedeem = (_event: WindowMouseEvent): void =>
    {
        this.redeem();
    };

    private windowKeyEventProcessor = (event: WindowKeyboardEvent): void =>
    {
        if(event.charCode === 13) this.redeem();
    };

    private redeem(): void
    {
        const input = this.window.findChildByName('voucher_code');

        if(!input) return;

        const voucher = input.caption;

        if(voucher.length > 0)
        {
            this.page.viewer.catalog.redeemVoucher(voucher);
            input.caption = '';
        }
        else
        {
            this.page.viewer.catalog.windowManager?.alert(
                '${catalog.voucher.empty.title}',
                '${catalog.voucher.empty.desc}',
                0,
                (dialog): void => dialog.dispose()
            );
        }
    }
}
