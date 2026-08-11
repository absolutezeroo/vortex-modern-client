import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {TargetedOffer} from './data/TargetedOffer';
import type {OfferController} from './OfferController';
import {OfferTimeFormatter} from './util/OfferTimeFormatter';

/**
 * What the three targeted-offer views share: the window, the one-second countdown, and the
 * localization pass that substitutes the offer's own numbers into the text.
 *
 * The timer is the reason this base exists at all — an offer with an expiry has to redraw its
 * remaining time every second, and reaching zero is what tears the view down.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/OfferView.as
 */
export class OfferView implements IDisposable
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::_window
    protected _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::_SafeStr_4593 (name from `get controller` usages)
    protected _controller: OfferController | null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::_offer
    protected _offer: TargetedOffer | null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::_SafeStr_4802 (the 1s countdown Timer)
    protected _updateTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::_disposed
    protected _disposed: boolean = false;

    /**
     * AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::_SafeStr_5574
     *
     * Name DERIVED: obfuscated in every tree. The localized countdown template, which contains a
     * `%timeleft%` placeholder the subclasses split around.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::_SafeStr_5574
    protected _timeLeftTemplate: string = '';

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::OfferView()
    constructor(controller: OfferController, offer: TargetedOffer | null)
    {
        this._controller = controller;
        this._offer = offer;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::get window()
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::startUpdateTimer()
    protected startUpdateTimer(): void
    {
        this._updateTimer = setInterval(this.onUpdateTimer, 1000);

        this.updateRemainingTime();
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::onUpdateTimer()
    protected onUpdateTimer = (): void =>
    {
        this.updateRemainingTime();
    };

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::updateRemainingTime()
    protected updateRemainingTime(): void
    {
        if(this._offer == null) return;

        this.setTimeLeft(OfferTimeFormatter.getStringFromSeconds(this._controller?.catalog?.localization ?? null, this._offer.getSecondsRemaining()));

        if(this._offer.getSecondsRemaining() === 0) this._controller?.destroyView();
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::setTimeLeft()
    protected setTimeLeft(text: string): void
    {
        const field = this._window?.findChildByName('txt_time_left') as unknown as ITextWindow | null;

        if(!field) return;

        field.text = this._timeLeftTemplate !== '' ? this._timeLeftTemplate.replace('%timeleft%', text) : text;
    }

    /**
     * Looks a key up and substitutes the offer's own numbers into it.
     *
     * The `%itemsleft%` pass is why offer text cannot simply go through the localization manager:
     * the placeholder is filled from the offer's remaining purchase limit, which only this view
     * knows.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::getLocalization()
    protected getLocalization(key: string, fallback: string | null = null): string | null
    {
        const text = this._controller?.catalog?.localization?.getLocalization(key, fallback ?? key) ?? null;

        if(!text) return null;

        if(this._offer) return text.replace('%itemsleft%', String(this._offer.purchaseLimit));

        return text;
    }

    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/OfferView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._updateTimer !== null)
        {
            clearInterval(this._updateTimer);
            this._updateTimer = null;
        }

        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}
