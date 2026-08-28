import type {IDisposable} from '@core/runtime/IDisposable';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';
import {
    EventLogMessageComposer
} from '@habbo/communication/messages/outgoing/tracking/EventLogMessageComposer';
import {
    UserRightsMessageEvent
} from '@habbo/communication/messages/incoming/handshake/UserRightsMessageEvent';
import type {UserRightsMessageParser} from '@habbo/communication/messages/parser/handshake/UserRightsMessageParser';
import type {HabboCatalog} from './HabboCatalog';
import type {VideoOfferTypeEnum} from './enum/VideoOfferTypeEnum';
import type {IVideoOfferLauncher} from './IVideoOfferLauncher';
import type {IVideoOfferManager} from './IVideoOfferManager';
import {PageBridge} from './offers/PageBridge';

const log = Logger.getLogger('habbo.catalog.VideoOfferManager');

/**
 * The SuperSaver rewarded-video ads: watch one, earn a credit.
 *
 * Everything happens through the surrounding page — the client asks it to fetch campaigns and to
 * play one, and the page calls back with how many are ready and when one opened, closed or
 * completed. `PageBridge` is the browser stand-in for `ExternalInterface`, exactly as the two ad
 * providers in `catalog/offers/` use it.
 *
 * **`enabled` is permanently false in this build, and that is transcribed, not a bug.** It starts
 * false, and the only assignment outside the constructor is `onUserRights()` writing `false` again
 * — for `securityLevel >= 1`, which every logged-in user has. Both source trees agree on that
 * line, so it is the shipped behaviour and not a decompile artefact: no callback is ever published,
 * `load()` returns immediately, and `launch()` always answers false. Anyone tempted to "fix" it to
 * `true` should note that the flag then also gates the four page callbacks, so the change is not
 * local to one line.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/VideoOfferManager.as
 */
export class VideoOfferManager implements IVideoOfferManager, IDisposable
{
    // AS3: VideoOfferManager.as::CAMPAIGN_READY_CALLBACK
    private static readonly CAMPAIGN_READY_CALLBACK: string = 'supersaverAdsOnCampaignsReady';

    // AS3: VideoOfferManager.as::CAMPAIGN_COMPLETE_CALLBACK
    private static readonly CAMPAIGN_COMPLETE_CALLBACK: string = 'supersaverAdsOnCampaignCompleted';

    // AS3: VideoOfferManager.as::CAMPAIGN_OPEN_CALLBACK
    private static readonly CAMPAIGN_OPEN_CALLBACK: string = 'supersaverAdsOnCampaignOpen';

    // AS3: VideoOfferManager.as::CAMPAIGN_CLOSE_CALLBACK
    private static readonly CAMPAIGN_CLOSE_CALLBACK: string = 'supersaverAdsOnCampaignClose';

    /** Derived name — `_SafeStr_10528`, named from its own value. */
    // AS3: VideoOfferManager.as::_SafeStr_10528
    private static readonly LOAD_CAMPAIGNS_CALL: string = 'supersaverAdsLoadCampaigns';

    /**
     * Derived name — `_SafeStr_10646`. The page-side typo ("Camapaign") is the contract and is
     * kept verbatim.
     */
    // AS3: VideoOfferManager.as::_SafeStr_10646
    private static readonly CAMPAIGN_ENGAGE_CALL: string = 'supersaverAdsCamapaignEngage';

    // AS3: VideoOfferManager.as::_disposed
    private _disposed: boolean = false;

    // AS3: VideoOfferManager.as::_catalog
    private _catalog: HabboCatalog | null;

    /** Derived name — `_SafeStr_5833`: the flag `get enabled()` returns. */
    // AS3: VideoOfferManager.as::_SafeStr_5833
    private _enabled: boolean;

    // AS3: VideoOfferManager.as::_offersAvailable
    private _offersAvailable: number = 0;

    // AS3: VideoOfferManager.as::_offersViewed
    private _offersViewed: number = 0;

    // AS3: VideoOfferManager.as::_offersRequested
    private _offersRequested: boolean = false;

    // AS3: VideoOfferManager.as::_offersReceived
    private _offersReceived: boolean = false;

    // AS3: VideoOfferManager.as::_launchers
    private _launchers: IVideoOfferLauncher[];

    // AS3: VideoOfferManager.as::_callbacksAdded
    private _callbacksAdded: boolean = false;

    // AS3: VideoOfferManager.as::VideoOfferManager()
    constructor(catalog: HabboCatalog)
    {
        this._catalog = catalog;
        this._launchers = [];
        this._enabled = false;

        catalog.connection?.addMessageEvent(new UserRightsMessageEvent(this.onUserRights));

        this.addCallbacks();
    }

    // AS3: VideoOfferManager.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: VideoOfferManager.as::get enabled()
    get enabled(): boolean
    {
        return this._enabled;
    }

