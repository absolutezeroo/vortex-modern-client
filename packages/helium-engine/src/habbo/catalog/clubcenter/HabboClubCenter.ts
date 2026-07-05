import {Component} from '@core/runtime/Component';
import {ComponentDependency} from '@core/runtime/ComponentDependency';
import type {IContext} from '@core/runtime/IContext';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboClubCenter} from './IHabboClubCenter';
import {BadgeResolver} from './util/BadgeResolver';
import {ClubStatus} from './util/ClubStatus';
import {ClubCenterView} from './ClubCenterView';
import {ClubSpecialInfoBubbleView} from './ClubSpecialInfoBubbleView';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {ScrKickbackData} from '@habbo/communication/messages/incoming/users/ScrKickbackData';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';

import {ClubGiftInfoEvent} from '@habbo/communication/messages/incoming/catalog/ClubGiftInfoEvent';
import type {ClubGiftInfoEventParser} from '@habbo/communication/messages/parser/catalog/ClubGiftInfoEventParser';
import {GetClubGiftMessageComposer} from '@habbo/communication/messages/outgoing/catalog/GetClubGiftMessageComposer';
import {ScrSendKickbackInfoMessageEvent} from '@habbo/communication/messages/incoming/users/ScrSendKickbackInfoMessageEvent';
import {ScrGetKickbackInfoMessageComposer} from '@habbo/communication/messages/outgoing/users/ScrGetKickbackInfoMessageComposer';
import {BadgesMessageEvent} from '@habbo/communication/messages/incoming/inventory/badges/BadgesMessageEvent';
import type {BadgesMessageParser} from '@habbo/communication/messages/parser/inventory/badges/BadgesMessageParser';
import {GetBadgesComposer} from '@habbo/communication/messages/outgoing/inventory/GetBadgesComposer';

const log = Logger.getLogger('HabboClubCenter');

/**
 * Habbo Club Center manager.
 *
 * Owns the club center popup (status/badge/gift-count) and the payday
 * breakdown bubble, and reassembles paginated badge/kickback data needed
 * to populate them.
 *
 * @see sources/win63_version/habbo/catalog/clubcenter/HabboClubCenter.as
 */
export class HabboClubCenter extends Component implements IHabboClubCenter, ILinkEventTracker
{
    // AS3: DATA_UPDATE_INTERVAL_MSEC
    private static readonly DATA_UPDATE_INTERVAL_MSEC: number = 10000;

    private _communicationManager: IHabboCommunicationManager | null = null;
    private _sessionDataManager: ISessionDataManager | null = null;
    private _avatarRenderManager: IAvatarRenderManager | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _localizationManager: IHabboLocalizationManager | null = null;
    private _catalog: IHabboCatalog | null = null;
    private _toolbar: IHabboToolbar | null = null;
    private _offerCenter: unknown | null = null;

    private _messageEvents: IMessageEvent[] = [];

    private _view: ClubCenterView | null = null;
    private _breakdownView: ClubSpecialInfoBubbleView | null = null;
    private _kickbackData: ScrKickbackData | null = null;
    private _updatePending: boolean = false;
    private _lastUpdateTime: number = -HabboClubCenter.DATA_UPDATE_INTERVAL_MSEC;
    private _resolvedBadgeId: string | null = null;
    private _giftsAvailable: number = 0;
    private _videoOfferPending: boolean = false;

    // AS3: badge-list fragment reassembly (per-fragment badge id lists, keyed by fragmentNo)
    private _badgeFragments: Map<number, string[]> | null = null;

