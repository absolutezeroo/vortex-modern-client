import {Logger} from '@core/utils/Logger';
import type {IOfferProvider} from './IOfferProvider';
import type {OfferCenter} from './OfferCenter';
import {PageBridge} from './PageBridge';

const log = Logger.getLogger('habbo.catalog.offers.SupersonicProvider');

/**
 * The Supersonic rewarded-video network.
 *
 * It keeps a *count* of campaigns rather than a boolean, and decrements it on each engage — so
 * `videoAvailable` goes false once the player has watched everything on offer, without waiting for
 * the page to say so.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/offers/SupersonicProvider.as
 */
export class SupersonicProvider implements IOfferProvider
{
    // AS3: SupersonicProvider.as::CAMPAIGN_READY_CALLBACK
    private static readonly CAMPAIGN_READY_CALLBACK: string = 'supersonicAdsOnCampaignsReady';

    // AS3: SupersonicProvider.as::CAMPAIGN_COMPLETED_CALLBACK
    private static readonly CAMPAIGN_COMPLETED_CALLBACK: string = 'supersonicAdsOnCampaignCompleted';

    // AS3: SupersonicProvider.as::CAMPAIGN_OPEN_CALLBACK
    private static readonly CAMPAIGN_OPEN_CALLBACK: string = 'supersonicAdsOnCampaignOpen';

    // AS3: SupersonicProvider.as::CAMPAIGN_CLOSE_CALLBACK
    private static readonly CAMPAIGN_CLOSE_CALLBACK: string = 'supersonicAdsOnCampaignClose';

    /** Name DERIVED — `_SafeStr_10528`, named for the page function it holds. */
    // AS3: SupersonicProvider.as::_SafeStr_10528
    private static readonly LOAD_CAMPAIGNS_FUNCTION: string = 'supersonicAdsLoadCampaigns';

    /** Name DERIVED — `_SafeStr_10646`. The page function's own name carries AS3's typo. */
    // AS3: SupersonicProvider.as::_SafeStr_10646
    private static readonly ENGAGE_FUNCTION: string = 'supersonicAdsCamapaignEngage';

    // AS3: SupersonicProvider.as::_disposed
    private _disposed: boolean = false;

    // AS3: SupersonicProvider.as::_offerCenter
    private _offerCenter: OfferCenter | null;

    // AS3: SupersonicProvider.as::_offerCount
    private _offerCount: number = 0;

    // AS3: SupersonicProvider.as::_showingPopup
    private _showingPopup: boolean = false;

    // AS3: SupersonicProvider.as::_loaded
    private _loaded: boolean = false;

    // AS3: SupersonicProvider.as::SupersonicProvider()
    constructor(offerCenter: OfferCenter)
    {
        this._offerCenter = offerCenter;

        if(!this.enabled) return;

        PageBridge.addCallback(SupersonicProvider.CAMPAIGN_READY_CALLBACK, this.onCampaignsReady);
        PageBridge.addCallback(SupersonicProvider.CAMPAIGN_COMPLETED_CALLBACK, this.onCampaignCompleted);
        PageBridge.addCallback(SupersonicProvider.CAMPAIGN_OPEN_CALLBACK, this.onCampaignOpen);
        PageBridge.addCallback(SupersonicProvider.CAMPAIGN_CLOSE_CALLBACK, this.onCampaignClose);
    }

    // AS3: SupersonicProvider.as::onCampaignsReady()
    onCampaignsReady = (count: string): void =>
    {
        this._offerCount = parseInt(count, 10) || 0;

        this.updateVideoStatus();
    };

    // AS3: SupersonicProvider.as::onCampaignOpen()
    onCampaignOpen = (): void =>
    {
        this._showingPopup = true;

        this.updateVideoStatus();
    };

    // AS3: SupersonicProvider.as::onCampaignClose()
    onCampaignClose = (): void =>
    {
        this._showingPopup = false;

        this.updateVideoStatus();
    };

    /** AS3's body is empty — the payout arrives over the wire, not through this callback. */
    // AS3: SupersonicProvider.as::onCampaignCompleted()
    onCampaignCompleted = (): void =>
    {
    };

    // AS3: SupersonicProvider.as::load()
    load(): void
    {
        if(!this.enabled || this._loaded) return;

        if(PageBridge.call(SupersonicProvider.LOAD_CAMPAIGNS_FUNCTION)) this._loaded = true;
        else log.warn(`External interface not working. Could not call ${SupersonicProvider.LOAD_CAMPAIGNS_FUNCTION}`);
    }

    // AS3: SupersonicProvider.as::showVideo()
    showVideo(): void
    {
        if(!this.enabled || this._offerCount <= 0) return;

        if(PageBridge.call(SupersonicProvider.ENGAGE_FUNCTION)) this._offerCount -= 1;
        else log.warn(`External interface not working. Could not call ${SupersonicProvider.ENGAGE_FUNCTION}`);
    }

    // AS3: SupersonicProvider.as::get videoAvailable()
    get videoAvailable(): boolean
    {
        return this._offerCount > 0;
    }

    // AS3: SupersonicProvider.as::get showingPopup()
    get showingPopup(): boolean
    {
        return this._showingPopup;
    }

    // AS3: SupersonicProvider.as::updateVideoStatus()
    private updateVideoStatus(): void
    {
        this._offerCenter?.updateVideoStatus();
    }

    // AS3: SupersonicProvider.as::get enabled()
    get enabled(): boolean
    {
        return (this._offerCenter?.configuration?.getBoolean('offers.supersonic.enabled') ?? false)
            && PageBridge.available;
    }

    // AS3: SupersonicProvider.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: SupersonicProvider.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(PageBridge.available)
        {
            PageBridge.addCallback(SupersonicProvider.CAMPAIGN_READY_CALLBACK, null);
            PageBridge.addCallback(SupersonicProvider.CAMPAIGN_COMPLETED_CALLBACK, null);
            PageBridge.addCallback(SupersonicProvider.CAMPAIGN_OPEN_CALLBACK, null);
            PageBridge.addCallback(SupersonicProvider.CAMPAIGN_CLOSE_CALLBACK, null);
        }

        this._offerCenter = null;
        this._disposed = true;
    }
}
