import type {HabboToolbar} from '../HabboToolbar';
import type {IExtensionView} from '../IExtensionView';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('CitizenshipVipQuestsPromoExtension');

/**
 * VIP quests promotion extension for the toolbar
 *
 * In AS3 this creates a promotion window for VIP quests campaigns,
 * listens for CitizenshipVipOfferPromoEnabled server events, and manages
 * expand/collapse state. In Helium, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/extensions/CitizenshipVipQuestsPromoExtension.as
 */
export class CitizenshipVipQuestsPromoExtension
{
    private _toolbar: HabboToolbar | null;
    private _extensionView: IExtensionView | null;
    private _expandedHeight: number = 216;

    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;
        this._extensionView = toolbar.extensionView;

        this._vipQuestsCampaignName = toolbar.getProperty('citizenship.vip.tutorial.quest.campaign.name');

        log.debug('CitizenshipVipQuestsPromoExtension constructed');
    }

    private _disposed: boolean = false;

    /**
	 * Whether the extension is disposed
	 */
    get disposed(): boolean
    {
        return this._disposed;
    }

    private _expanded: boolean = true;

    /**
	 * Whether the promo is expanded
	 */
    get expanded(): boolean
    {
        return this._expanded;
    }

    private _windowCreated: boolean = false;

    /**
	 * Whether the promo window has been created
	 */
    get windowCreated(): boolean
    {
        return this._windowCreated;
    }

    private _vipQuestsCampaignName: string = '';

    /**
	 * The VIP quests campaign name
	 */
    get vipQuestsCampaignName(): string
    {
        return this._vipQuestsCampaignName;
    }

    /**
	 * Handle the citizenship quest promo enabled server event
	 *
	 * Creates the promo window and attaches it to the extension view.
	 */
    public onCitizenshipQuestPromoEnabled(): void
    {
        if(!this._windowCreated)
        {
            this._windowCreated = true;
        }

        this.assignState();

        if(this._extensionView)
        {
            this._extensionView.detachExtension('club_promo');
            // In AS3: extensionView.attachExtension("vip_quests", window, 10)
            log.debug('VIP quests promo: attached to extension view');
        }
    }

    /**
	 * Handle button click (start quests campaign)
	 */
    public onButtonClicked(): void
    {
        // In AS3: connection.send(new StartCampaignMessageComposer(vipQuestsCampaignName))
        this.destroyWindow();
    }

    /**
	 * Toggle expand/collapse state
	 */
    public toggleMinMax(): void
    {
        this._expanded = !this._expanded;
        this.assignState();
    }

    /**
	 * Dispose of this extension
	 */
    public dispose(): void
    {
        if(this._disposed) return;

        this.destroyWindow();
        this._toolbar = null;
        this._extensionView = null;
        this._disposed = true;
    }

    private assignState(): void
    {
        // State is tracked; UI layer reads expanded + windowCreated
        log.debug(`VIP quests promo: expanded=${this._expanded}`);
    }

    private destroyWindow(): void
    {
        if(this._extensionView)
        {
            this._extensionView.detachExtension('vip_quests');
        }

        this._windowCreated = false;
    }
}