    // AS3: VideoOfferManager.as::addCallbacks()
    private addCallbacks(): void
    {
        if(this._enabled && !this._callbacksAdded && PageBridge.available)
        {
            PageBridge.addCallback(VideoOfferManager.CAMPAIGN_READY_CALLBACK, this.onCampaignsReady);
            PageBridge.addCallback(VideoOfferManager.CAMPAIGN_COMPLETE_CALLBACK, this.onCampaignComplete);
            PageBridge.addCallback(VideoOfferManager.CAMPAIGN_OPEN_CALLBACK, this.onCampaignOpen);
            PageBridge.addCallback(VideoOfferManager.CAMPAIGN_CLOSE_CALLBACK, this.onCampaignClose);

            this._callbacksAdded = true;
        }
    }

    // AS3: VideoOfferManager.as::onUserRights()
    private onUserRights = (event: IMessageEvent): void =>
    {
        const parser = event.parser as UserRightsMessageParser | null;

        if(parser == null) return;

        if(parser.securityLevel >= 1)
        {
            this._enabled = false;

            this.addCallbacks();
        }
    };

    /**
     * Registers a launcher for the offer count. A launcher that asks before the page has answered
     * is queued, and the *first* one to ask is what triggers the fetch.
     */
    // AS3: VideoOfferManager.as::load()
    load(launcher: IVideoOfferLauncher): void
    {
        if(!this._enabled) return;

        if(this._offersRequested && this._offersReceived)
        {
            launcher.offersAvailable(this._offersAvailable);

            return;
        }

        if(!this._offersRequested && PageBridge.available)
        {
            PageBridge.call(VideoOfferManager.LOAD_CAMPAIGNS_CALL);

            this._offersRequested = true;
        }

        this._launchers.push(launcher);
    }

    /**
     * Plays one campaign, muting the client for its duration.
     *
     * The return value is not "did it play" but "is there another one after this one" — the toolbar
     * extension tears its promo bar down when it comes back false.
     */
    // AS3: VideoOfferManager.as::launch()
    launch(_type: VideoOfferTypeEnum): boolean
    {
        if(!this._enabled || this._offersAvailable < 1) return false;

        if(!PageBridge.available) return false;

        this._offersViewed += 1;

        PageBridge.call(VideoOfferManager.CAMPAIGN_ENGAGE_CALL);

        this.turnVolumeDown();

        this._catalog?.connection?.send(
            new EventLogMessageComposer('SuperSaverAds', 'client_action', 'supersaverads.video.promo.launched')
        );

        return this._offersAvailable > this._offersViewed;
    }

    // AS3: VideoOfferManager.as::onCampaignsReady()
    onCampaignsReady = (count: string): void =>
    {
        this._offersReceived = true;

        const parsed = parseInt(count, 10);

        this._offersAvailable = Number.isNaN(parsed) ? 0 : parsed;

        log.debug(`SuperSaver campaigns ready: ${this._offersAvailable}`);

        while(this._launchers.length > 0)
        {
            this._launchers.pop()?.offersAvailable(this._offersAvailable);
        }
    };

    // AS3: VideoOfferManager.as::onCampaignOpen()
    onCampaignOpen = (): void =>
    {
    };

    // AS3: VideoOfferManager.as::onCampaignClose()
    onCampaignClose = (): void =>
    {
        this.turnVolumeUp();

        this._catalog?.connection?.send(
            new EventLogMessageComposer('SuperSaverAds', 'client_action', 'supersaverads.video.promo.close')
        );
    };

    // AS3: VideoOfferManager.as::onCampaignComplete()
    onCampaignComplete = (): void =>
    {
        this.turnVolumeUp();

        this._catalog?.connection?.send(
            new EventLogMessageComposer('SuperSaverAds', 'client_action', 'supersaverads.video.promo.complete')
        );
    };

    // AS3: VideoOfferManager.as::turnVolumeDown()
    private turnVolumeDown(): void
    {
        this._catalog?.soundManager?.mute(true);
    }

    // AS3: VideoOfferManager.as::turnVolumeUp()
    private turnVolumeUp(): void
    {
        this._catalog?.soundManager?.mute(false);
    }

    // AS3: VideoOfferManager.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._catalog = null;
        this._launchers = [];
        this._enabled = false;

        if(this._callbacksAdded && PageBridge.available)
        {
            PageBridge.addCallback(VideoOfferManager.CAMPAIGN_READY_CALLBACK, null);
            PageBridge.addCallback(VideoOfferManager.CAMPAIGN_COMPLETE_CALLBACK, null);
            PageBridge.addCallback(VideoOfferManager.CAMPAIGN_OPEN_CALLBACK, null);
            PageBridge.addCallback(VideoOfferManager.CAMPAIGN_CLOSE_CALLBACK, null);

            this._callbacksAdded = false;
        }

        this._disposed = true;
    }
}
