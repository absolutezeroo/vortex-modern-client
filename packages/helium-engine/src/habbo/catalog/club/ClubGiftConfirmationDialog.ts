import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IPurchasableOffer} from '../IPurchasableOffer';
import type {ClubGiftController} from './ClubGiftController';

/**
 * Confirmation dialog shown when picking which offer to redeem an available Club gift against.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/club/ClubGiftConfirmationDialog.as
 */
export class ClubGiftConfirmationDialog
{
    private _offer: IPurchasableOffer | null;

    private _controller: ClubGiftController | null;

    private _window: IWindowContainer | null = null;

    constructor(controller: ClubGiftController, offer: IPurchasableOffer)
    {
        this._offer = offer;
        this._controller = controller;

        this.showConfirmation();
    }

    dispose(): void
    {
        this._controller = null;
        this._offer = null;
        this._window?.dispose();
        this._window = null;
    }

    showConfirmation(): void
    {
        if(!this._offer || !this._controller) return;

        this._window = this.createWindow('club_gift_confirmation');

        if(!this._window) return;

        this._window.procedure = this.windowEventHandler;
        this._window.center();

        const itemName = this._window.findChildByName('item_name') as unknown as ITextWindow | null;

        if(itemName) itemName.text = this.getProductName();

        const imageBorder = this._window.findChildByName('image_border') as unknown as IWindowContainer | null;

        if(!imageBorder) return;

        if(!this._offer.productContainer) return;

        this._offer.productContainer.view = imageBorder;
        this._offer.productContainer.initProductIcon(this._controller.roomEngine!);
    }

    private getProductName(): string
    {
        if(this._offer?.product)
        {
            const productData = this._offer.product.productData;

            if(productData) return productData.name;
        }

        return '';
    }

    private windowEventHandler = (event: WindowEvent, window: IWindow): void =>
    {
        if(!event || !window || !this._controller || !this._offer) return;

        if(event.type !== WindowMouseEvent.CLICK) return;

        switch(window.name)
        {
            case 'select_button':
                this._controller.confirmSelection(this._offer.localizationId);

                break;
            case 'header_button_close':
            case 'cancel_button':
                this._controller.closeConfirmation();

                break;
        }
    };

    private createWindow(name: string): IWindowContainer | null
    {
        if(!this._controller?.assets || !this._controller?.windowManager) return null;

        return this._controller.catalog?.utils.createWindow(name) as unknown as IWindowContainer | null;
    }
}