    constructor(context: IContext)
    {
        super(context);
    }

    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communicationManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) =>
                {
                    this._sessionDataManager = manager;
                }
            ),
            new ComponentDependency(
                IID_AvatarRenderManager,
                (manager: IAvatarRenderManager | null) =>
                {
                    this._avatarRenderManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizationManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: IHabboCatalog | null) =>
                {
                    this._catalog = catalog;
                }
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) =>
                {
                    this._toolbar = toolbar;
                },
                false
            ),
        ];
    }

    protected override initComponent(): void
    {
        this.addMessageEvent(new ClubGiftInfoEvent(this.onClubGiftInfo));
        this.addMessageEvent(new ScrSendKickbackInfoMessageEvent(this.onKickbackInfoMessageEvent));
        this.addMessageEvent(new BadgesMessageEvent(this.onBadges));

        this.context.addLinkEventTracker(this);

        // TODO(AS3): sources/win63_version/habbo/catalog/clubcenter/HabboClubCenter.as::initComponent()
        // AS3 gates the "earn credits via video" offer button behind
        // `offers.enabled`+`offers.habboclub.enabled` and wires a real
        // IOfferCenter via `catalog.getOfferCenter(this)`. The offer center
        // system isn't ported yet (catalog/offers/ is empty) — getOfferCenter()
        // already returns null, so this stays inert, matching what happens in
        // AS3 when those config flags are off.
        if(this.getBoolean('offers.enabled') && this.getBoolean('offers.habboclub.enabled'))
        {
            this._offerCenter = this._catalog?.getOfferCenter(this) ?? null;
        }

        log.debug('HabboClubCenter initialized');
    }

    // AS3: sources/win63_version/habbo/catalog/clubcenter/HabboClubCenter.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        if(this._communicationManager)
        {
            for(const event of this._messageEvents)
            {
                this._communicationManager.removeHabboConnectionMessageEvent(event);
            }
        }

        this.context.removeLinkEventTracker(this);

        this._offerCenter = null;
        this._kickbackData = null;
        this._messageEvents = [];

        this.removeView();

        this._communicationManager = null;

        super.dispose();

        log.debug('HabboClubCenter disposed');
    }

    // --- ILinkEventTracker ---

    get linkPattern(): string
    {
        return 'habboUI/';
    }

    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 3) return;

        if(parts[1] === 'open' && parts[2] === 'hccenter')
        {
            this.showClubCenter();
        }
    }

    // --- IHabboClubCenter ---

    get localization(): IHabboLocalizationManager | null
    {
        return this._catalog?.localization ?? null;
    }

    get avatarRenderManager(): IAvatarRenderManager | null
    {
        return this._avatarRenderManager;
    }

    get offerCenter(): unknown | null
    {
        return this._offerCenter;
    }

    get stage(): unknown | null
    {
        return this._windowManager?.getDesktop(1) ?? null;
    }

    removeView(): void
    {
        if(this._view)
        {
            this._view.dispose();
            this._view = null;
        }

        this.removeBreakdown();
    }

    removeBreakdown(): void
    {
        if(this._breakdownView)
        {
            this._breakdownView.dispose();
            this._breakdownView = null;
        }
    }

    openPurchasePage(): void
    {
        this._catalog?.openCatalogPage('hc_membership', 'NORMAL');
    }

    openClubGiftPage(): void
    {
        this._catalog?.openCatalogPage('club_gifts', 'NORMAL');
    }

    showPaydayBreakdownView(): void
    {
        if(this._breakdownView)
        {
            this.removeBreakdown();

            return;
        }

        if(!this._windowManager || !this._kickbackData || !this._view) return;

        const anchor = this._view.getSpecialCalloutAnchor();

        if(!anchor) return;

        this._breakdownView = new ClubSpecialInfoBubbleView(this, this._windowManager, this._kickbackData, anchor);
    }

    openPaydayHelpPage(): void
    {
        this.context.createLinkEvent('habbopages/hcpayday');
    }

    openHelpPage(): void
    {
        this.context.createLinkEvent('habbopages/habboclub');
    }

    getOffers(): void
    {
        this._catalog?.getHabboClubOffers(3);
    }

    isKickbackEnabled(): boolean
    {
        const value = this.getProperty('hccenter.activity.enabled');

        if(!value) return true;

        return value === '1' || value === 'true';
    }

    indicateVideoAvailable(available: boolean): void
    {
        if(this._view)
        {
            this._videoOfferPending = false;
            this._view.setVideoOfferButtonVisibility(available, this._offerCenter !== null);
        }
        else
        {
            this._videoOfferPending = available;
        }
    }

    // --- Internal ---

    private showClubCenter(): void
    {
        if(!this._windowManager || !this._sessionDataManager) return;

        if(!this._view)
        {
            this._view = new ClubCenterView(this, this._windowManager, this._sessionDataManager.figure);
        }

        if(this.updateNeeded())
        {
            this.updateData();
        }
        else
        {
            this.populate();
        }

        if(this._offerCenter && this._view && this._videoOfferPending)
        {
            this._videoOfferPending = false;
            this.indicateVideoAvailable(true);
        }
    }

    private resolveClubStatus(): string
    {
        const purse = this._catalog?.getPurse() ?? null;

        if(!purse) return ClubStatus.NONE;

        if(purse.clubDays > 0) return ClubStatus.ACTIVE;

        if(purse.pastClubDays > 0 || purse.pastVipDays > 0) return ClubStatus.EXPIRED;

        return ClubStatus.NONE;
    }

    private updateNeeded(): boolean
    {
        return !this._updatePending && performance.now() - this._lastUpdateTime > HabboClubCenter.DATA_UPDATE_INTERVAL_MSEC;
    }

    private updateData(): void
    {
        if(!this._communicationManager?.connection) return;

        this._updatePending = true;
        this._communicationManager.connection.send(new GetBadgesComposer());
        this._communicationManager.connection.send(new GetClubGiftMessageComposer());
        this._communicationManager.connection.send(new ScrGetKickbackInfoMessageComposer());
    }

    private populate(): void
    {
        this._view?.dataReceived(
            this._kickbackData,
            this._catalog?.getPurse() ?? null,
            this._giftsAvailable,
            this.resolveClubStatus(),
            this._resolvedBadgeId
        );
    }

    private addMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager) return;

        this._messageEvents.push(this._communicationManager.addMessageEvent(event));
    }

    private onKickbackInfoMessageEvent = (event: IMessageEvent): void =>
    {
        this._kickbackData = (event as ScrSendKickbackInfoMessageEvent).data;
        this._updatePending = false;
        this._lastUpdateTime = performance.now();
        this.populate();
    };

    private onClubGiftInfo = (event: IMessageEvent): void =>
    {
        const parser = event.parser as ClubGiftInfoEventParser | null;

        if(!parser) return;

        this._giftsAvailable = parser.giftsAvailable;
        this.populate();
    };

    private onBadges = (event: IMessageEvent): void =>
    {
        const parser = event.parser as BadgesMessageParser | null;

        if(!parser) return;

        if(this._badgeFragments === null)
        {
            this._badgeFragments = new Map();
        }

        this._badgeFragments.set(parser.fragmentNo, parser.badges.map((badge) => badge.badgeId));

        if(this._badgeFragments.size < parser.totalFragments) return;

        const allBadgeIds: string[] = [];

        for(let i = 0; i < parser.totalFragments; i++)
        {
            const fragment = this._badgeFragments.get(i);

            if(!fragment) return;

            allBadgeIds.push(...fragment);
        }

        this._badgeFragments = null;
        this._resolvedBadgeId = BadgeResolver.resolveClubBadgeId(allBadgeIds);
        this.populate();
    };
}
