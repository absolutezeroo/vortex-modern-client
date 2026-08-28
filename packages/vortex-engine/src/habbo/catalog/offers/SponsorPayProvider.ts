import {Logger} from '@core/utils/Logger';
import type {IOfferProvider} from './IOfferProvider';
import type {OfferCenter} from './OfferCenter';
import {PageBridge} from './PageBridge';

const log = Logger.getLogger('habbo.catalog.offers.SponsorPayProvider');

/**
 * The SponsorPay rewarded-video network.
 *
 * Unlike Supersonic it has no campaign count, only an "offers available" flag the page sets — and a
 * **150-second dead-man timer**: if the page never reports the video closing, the provider closes it
 * itself, because a stuck popup would otherwise leave `showingPopup` true forever and the catalog
 * would refuse to offer another.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/offers/SponsorPayProvider.as
 */
export class SponsorPayProvider implements IOfferProvider
{
    // AS3: SponsorPayProvider.as::LOADED_CALLBACK
    private static readonly LOADED_CALLBACK: string = 'sponsorPayLoaded';

    // AS3: SponsorPayProvider.as::ON_START_CALLBACK
    private static readonly ON_START_CALLBACK: string = 'sponsorPayOnStart';

    // AS3: SponsorPayProvider.as::NO_OFFERS_CALLBACK
    private static readonly NO_OFFERS_CALLBACK: string = 'sponsorPayNoOffers';

    // AS3: SponsorPayProvider.as::ON_CLOSE_CALLBACK
    private static readonly ON_CLOSE_CALLBACK: string = 'sponsorPayOnClose';

    // AS3: SponsorPayProvider.as::ON_CONVERSION_CALLBACK
    private static readonly ON_CONVERSION_CALLBACK: string = 'sponsorPayOnConversion';

    /** Name DERIVED — `_SafeStr_11273`, named for the page function it holds. */
    // AS3: SponsorPayProvider.as::_SafeStr_11273
    private static readonly LOAD_INTEGRATION_FUNCTION: string = 'SponsorPay.loadIntegration';

    // AS3: SponsorPayProvider.as::SHOW_VIDEO_FUNCTION
    private static readonly SHOW_VIDEO_FUNCTION: string = 'SponsorPay.showVideo';

    // AS3: SponsorPayProvider.as::BACKGROUND_LOAD_FUNCTION
    private static readonly BACKGROUND_LOAD_FUNCTION: string = 'SponsorPay.backgroundLoad';

    /** Name DERIVED — `_SafeStr_10923`: how long a video may stay open before it is assumed gone. */
    // AS3: SponsorPayProvider.as::_SafeStr_10923
    private static readonly POPUP_TIMEOUT_MS: number = 150000;

    // AS3: SponsorPayProvider.as::_disposed
    private _disposed: boolean = false;

    // AS3: SponsorPayProvider.as::_offerCenter
    private _offerCenter: OfferCenter | null;

    // AS3: SponsorPayProvider.as::_loaded
    private _loaded: boolean = false;

    /** Name DERIVED — `_SafeStr_6648`: whether the page currently reports an offer to show. */
    // AS3: SponsorPayProvider.as::_SafeStr_6648
    private _offersAvailable: boolean = false;

    // AS3: SponsorPayProvider.as::_showingPopup
    private _showingPopup: boolean = false;

    // TS-only: AS3 uses a one-shot `flash.utils.Timer`; this is its handle.
    private _resetTimer: ReturnType<typeof setTimeout> | null = null;

    // AS3: SponsorPayProvider.as::SponsorPayProvider()
    constructor(offerCenter: OfferCenter)
    {
        this._offerCenter = offerCenter;

        if(!this.enabled) return;

        PageBridge.addCallback(SponsorPayProvider.LOADED_CALLBACK, this.sponsorPayLoaded);
        PageBridge.addCallback(SponsorPayProvider.ON_START_CALLBACK, this.sponsorPayOnStart);
        PageBridge.addCallback(SponsorPayProvider.NO_OFFERS_CALLBACK, this.sponsorPayNoOffers);
        PageBridge.addCallback(SponsorPayProvider.ON_CLOSE_CALLBACK, this.sponsorPayOnClose);
        PageBridge.addCallback(SponsorPayProvider.ON_CONVERSION_CALLBACK, this.sponsorPayOnConversion);
    }

    // AS3: SponsorPayProvider.as::get appId()
    private get appId(): string
    {
        return this._offerCenter?.configuration?.getProperty('offers.sponsorpay.appid') ?? '';
    }

