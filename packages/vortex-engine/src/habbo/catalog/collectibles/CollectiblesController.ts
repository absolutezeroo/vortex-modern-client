import {Component} from '@core/runtime/Component';
import {ComponentDependency} from '@core/runtime/ComponentDependency';
import type {IContext} from '@core/runtime/IContext';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import {Logger} from '@core/utils/Logger';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';
import {RedeemNftLootBoxStateMessageEvent} from '@habbo/communication/messages/incoming/collectibles/RedeemNftLootBoxStateMessageEvent';
import {RedeemNftLootBoxResultMessageEvent} from '@habbo/communication/messages/incoming/collectibles/RedeemNftLootBoxResultMessageEvent';
import type {RedeemNftLootBoxStateMessageParser} from '@habbo/communication/messages/parser/collectibles/RedeemNftLootBoxStateMessageParser';
import type {RedeemNftLootBoxResultMessageParser} from '@habbo/communication/messages/parser/collectibles/RedeemNftLootBoxResultMessageParser';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';

import type {ICollectorHub} from './ICollectorHub';
import {BaseItemWrapper} from './renderer/model/BaseItemWrapper';
import {CollectibleRarity} from './util/CollectibleRarity';

const log = Logger.getLogger('habbo.catalog.collectibles.CollectiblesController');

/**
 * The collectibles hub: the `ICollectorHub` the rest of the client talks to, and the owner of the
 * collectibles *catalog* tab.
 *
 * What is ported here is the hub half — product naming, the two reward-box messages, and the
 * send/subscribe plumbing the tabs will need. The view half is not: `CollectiblesView` (582 l.) and
 * its five tabs are the bulk of `habbo/catalog/collectibles`, and every method below that would
 * reach into them says so at its own TODO rather than pretending.
 *
 * Registering it matters even without the views. `HabboCatalog.collectorHub` returned null, so
 * `getProductName()`/`getProductType()` had no implementation and the inventory's collectibles tab
 * was falling back to raw product codes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/CollectiblesController.as
 */
