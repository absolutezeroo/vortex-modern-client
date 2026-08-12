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
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import {ImageResult} from '@habbo/room/ImageResult';
import {Vector3d} from '@room/utils/Vector3d';
import {RedeemNftLootBoxStateMessageEvent} from '@habbo/communication/messages/incoming/collectibles/RedeemNftLootBoxStateMessageEvent';
import {RedeemNftLootBoxResultMessageEvent} from '@habbo/communication/messages/incoming/collectibles/RedeemNftLootBoxResultMessageEvent';
import type {RedeemNftLootBoxStateMessageParser} from '@habbo/communication/messages/parser/collectibles/RedeemNftLootBoxStateMessageParser';
import type {RedeemNftLootBoxResultMessageParser} from '@habbo/communication/messages/parser/collectibles/RedeemNftLootBoxResultMessageParser';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {IID_HabboFreeFlowChat} from '@iid/IIDHabboFreeFlowChat';

import type {ICollectorHub} from './ICollectorHub';
import type {ICollectibleProductPreviewer} from './ICollectibleProductPreviewer';
import {BaseItemWrapper} from './renderer/model/BaseItemWrapper';
import {CollectibleRarity} from './util/CollectibleRarity';

const log = Logger.getLogger('habbo.catalog.collectibles.CollectiblesController');

