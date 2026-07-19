import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboCatalog} from '../HabboCatalog';

/**
 * Standalone "VIP benefits" info popup, opened from the VIP buy widget's benefits link.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/VipBenefitsWindow.as
 */
export class VipBenefitsWindow implements IDisposable
{
    private _disposed: boolean = false;

    private _window: IWindowContainer | null;

    constructor(catalog: HabboCatalog)
    {
        this._window = catalog.utils.createWindow('vip_benefits') as unknown as IWindowContainer | null;

        this._window?.findChildByName('header_button_close')?.addEventListener(WindowMouseEvent.CLICK, this.onClose);
        this._window?.center();
    }

    dispose(): void
    {
        if(this._disposed) return;

        this._window?.dispose();
        this._window = null;
        this._disposed = true;
    }

    get disposed(): boolean
    {
        return this._disposed;
    }

    private onClose = (_event: WindowMouseEvent): void =>
    {
        this.dispose();
    };
}