export class CollectiblesController extends Component implements ICollectorHub, ILinkEventTracker
{
    // AS3: CollectiblesController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;
    // AS3: CollectiblesController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;
    // AS3: CollectiblesController.as::_sessionDataManager
    private _sessionDataManager: ISessionDataManager | null = null;
    // AS3: CollectiblesController.as::_notifications
    private _notifications: IHabboNotifications | null = null;
    // AS3: CollectiblesController.as::_SafeStr_5769 (the disposed flag)
    private _controllerDisposed: boolean = false;

    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    /**
     * AS3 takes ten dependencies; the four below are the ones the hub half actually reads. The
     * other six (window manager, room engine, catalog, avatar renderer, free-flow chat, inventory)
     * are only ever used by `previewIcon()`/`previewImage()`/`createChatItemPreview()` and the view
     * construction, all of which are TODO here. Adding them now would be six hard edges on a
     * component that cannot use them yet — and an unsatisfiable dependency locks a component
     * silently.
     */
    // AS3: CollectiblesController.as::get dependencies()
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
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizationManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboNotifications,
                (notifications: IHabboNotifications | null) =>
                {
                    this._notifications = notifications;
                }
            ),
        ];
    }

    // AS3: CollectiblesController.as::initComponent()
    protected override initComponent(): void
    {
        this.context?.addLinkEventTracker(this);

        this.addMessageEvent(new RedeemNftLootBoxStateMessageEvent(this.onRedeemLootBoxStateEvent));
        this.addMessageEvent(new RedeemNftLootBoxResultMessageEvent(this.onRedeemLootBoxResultEvent));

        // TODO(AS3): AS3 also listens on the catalog's purse for
        // "catalog_purse_emerald_balance"/"catalog_purse_silver_balance" and calls updateView(),
        // whose whole body is `_view.updateBalances(catalog.getPurse())`. Nothing to update until
        // CollectiblesView is ported, so the two listeners are left off rather than wired to a
        // no-op.
    }

    // AS3: CollectiblesController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: CollectiblesController.as::get notifications()
    get notifications(): IHabboNotifications | null
    {
        return this._notifications;
    }

    // AS3: CollectiblesController.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: CollectiblesController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager === null) return;

        this._communicationManager.addMessageEvent(event);
    }

    // AS3: CollectiblesController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager === null) return;

        this._communicationManager.removeMessageEvent(event);
    }

    /**
     * Somebody, somewhere in the hotel, opened an NFT reward box.
     *
     * `start` is skipped outright — only the reveal is acted on. If it was us, AS3 opens the reward
     * window; if it was someone else, a "someone opened X" notification goes up carrying the
     * product and its rarity colour so the bubble can theme itself.
     */
    // AS3: CollectiblesController.as::onRedeemLootBoxStateEvent()
    private onRedeemLootBoxStateEvent = (event: IMessageEvent): void =>
    {
        const parser = event.parser as RedeemNftLootBoxStateMessageParser | null;

        if(parser === null || parser.reward === null) return;

        if(parser.start) return;

        const isOwnUser = this._sessionDataManager?.userId === parser.openerAvatarId;
        const product = new BaseItemWrapper(parser.reward);

        if(isOwnUser)
        {
            // TODO(AS3): `showLootBoxReward(product)` builds a CollectiblesRewardBoxView (204 l.,
            // sources/WIN63-.../catalog/collectibles/CollectiblesRewardBoxView.as) and shows the
            // drop. Unported, so our own box opens silently — the item still arrives, the
            // celebration does not.
            log.warn(
                'CollectiblesRewardBoxView is not ported: your reward box opened without showing '
                + `what came out (${this.getProductName(product)}).`
            );

            return;
        }

        const localization = this._localizationManager;
        const someone = localization?.getLocalization('generic.someone') ?? '';
        const text = localization?.getLocalizationWithParams(
            'collectibles.reward_box.notif.desc',
            '',
            'name', someone,
            'item', this.getProductName(product)
        ) ?? '';

        this._notifications?.addItem(text, 'nft_opening', null, null, {
            product,
            rarity: parser.reward.rarity,
            rarity_color: CollectibleRarity.getRarityColor(parser.reward.rarity),
        });
    };

    /**
     * Note both branches are `if`, not `else if` — AS3's. A result that is somehow both a failure
     * and a wrong-wallet raises two notifications; the codes are mutually exclusive on the wire, so
     * it never happens.
     */
    // AS3: CollectiblesController.as::onRedeemLootBoxResultEvent()
    private onRedeemLootBoxResultEvent = (event: IMessageEvent): void =>
    {
        const parser = event.parser as RedeemNftLootBoxResultMessageParser | null;

        if(parser === null) return;

        if(parser.fail)
        {
            this._notifications?.addItem(
                this._localizationManager?.getLocalization('generic.error') ?? '',
                'info',
                'icon_curator_stamp_large_png'
            );
        }

        if(parser.notInStarDustWallet)
        {
            this._notifications?.addItem(
                this._localizationManager?.getLocalization('collectibles.reward_box.wrong_wallet') ?? '',
                'info',
                'icon_curator_stamp_large_png'
            );
        }
    };

    /**
     * The localized product *category*.
     *
     * The seven cases are AS3's, and the default is the literal string "Unknown" — not a
     * localization key, and capitalised differently from the `"unknown"` that `getProductName()`
     * returns for a null product. Both spellings are AS3's.
     */
    // AS3: CollectiblesController.as::getProductType()
    getProductType(product: IProductDisplayInfo | null): string
    {
        if(product === null) return 'unknown';

        const localization = this._localizationManager;

        switch(product.productTypeId)
        {
            case 0:
                return localization?.getLocalization('product.type.wall') ?? '';
            case 1:
                return localization?.getLocalization('product.type.room') ?? '';
            case 2:
                return localization?.getLocalization('product.type.effect') ?? '';
            case 4:
                return localization?.getLocalization('product.type.badge') ?? '';
            case 9:
                return localization?.getLocalization('product.type.chatstyle') ?? '';
            case 10:
                return localization?.getLocalization('product.type.pets') ?? '';
            case 11:
                return localization?.getLocalization('product.type.clothing') ?? '';
            default:
                return 'Unknown';
        }
    }

    /**
     * The product's display name.
     *
     * AS3 switches on `productTypeId - -1`, i.e. `productTypeId + 1`, so every case label here is
     * one higher than the type id it matches — a decompiler artefact of a switch the compiler
     * rebased, not a different set of ids from `getProductType()` above. The `+ 1` is kept rather
     * than folded away so the two files still line up when read side by side.
     *
     * Note the two type ids that share a branch: 1 (wall, case 2) and 11 (case 12) both resolve
     * against floor-item data. That is AS3's, and it is why a clothing collectible can come back
     * as "(missing floor item)".
     */
    // AS3: CollectiblesController.as::getProductName()
    getProductName(product: IProductDisplayInfo | null): string
    {
        if(product === null) return 'unknown';

        const localization = this._localizationManager;
        const session = this._sessionDataManager;

        switch(product.productTypeId + 1)
        {
            case 0:
                return 'unknown';
            case 1:
            {
                const data = session?.getWallItemData(parseInt(product.itemTypeId, 10)) ?? null;

                if(data === null) return '(missing wall item)';

                return data.localizedName;
            }
            case 2:
            case 12:
            {
                const data = session?.getFloorItemData(parseInt(product.itemTypeId, 10)) ?? null;

                if(data === null) return '(missing floor item)';

                return data.localizedName;
            }
            case 3:
                return localization?.getLocalization(`fx_${product.itemTypeId}`) ?? '';
            case 5:
                return localization?.getBadgeName(product.itemTypeId) ?? '';
            case 10:
                return localization?.getLocalization('product.type.chatstyle') ?? '';
            case 11:
                return localization?.getLocalization(`pet.type.${product.itemTypeId}`) ?? '';
            default:
                log.warn(`Can not yet handle this type of product: ${product.productTypeId}`);

                return '(missing)';
        }
    }

    /**
     * TODO(AS3): forwards to `CollectiblesView.mintInventoryListWidget.amountChangedForItem()` so
     * the mint tab's counts follow the furni inventory. `MintInventoryListTab` (769 l.) is
     * unported, and this is a null check in AS3 too — with no view it is genuinely a no-op there
     * as well, which is why it stays silent rather than warning.
     */
    // AS3: CollectiblesController.as::itemAddedToInventory()
    itemAddedToInventory(_productTypeId: number, _itemTypeId: number, _isWallItem: boolean): void
    {
    }

    // AS3: CollectiblesController.as::itemRemovedFromInventory()
    itemRemovedFromInventory(_productTypeId: number, _itemTypeId: number, _isWallItem: boolean): void
    {
    }

    // AS3: CollectiblesController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'collectibles/';
    }

    // AS3: CollectiblesController.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2) return;

        if(parts[1] === 'open')
        {
            // TODO(AS3): `showCollectibleHub()` builds a CollectiblesView (582 l.) and its five
            // tabs (CollectionsTab 627, MintInventoryListTab 769, ShopTab 497, RewardClaimsTab 329,
            // TransferNftsTab 320) plus the renderer tree. ~4,200 lines, unported — so
            // `collectibles/open` opens nothing.
            log.warn('CollectiblesView is not ported: the collectibles hub cannot be opened.');
        }
    }

    // AS3: CollectiblesController.as::dispose()
    override dispose(): void
    {
        if(this._controllerDisposed)
        {
            super.dispose();

            return;
        }

        this._controllerDisposed = true;
        this._communicationManager = null;
        this._sessionDataManager = null;
        this._localizationManager = null;
        this._notifications = null;

        super.dispose();
    }
}