/**
 * The collectibles hub: the `ICollectorHub` the rest of the client talks to, and the owner of the
 * collectibles *catalog* tab.
 *
 * What is ported here is the hub half — product naming, product previewing, the two reward-box
 * messages, and the send/subscribe plumbing the tabs will need. The view half is not:
 * `CollectiblesView` (582 l.) and its five tabs are the bulk of `habbo/catalog/collectibles`, and
 * every method below that would reach into them says so at its own TODO rather than pretending.
 *
 * `_freeFlowChat` is held and not yet read: both chat-style preview branches are TODO, because the
 * port's `IChatStyleLibrary` exposes no `selectorPreview` and AS3's large preview renders a whole
 * chat bubble to a BitmapData. The dependency is declared now so those two branches are a body
 * change rather than a dependency change.
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
    // AS3: CollectiblesController.as::_roomEngine
    private _roomEngine: IRoomEngine | null = null;
    // AS3: CollectiblesController.as::_catalog
    private _catalog: IHabboCatalog | null = null;
    // AS3: CollectiblesController.as::_avatarRenderManager
    private _avatarRenderManager: IAvatarRenderManager | null = null;
    // AS3: CollectiblesController.as::_freeFlowChat
    private _freeFlowChat: IHabboFreeFlowChat | null = null;
    // AS3: CollectiblesController.as::_SafeStr_5769 (the disposed flag)
    private _controllerDisposed: boolean = false;

    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    /**
     * AS3 takes ten; the eight below are the ones something here reads. The two left out are the
     * window manager and the inventory, which only the unported views use.
     *
     * **Only the communication manager is required**, exactly as in AS3 — everything else is
     * optional. That is not tidiness: a hard dependency on an IID nothing provides locks the
     * component forever with no log, and `IID_HabboCatalog` is a genuine cycle here, since
     * `HabboCatalog`'s own constructor is what builds this component.
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
            // AS3 marks this one optional explicitly (`false`); the rest take the default, which is
            // also optional.
            new ComponentDependency(
                IID_RoomEngine,
                (roomEngine: IRoomEngine | null) =>
                {
                    this._roomEngine = roomEngine;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: IHabboCatalog | null) =>
                {
                    this._catalog = catalog;
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
                IID_HabboFreeFlowChat,
                (chat: IHabboFreeFlowChat | null) =>
                {
                    this._freeFlowChat = chat;
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
     * Draws the *small* icon for a product into a preview surface.
     *
     * The `+ 1` on the switch is the same decompiler rebase `getProductName()` carries — see the
     * note there. Icons and images differ in more than size: an icon asks the room engine for the
     * cached `getFurnitureIcon`/`getWallItemIcon`, while `previewImage()` below asks for a real
     * render at a direction and scale.
     *
     * The wall branch is gated on `tempCategoryMapping()`, so most wall items fall through to a
     * cleared previewer rather than showing an icon. That gate is AS3's, name included.
     */
    // AS3: CollectiblesController.as::previewIcon()
    previewIcon(product: IProductDisplayInfo | null, previewer: ICollectibleProductPreviewer): void
    {
        if(product === null)
        {
            previewer.setUnknownImage();

            return;
        }

        const session = this._sessionDataManager;

        switch(product.productTypeId + 1)
        {
            case 0:
                previewer.setUnknownImage();
                break;
            case 1:
            {
                const data = session?.getWallItemData(parseInt(product.itemTypeId, 10)) ?? null;

                if(data === null || this._roomEngine === null)
                {
                    previewer.clearPreviewer();
                    break;
                }

                if(CollectiblesController.tempCategoryMapping('I', data.id) === 1)
                {
                    previewer.imageResult = this._roomEngine.getWallItemIcon(data.id, previewer);
                    break;
                }

                previewer.clearPreviewer();
                break;
            }
            case 2:
            case 12:
            {
                const data = session?.getFloorItemData(parseInt(product.itemTypeId, 10)) ?? null;

                if(data === null || this._roomEngine === null)
                {
                    previewer.clearPreviewer();
                    break;
                }

                previewer.imageResult = this._roomEngine.getFurnitureIcon(data.id, previewer);
                break;
            }
            case 3:
            {
                const result = new ImageResult();

                result.data = this._catalog?.getPixelEffectIcon(parseInt(product.itemTypeId, 10)) ?? null;
                previewer.imageResult = result;
                break;
            }
            case 5:
                previewer.badgeResult = product.itemTypeId;
                break;
            case 10:
                // TODO(AS3): AS3 draws the chat-style swatch from
                // `_freeFlowChat.chatStyleLibrary.getStyle(id).selectorPreview`. The port's
                // IChatStyleLibrary exposes no `selectorPreview`, so there is nothing to hand over
                // yet — cleared rather than left showing the previous product.
                previewer.clearPreviewer();
                break;
            case 11:
                previewer.petResult = product.petFigureString;
                break;
            default:
                log.warn(`Can not yet handle this type of product: ${product.productTypeId}`);
                previewer.clearPreviewer();
                break;
        }
    }

    /**
     * Draws the *large* image for a product.
     *
     * Differs from `previewIcon()` in five of its eight branches: furni is rendered at direction 90
     * and scale 64 rather than icon-cached, effects go to the avatar previewer instead of a pixel
     * icon, and type 11 (case 12) resolves an avatar figure out of the product's figure set rather
     * than falling in with the floor items.
     */
    // AS3: CollectiblesController.as::previewImage()
    previewImage(product: IProductDisplayInfo | null, previewer: ICollectibleProductPreviewer): void
    {
        if(product === null)
        {
            previewer.setUnknownImage();

            return;
        }

        // TODO(AS3): AS3 first calls `handlePreviewImageEasterEgg()`, which counts repeat previews
        // of the same product and, at a threshold, sends a `wf15` developer command. It reads
        // `_SafeStr_9632`/`_SafeStr_9633`/`_SafeStr_5413` — all obfuscated, and the trigger
        // condition depends on a string index this port cannot verify. Left out deliberately
        // rather than guessed: it sends a message.

        const session = this._sessionDataManager;

        switch(product.productTypeId + 1)
        {
            case 0:
                previewer.setUnknownImage();
                break;
            case 1:
            {
                const data = session?.getWallItemData(parseInt(product.itemTypeId, 10)) ?? null;

                if(data === null || this._roomEngine === null)
                {
                    previewer.clearPreviewer();
                    break;
                }

                if(CollectiblesController.tempCategoryMapping('I', data.id) === 1)
                {
                    previewer.imageResult = this._roomEngine.getWallItemImage(
                        data.id, new Vector3d(90), 64, previewer
                    );
                    break;
                }

                previewer.clearPreviewer();
                break;
            }
            case 2:
            {
                const data = session?.getFloorItemData(parseInt(product.itemTypeId, 10)) ?? null;

                if(data === null || this._roomEngine === null)
                {
                    previewer.clearPreviewer();
                    break;
                }

                previewer.imageResult = this._roomEngine.getFurnitureImage(
                    data.id, new Vector3d(90, 0, 0), 64, previewer
                );
                break;
            }
            case 3:
                if(product.itemTypeId === '')
                {
                    previewer.clearPreviewer();
                    break;
                }

                previewer.setEffectResult(session?.figure ?? '', parseInt(product.itemTypeId, 10));
                break;
            case 5:
                previewer.badgeResult = product.itemTypeId;
                break;
            case 10:
                // TODO(AS3): the chat-bubble preview — see `previewIcon()`'s case 10. AS3 renders a
                // whole PooledChatBubble to a BitmapData here (`createChatItemPreview()`), which is
                // Flash display-list drawing with no direct equivalent in this port.
                previewer.clearPreviewer();
                break;
            case 11:
                previewer.petResult = product.petFigureString;
                break;
            case 12:
            {
                const figure = this._avatarRenderManager?.getFigureStringWithFigureIds(
                    session?.figure ?? '',
                    session?.gender ?? '',
                    product.figureSetIds
                ) ?? '';

                previewer.avatarResult = figure;
                break;
            }
            default:
                log.warn(`Can not yet handle this type of product: ${product.productTypeId}`);
                previewer.clearPreviewer();
                break;
        }
    }

    /**
     * AS3's name, and AS3's shape: a hard-coded table standing in for a real category lookup.
     * `"S"` is always 1; `"I"` is 2, 3 or 4 for three specific wall-item ids and 1 otherwise;
     * anything else is 1. Only the `"I"` path is ever called, and only its `=== 1` result is
     * tested — so the three special ids are exactly the wall items that do *not* get a preview.
     */
    // AS3: CollectiblesController.as::tempCategoryMapping()
    private static tempCategoryMapping(kind: string, itemTypeId: number): number
    {
        if(kind === 'S') return 1;

        if(kind === 'I')
        {
            if(itemTypeId === 3001) return 2;
            if(itemTypeId === 3002) return 3;
            if(itemTypeId === 4057) return 4;

            return 1;
        }

        return 1;
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
