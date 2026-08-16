import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import {
    IncomeRewardStatusMessageEvent
} from '@habbo/communication/messages/incoming/inventory/IncomeRewardStatusMessageEvent';
import type {
    IncomeRewardStatusMessageParser
} from '@habbo/communication/messages/parser/inventory/IncomeRewardStatusMessageParser';
import {
    IncomeRewardClaimResponseMessageEvent
} from '@habbo/communication/messages/incoming/inventory/IncomeRewardClaimResponseMessageEvent';
import type {
    IncomeRewardClaimResponseMessageParser
} from '@habbo/communication/messages/parser/inventory/IncomeRewardClaimResponseMessageParser';
import {
    IncomeRewardNotificationMessageEvent
} from '@habbo/communication/messages/incoming/inventory/IncomeRewardNotificationMessageEvent';

import type {IHabboCatalog} from '../IHabboCatalog';
import type {IEarningsController} from './IEarningsController';
import {EarningsView} from './EarningsView';

/**
 * The vault — everything the hotel owes the player, waiting to be collected.
 *
 * **It is reached only by a link.** `habboUI/open/vault` is the sole entry point: the notification
 * raised by 1914 carries that link, and so does whatever else opens the vault. Registering the
 * tracker *is* the wiring, which is why constructing this component is enough.
 *
 * **The purse indicator is computed once, from the first status message.** `_firstStatus` makes that
 * pass one-shot: any reward that is not duckets (`rewardType != 0`) and has an amount lights the dot,
 * and after that only a fresh notification or opening the vault moves it. AS3 never re-evaluates it
 * from later status messages, so a reward collected in another session does not clear the dot until
 * the vault is opened.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/earnings/EarningsController.as
 */
export class EarningsController extends Component implements ILinkEventTracker, IEarningsController
{
    // AS3: EarningsController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: EarningsController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: EarningsController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: EarningsController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: EarningsController.as::_notifications
    private _notifications: IHabboNotifications | null = null;

    // AS3: EarningsController.as::_catalog
    private _catalog: IHabboCatalog | null = null;

    // AS3: EarningsController.as::_toolbar
    private _toolbar: IHabboToolbar | null = null;

    // AS3: EarningsController.as::_SafeStr_4550 (name derived: the vault window)
    private _view: EarningsView | null = null;

    // AS3: EarningsController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: EarningsController.as::_SafeStr_8899 (name derived: the status pass is still the first)
    private _firstStatus: boolean = true;

    // AS3: EarningsController.as::_SafeStr_5992 (name derived: the purse indicator is lit)
    private _showingIndicator: boolean = false;