    /** A second `load()` re-runs the background load rather than the integration. */
    // AS3: SponsorPayProvider.as::load()
    load(): void
    {
        if(this._loaded)
        {
            this.sponsorPayLoaded();

            return;
        }

        if(!this.enabled) return;

        if(PageBridge.call(SponsorPayProvider.LOAD_INTEGRATION_FUNCTION, this.appId)) this._loaded = true;
        else log.warn(`External interface not working. Could not call ${SponsorPayProvider.LOAD_INTEGRATION_FUNCTION}`);
    }

    // AS3: SponsorPayProvider.as::showVideo()
    showVideo(): void
    {
        if(!this._loaded || !this.enabled) return;

        if(!PageBridge.call(SponsorPayProvider.SHOW_VIDEO_FUNCTION))
        {
            log.warn(`External interface not working. Could not call ${SponsorPayProvider.SHOW_VIDEO_FUNCTION}`);

            return;
        }

        this._showingPopup = true;

        if(this._resetTimer !== null) clearTimeout(this._resetTimer);

        this._resetTimer = setTimeout(this.onResetTimer, SponsorPayProvider.POPUP_TIMEOUT_MS);

        this.updateVideoStatus();
    }

    // AS3: SponsorPayProvider.as::onResetTimer()
    private onResetTimer = (): void =>
    {
        this.sponsorPayOnClose();
    };

    /** Ignored while a video is up: the page reloading behind a popup would clear its own offer. */
    // AS3: SponsorPayProvider.as::sponsorPayLoaded()
    sponsorPayLoaded = (): void =>
    {
        if(this._showingPopup) return;

        this._offersAvailable = false;

        this.backgroundLoad();
    };

    // AS3: SponsorPayProvider.as::sponsorPayOnStart()
    sponsorPayOnStart = (_offer?: string): void =>
    {
        this._offersAvailable = true;

        this.updateVideoStatus();
    };

    // AS3: SponsorPayProvider.as::sponsorPayNoOffers()
    sponsorPayNoOffers = (): void =>
    {
        this._offersAvailable = false;

        this.updateVideoStatus();
    };

    /** AS3 puts `updateVideoStatus()` in a `finally`, so it runs even when the page call throws. */
    // AS3: SponsorPayProvider.as::sponsorPayOnClose()
    sponsorPayOnClose = (): void =>
    {
        this._showingPopup = false;

        if(this._resetTimer !== null)
        {
            clearTimeout(this._resetTimer);
            this._resetTimer = null;
        }

        try
        {
            this.backgroundLoad();
        }
        finally
        {
            this.updateVideoStatus();
        }
    };

    // AS3: SponsorPayProvider.as::sponsorPayOnConversion()
    sponsorPayOnConversion = (): void =>
    {
        this._offerCenter?.showSuccess();
    };

    /** The identical try/log pair AS3 writes out at both call sites. */
    // AS3: SponsorPayProvider.as::sponsorPayLoaded() / sponsorPayOnClose() (their shared body)
    private backgroundLoad(): void
    {
        if(!PageBridge.available)
        {
            log.warn(`External interface not available. Could not call ${SponsorPayProvider.BACKGROUND_LOAD_FUNCTION}.`);

            return;
        }

        if(!PageBridge.call(SponsorPayProvider.BACKGROUND_LOAD_FUNCTION))
        {
            log.warn(`External interface not working. Could not call ${SponsorPayProvider.BACKGROUND_LOAD_FUNCTION}`);
        }
    }

    // AS3: SponsorPayProvider.as::updateVideoStatus()
    private updateVideoStatus(): void
    {
        this._offerCenter?.updateVideoStatus();
    }

    // AS3: SponsorPayProvider.as::get videoAvailable()
    get videoAvailable(): boolean
    {
        return this._offersAvailable;
    }

    // AS3: SponsorPayProvider.as::get showingPopup()
    get showingPopup(): boolean
    {
        return this._showingPopup;
    }

    // AS3: SponsorPayProvider.as::get enabled()
    get enabled(): boolean
    {
        return this.appId !== '' && PageBridge.available;
    }

    // AS3: SponsorPayProvider.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: SponsorPayProvider.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(PageBridge.available)
        {
            PageBridge.addCallback(SponsorPayProvider.LOADED_CALLBACK, null);
            PageBridge.addCallback(SponsorPayProvider.ON_START_CALLBACK, null);
            PageBridge.addCallback(SponsorPayProvider.NO_OFFERS_CALLBACK, null);
            PageBridge.addCallback(SponsorPayProvider.ON_CLOSE_CALLBACK, null);
            PageBridge.addCallback(SponsorPayProvider.ON_CONVERSION_CALLBACK, null);
        }

        if(this._resetTimer !== null)
        {
            clearTimeout(this._resetTimer);
            this._resetTimer = null;
        }

        this._offerCenter = null;
        this._disposed = true;
    }
}
