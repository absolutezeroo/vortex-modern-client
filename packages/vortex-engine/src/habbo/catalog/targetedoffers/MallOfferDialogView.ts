import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {HabboMallOffer} from './data/HabboMallOffer';
import type {OfferController} from './OfferController';

/**
 * The full Habbo Mall offer dialog.
 *
 * Deliberately not an `OfferView` — a mall offer has no expiry and no purse check, so none of that
 * base's countdown machinery applies. Buying does not go over the wire either: "buy" opens the
 * credits habblet and the purchase happens on the web side.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/MallOfferDialogView.as
 */
export class MallOfferDialogView implements IDisposable
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferDialogView.as::_SafeStr_4593 (the controller)
    private _controller: OfferController | null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferDialogView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferDialogView.as::_offer
    private _offer: HabboMallOffer | null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferDialogView.as::MallOfferDialogView()
    constructor(controller: OfferController, offer: HabboMallOffer)
    {
        this._controller = controller;
        this._offer = offer;

        this._window = controller.catalog.windowManager?.buildWidgetLayout('targeted_offer_habbomall_xml') as IWindowContainer | null;

        if(this._window == null) return;

        const frameTitle = (this._window as unknown as IFrameWindow).title ?? null;

        if(frameTitle) frameTitle.text = this.getLocalization(offer.title);

        const title = this._window.findChildByName('txt_title') as unknown as ITextWindow | null;

        if(title) title.text = this.getLocalization(offer.title);

        if(offer.imageUrl && offer.imageUrl.length > 0)
        {
            const libraryUrl = controller.catalog.getProperty('image.library.url');
            const illustration = this._window.findChildByName('bmp_illustration') as unknown as IStaticBitmapWrapperWindow | null;

            if(illustration) illustration.assetUri = libraryUrl + offer.imageUrl;
        }

        this._window.procedure = this.onInput;
        this._window.center();
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferDialogView.as::onInput()
    private onInput = (event: WindowEvent, target: IWindow): void =>
    {
        if(!this._controller || !this._offer || event.type !== 'WME_DOWN') return;

        switch(target?.name)
        {
            case 'header_button_close':
                this._controller.onHabboMallOfferClosed(this._offer);
                break;
            case 'btn_buy':
                this._controller.onHabboMallOfferOpened(this._offer);
        }
    };

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferDialogView.as::getLocalization()
    private getLocalization(key: string, fallback: string | null = null): string
    {
        return this._controller?.catalog?.localization?.getLocalization(key, fallback ?? key) ?? key;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/MallOfferDialogView.as::dispose()
    dispose(): void
    {
        if(this._window != null)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    // TS-only: `IDisposable` requires it; the AS3 class has no disposed flag of its own.
    get disposed(): boolean
    {
        return this._window === null;
    }
}
