import type {IContext} from '@core/runtime';
import {Component, ComponentDependency} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {
    HasClaimedProductResponseMessageEvent
} from '@habbo/communication/messages/incoming/catalog/HasClaimedProductResponseMessageEvent';
import type {
    HasClaimedProductResponseMessageParser
} from '@habbo/communication/messages/parser/catalog/HasClaimedProductResponseMessageParser';
import {
    HasClaimedProductComposer
} from '@habbo/communication/messages/outgoing/catalog/HasClaimedProductComposer';
import {ClaimProductComposer} from '@habbo/communication/messages/outgoing/catalog/ClaimProductComposer';
import type {HabboCatalog} from '../HabboCatalog';
import type {IHabboCatalog} from '../IHabboCatalog';
import type {ISpecialItemsDisplay} from './ISpecialItemsDisplay';
import type {ISpecialItem} from './model/ISpecialItem';
import {FurniSpecialItem} from './model/FurniSpecialItem';
import {SpecialItemsView} from './SpecialItemsView';

/** Where the free claim stands. */
// AS3: SpecialItemsController.as::CLAIM_STATE_*
export const SpecialItemClaimState = {
    // AS3: SpecialItemsController.as::CLAIM_STATE_NOT_APPLICABLE
    NOT_APPLICABLE: 0,

    // AS3: SpecialItemsController.as::CLAIM_STATE_FETCHING
    FETCHING: 1,

    // AS3: SpecialItemsController.as::CLAIM_STATE_BROWSING
    BROWSING: 2,

    // AS3: SpecialItemsController.as::CLAIM_STATE_CLAIMABLE
    CLAIMABLE: 3,

    // AS3: SpecialItemsController.as::CLAIM_STATE_CLAIMED
    CLAIMED: 4,
} as const;

/**
 * The special-items display: a hotel-configured set of products shown on a carousel, with an
 * optional free claim the player unlocks by looking at all of them.
 *
 * **The whole set is defined in the hotel's own configuration, not in a message.** A link like
 * `special_items_display/wf15` names the set, and `special_items.wf15.items` is a `;`-separated
 * list of `itemKey,type,className` triples. That is why the client ships no knowledge of any
 * particular set, and why an entry naming a furni this build does not have is simply dropped.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/special_items_display/SpecialItemsController.as
 */
export class SpecialItemsController extends Component implements ILinkEventTracker, ISpecialItemsDisplay
{
    // AS3: SpecialItemsController.as::ITEM_TYPE_FURNI
    public static readonly ITEM_TYPE_FURNI: string = 'furni';

    // AS3: SpecialItemsController.as::_catalog
    private _catalog: HabboCatalog | null = null;

    // AS3: SpecialItemsController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: SpecialItemsController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;

    // AS3: SpecialItemsController.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: SpecialItemsController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: SpecialItemsController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;

    // AS3: SpecialItemsController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: SpecialItemsController.as::_key
    private _key: string = '';

    // AS3: SpecialItemsController.as::_items
    private _items: ISpecialItem[] = [];

    // AS3: SpecialItemsController.as::_freeClaim
    private _freeClaim: string = '';

    /** Derived name — `_SafeStr_5072`: one of `SpecialItemClaimState`. */
    // AS3: SpecialItemsController.as::_SafeStr_5072
    private _claimState: number = SpecialItemClaimState.NOT_APPLICABLE;

    /** Derived name — `_SafeStr_4550`: the carousel, built on first open. */
    // AS3: SpecialItemsController.as::_SafeStr_4550
    private _view: SpecialItemsView | null = null;