    // AS3: EarningsController.as::EarningsController()
    constructor(context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);
    }

    // AS3: EarningsController.as::get dependencies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => { this._communicationManager = manager; },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) => { this._sessionDataManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => { this._windowManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => { this._localizationManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboNotifications,
                (manager: IHabboNotifications | null) => { this._notifications = manager; }
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: IHabboCatalog | null) => { this._catalog = catalog; }
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) => { this._toolbar = toolbar; }
            ),
        ];
    }

    // AS3: EarningsController.as::initComponent()
    protected override initComponent(): void
    {
        this._messageEvents = [];

        this.addMessageEvent(new IncomeRewardStatusMessageEvent((event) => this.onIncomeRewardStatus(event)));
        this.addMessageEvent(new IncomeRewardClaimResponseMessageEvent((event) => this.onIncomeRewardClaimResponse(event)));
        this.addMessageEvent(new IncomeRewardNotificationMessageEvent(() => this.onIncomeRewardNotification()));

        this.context.addLinkEventTracker(this);
    }

    // AS3: EarningsController.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void
    {
        if(!this._communicationManager) return;

        this._communicationManager.addHabboConnectionMessageEvent(event);
        this._messageEvents.push(event);
    }

    // AS3: EarningsController.as::onIncomeRewardStatusMessageEvent()
    private onIncomeRewardStatus(event: IMessageEvent): void
    {
        const parser = event.parser as IncomeRewardStatusMessageParser | null;

        if(!parser) return;

        if(this._view !== null && !this._view.disposed)
        {
            this._view.onIncomeRewardDataReceived(parser.data);
        }

        if(!this._firstStatus) return;

        this._firstStatus = false;

        for(const reward of parser.data)
        {
            if(reward.rewardType !== 0 && reward.amount > 0)
            {
                this._showingIndicator = true;
                break;
            }
        }

        if(this._showingIndicator)
        {
            this._toolbar?.refreshPurseAreaIndicators();
        }
    }

    // AS3: EarningsController.as::onIncomeRewardClaimResponseMessageEvent()
    private onIncomeRewardClaimResponse(event: IMessageEvent): void
    {
        if(this._view === null || this._view.disposed) return;

        const parser = event.parser as IncomeRewardClaimResponseMessageParser | null;

        if(!parser) return;

        this._view.onIncomeRewardClaimResponse(parser.rewardCategory, parser.result);
    }

    /**
	 * The push is only a trigger: with the vault open, re-ask for the whole status rather than
	 * patching a row from a single byte. With it closed, light the indicator instead.
	 */
    // AS3: EarningsController.as::onIncomeRewardNotificationMessageEvent()
    private onIncomeRewardNotification(): void
    {
        this._notifications?.addItem('${notification.earning.new}', 'earning', null, 'habboUI/open/vault');

        if(this._view !== null)
        {
            this._sessionDataManager?.getIncomeRewardStatus();
        }

        if(this._view === null || this._view.disposed)
        {
            this._showingIndicator = true;
            this._toolbar?.refreshPurseAreaIndicators();
        }
    }

    // AS3: EarningsController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: EarningsController.as::openCatalogue()
    openCatalogue(): void
    {
        this.context.createLinkEvent('catalog/open');
    }

    // AS3: EarningsController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'habboUI/';
    }

    // AS3: EarningsController.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 3) return;

        if(parts[1] !== 'open') return;

        if(parts[2] === 'vault')
        {
            this.showEarnings();
        }
    }

    // AS3: EarningsController.as::withdrawVaultCredits()
    withdrawVaultCredits(): void
    {
        this._sessionDataManager?.withdrawCreditVault();
    }

    // AS3: EarningsController.as::claimReward()
    claimReward(rewardCategory: number): void
    {
        this._sessionDataManager?.claimReward(rewardCategory);
    }

    /**
	 * Opening the vault clears the indicator — the player is looking at what it was pointing to. The
	 * status request goes out before the window is built, so the first data message finds a view to
	 * fill.
	 */
    // AS3: EarningsController.as::showEarnings()
    private showEarnings(): void
    {
        if(this._showingIndicator)
        {
            this._showingIndicator = false;
            this._toolbar?.refreshPurseAreaIndicators();
        }

        this._sessionDataManager?.getIncomeRewardStatus();

        if(this._view === null || this._view.disposed)
        {
            this._view = new EarningsView(this, this._windowManager);
        }
    }

    // AS3: EarningsController.as::get showingIndicator()
    get showingIndicator(): boolean
    {
        return this._showingIndicator;
    }

    // AS3: EarningsController.as::removeView()
    removeView(): void
    {
        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }
    }

    // AS3: EarningsController.as::get catalog()
    get catalog(): IHabboCatalog | null
    {
        return this._catalog;
    }

    // TS-only: no AS3 counterpart; AS3's view reaches `_SafeStr_4593.assets` through the Component
    // base, which this port also provides — kept as a named accessor so the view reads the same way.
    get localization(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: EarningsController.as::dispose()
    override dispose(): void
    {
        if(this._communicationManager !== null)
        {
            for(const event of this._messageEvents)
            {
                this._communicationManager.removeHabboConnectionMessageEvent(event);
            }
        }

        this.removeView();
        this._messageEvents = [];

        super.dispose();
    }
}