    // AS3: SpecialItemsController.as::SpecialItemsController()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    // AS3: SpecialItemsController.as::get dependencies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return super.dependencies.concat([
            new ComponentDependency(IID_SessionDataManager, (manager: ISessionDataManager | null) =>
            {
                this._sessionDataManager = manager;
            }),
            new ComponentDependency(IID_HabboWindowManager, (manager: IHabboWindowManager | null) =>
            {
                this._windowManager = manager;
            }),
            new ComponentDependency(IID_HabboLocalizationManager, (manager: IHabboLocalizationManager | null) =>
            {
                this._localizationManager = manager;
            }),
            // Optional in AS3 too: the display opens outside a room as readily as inside one.
            new ComponentDependency(IID_RoomEngine, (engine: IRoomEngine | null) =>
            {
                this._roomEngine = engine;
            }, false),
            new ComponentDependency(IID_HabboCatalog, (catalog: IHabboCatalog | null) =>
            {
                this._catalog = catalog as HabboCatalog | null;
            }),
            new ComponentDependency(IID_HabboCommunicationManager, (manager: IHabboCommunicationManager | null) =>
            {
                this._communication = manager;
            }),
        ]);
    }

    // AS3: SpecialItemsController.as::initComponent()
    protected override initComponent(): void
    {
        this.context.addLinkEventTracker(this);

        this._messageEvents = [new HasClaimedProductResponseMessageEvent(this.onHasClaimedProductResponse)];

        for(const event of this._messageEvents) this.addMessageEvent(event);
    }

    /** Only answers about *this* set's claim, and only while one is outstanding. */
    // AS3: SpecialItemsController.as::onHasClaimedProductResponse()
    private onHasClaimedProductResponse = (event: IMessageEvent): void =>
    {
        const parser = event.parser as HasClaimedProductResponseMessageParser | null;

        if(parser === null) return;

        if(parser.claimId !== this._freeClaim || this._claimState !== SpecialItemClaimState.FETCHING) return;

        this._claimState = parser.hasClaimed ? SpecialItemClaimState.CLAIMED : SpecialItemClaimState.BROWSING;

        if(this._view !== null && this._view.isShowing()) this._view.updateClaimState();
    };

    /** Called by the view once every item has been looked at. */
    // AS3: SpecialItemsController.as::makeClaimable()
    makeClaimable(): void
    {
        if(this._freeClaim.length === 0) return;

        if(this._claimState !== SpecialItemClaimState.BROWSING) return;

        this._claimState = SpecialItemClaimState.CLAIMABLE;

        if(this._view !== null && this._view.isShowing()) this._view.updateClaimState();
    }

    /**
     * AS3: SpecialItemsController.as::makeClaim()
     *
     * Accepts BROWSING as well as CLAIMABLE — a deliberate looseness in AS3, kept — and marks the
     * claim taken immediately rather than waiting for the reply, so the button cannot be pressed
     * twice.
     */
    // AS3: SpecialItemsController.as::makeClaim()
    makeClaim(): void
    {
        if(this._freeClaim.length === 0) return;

        if(this._claimState !== SpecialItemClaimState.CLAIMABLE
            && this._claimState !== SpecialItemClaimState.BROWSING)
        {
            return;
        }

        this._communication?.connection?.send(new ClaimProductComposer(this._freeClaim));

        this._claimState = SpecialItemClaimState.CLAIMED;

        if(this._view !== null && this._view.isShowing()) this._view.updateClaimState();
    }

    // AS3: SpecialItemsController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'special_items_display/';
    }

    // AS3: SpecialItemsController.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2) return;

        this._key = parts[1];

        this.initialize();
    }

    // AS3: SpecialItemsController.as::initialize()
    initialize(): void
    {
        if(!this.parseSpecialItems()) return;

        if(this._freeClaim.length > 0)
        {
            this._claimState = SpecialItemClaimState.FETCHING;
            this._communication?.connection?.send(new HasClaimedProductComposer(this._freeClaim));
        }
        else
        {
            this._claimState = SpecialItemClaimState.NOT_APPLICABLE;
        }

        this.openView();
    }

    /**
     * AS3: SpecialItemsController.as::parseSpecialItems()
     *
     * `itemKey,type,className` triples separated by `;`. The index is only advanced for entries that
     * resolved, so a dropped furni does not leave a hole in the carousel's numbering.
     */
    // AS3: SpecialItemsController.as::parseSpecialItems()
    private parseSpecialItems(): boolean
    {
        const items: ISpecialItem[] = [];
        const configured = this.getProperty(`special_items.${this._key}.items`) ?? '';
        let index = 0;

        for(const entry of configured.split(';'))
        {
            const parts = entry.split(',', 3);
            const itemKey = parts[0];
            const type = parts[1];
            const className = parts[2];
            let item: ISpecialItem | null = null;

            if(type === SpecialItemsController.ITEM_TYPE_FURNI)
            {
                item = new FurniSpecialItem(index, this._key, itemKey, this, className);
            }

            if(item !== null && item.isValid)
            {
                items.push(item);
                index += 1;
            }
        }

        this._items = items;
        this._freeClaim = this.getProperty(`special_items.${this._key}.free_claim`) ?? '';

        return items.length > 0;
    }

    // AS3: SpecialItemsController.as::openView()
    private openView(): void
    {
        if(this._view === null && this._windowManager !== null)
        {
            this._view = new SpecialItemsView(this, this._windowManager);
        }

        if(this._view === null) return;

        this._view.displayNewData();

        if(!this._view.isShowing()) this._view.show();
    }

    // AS3: SpecialItemsController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        this._communication?.addHabboConnectionMessageEvent(event);
    }

    // AS3: SpecialItemsController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        this._communication?.removeHabboConnectionMessageEvent(event);
    }

    /** TS-only convenience: the view registers itself as a per-frame receiver through the context. */
    // TS-only: AS3 inherits registerUpdateReceiver() from its Component base; this port's base
    // exposes it on the context instead.
    registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void
    {
        this.context.registerUpdateReceiver(receiver, priority);
    }

    // TS-only: see registerUpdateReceiver() above.
    removeUpdateReceiver(receiver: IUpdateReceiver): void
    {
        this.context.removeUpdateReceiver(receiver);
    }

    // AS3: SpecialItemsController.as::get catalog()
    get catalog(): HabboCatalog | null
    {
        return this._catalog;
    }

    // AS3: SpecialItemsController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: SpecialItemsController.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    // AS3: SpecialItemsController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: SpecialItemsController.as::get roomEngine()
    get roomEngine(): IRoomEngine | null
    {
        return this._roomEngine;
    }

    // AS3: SpecialItemsController.as::get key()
    get key(): string
    {
        return this._key;
    }

    // AS3: SpecialItemsController.as::get items()
    get items(): ISpecialItem[]
    {
        return this._items;
    }

    // AS3: SpecialItemsController.as::get claimState()
    get claimState(): number
    {
        return this._claimState;
    }

    // AS3: SpecialItemsController.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        for(const event of this._messageEvents) this.removeMessageEvent(event);

        this._messageEvents = [];

        this._view?.dispose();
        this._view = null;
        this._items = [];

        super.dispose();
    }
}
