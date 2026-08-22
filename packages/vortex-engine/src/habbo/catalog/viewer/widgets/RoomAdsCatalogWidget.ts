import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {RoomAdPurchaseInfoMessageEvent} from '@habbo/communication/messages/incoming/catalog/RoomAdPurchaseInfoMessageEvent';
import type {RoomAdPurchaseInfoMessageParser} from '@habbo/communication/messages/parser/catalog/RoomAdPurchaseInfoMessageParser';
import {GuildOwnedRoomData} from '@habbo/communication/messages/incoming/users/GuildOwnedRoomData';
import type {RoomEngineEvent} from '@habbo/room/events/RoomEngineEvent';
import {RoomId} from '@room/utils/RoomId';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import {RoomAdPurchaseData} from '../../purchase/RoomAdPurchaseData';
import {SelectProductEvent} from './events/SelectProductEvent';
import type {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * The room-ad ("advertise your event") catalog page.
 *
 * The player names and describes an event, picks one of their rooms and an event category, and
 * buys — which is why this widget owns three of the page's inputs rather than one: everything it
 * collects goes into the catalog's single `RoomAdPurchaseData`, and that object is what makes
 * `HabboCatalog.purchaseProduct()` send `PurchaseRoomAdMessageComposer` instead of the ordinary
 * catalog purchase.
 *
 * It fills the room drop-menu from the server's reply to `GetRoomAdsPurchaseInfoMessageComposer`
 * (header 3787), which also tells it whether the player has club — the page usually carries two
 * offers, a club-priced one and a normal one, and `selectedOffer()` picks the matching one.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as
 */
export class RoomAdsCatalogWidget extends CatalogWidget
{
    private static readonly ROOM_NAME_MAX_LENGTH = 25;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::_catalog
    private _catalog: HabboCatalog | null;

    /**
     * Field name DERIVED: obfuscated in every tree. The subscription to header 3787, kept so
     * `dispose()` can take it off the connection again.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::_SafeStr_6431
    private _purchaseInfoEvent: RoomAdPurchaseInfoMessageEvent | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::_rooms
    private _rooms: GuildOwnedRoomData[] | null = null;

    /**
     * Field name DERIVED from the parser accessor it is read from (`isVip`), which is not
     * obfuscated.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::_SafeStr_8483
    private _isVip: boolean = false;

    /**
     * Field name DERIVED: obfuscated in every tree. The `categories_list` drop-menu, cached
     * because `onEventCategoryMenuEvent()` reads its selection outside any layout lookup.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::_SafeStr_5657
    private _categoriesList: IDropMenuWindow | null = null;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);

        this._catalog = catalog;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        if(this._catalog == null) return false;

        const connection = this._catalog.connection;

        if(this._purchaseInfoEvent == null)
        {
            this._purchaseInfoEvent = new RoomAdPurchaseInfoMessageEvent(this.onPurchaseInfoEvent);
            connection?.addMessageEvent(this._purchaseInfoEvent);
        }

        this._catalog.getRoomAdsPurchaseInfo();

        this.window.findChildByName('name_input_text')?.addEventListener(WindowEvent.WE_CHANGE, this.onNameWindowEvent);
        this.window.findChildByName('desc_input_text')?.addEventListener(WindowEvent.WE_CHANGE, this.onDescWindowEvent);
        this.events.on('PURCHASE', this.onPurchaseConfirmationEvent);

        const purchaseData = this._catalog.roomAdPurchaseData;
        const defaultMinutes = this._catalog.getInteger('room_ad.duration.minutes', 120);
        const minutes = this.getExtensionMinutes(purchaseData, defaultMinutes);

        this._catalog.localization?.registerParameter('roomad.catalog_text', 'duration', String(minutes));
        this._catalog.roomEngine?.events.on('REE_INITIALIZED', this.onRoomInitialized);

        this.populateEventCategories();

        return true;
    }

    /**
     * How long the ad will run for.
     *
     * Ported as-is including the subtraction's direction: AS3 computes `now - expirationTime`, so
     * an ad that has not expired yet *shortens* the quoted duration. That reads like a sign slip in
     * the original, but it only applies under the `roomad.limited_extension` config flag, and
     * guessing at the intent would be inventing behaviour the server never agreed to.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::getExtensionMinutes()
    private getExtensionMinutes(purchaseData: RoomAdPurchaseData | null, defaultMinutes: number): number
    {
        const limitedExtension = this._catalog?.getBoolean('roomad.limited_extension') ?? false;

        if(!limitedExtension || purchaseData == null || purchaseData.expirationTime == null) return defaultMinutes;

        const elapsed = new Date().getTime() - purchaseData.expirationTime.getTime();

        return (elapsed / 60000) + defaultMinutes;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::populateEventCategories()
    private populateEventCategories(): void
    {
        if(this.window == null) return;

        this._categoriesList = this.window.findChildByName('categories_list') as unknown as IDropMenuWindow | null;

        if(this._categoriesList == null) return;

        const captions: string[] = [];

        for(const category of this._catalog?.navigator?.visibleEventCategories ?? [])
        {
            captions.push(`\${navigator.searchcode.title.eventcategory__${category.categoryId}}`);
        }

        this._categoriesList.populate(captions);
        this._categoriesList.selection = 0;
        this._categoriesList.addEventListener(WindowEvent.WE_SELECTED, this.onEventCategoryMenuEvent);
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::onRoomInitialized()
    private onRoomInitialized = (event: RoomEngineEvent): void =>
    {
        if(event == null) return;

        if(!RoomId.isRoomPreviewerId(event.roomId)) this.setDefaultRoom(event.roomId, false);
    };

    /**
     * Points the drop-menu at `roomId`, and (when `repopulate`) refills it first.
     *
     * Whichever room ends up selected is written straight into the catalog's `RoomAdPurchaseData`,
     * creating it if this is the first thing to touch it — the widget is the only place that
     * object gets a `flatId`, and a zero one is what `PurchaseCatalogWidget` refuses to buy with.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::setDefaultRoom()
    private setDefaultRoom(roomId: number, repopulate: boolean = false): void
    {
        if(this.window == null) return;

        const dropMenu = this.window.findChildByName('room_drop_menu') as unknown as IDropMenuWindow | null;

        if(dropMenu == null) return;

        if(this._rooms == null)
        {
            if(dropMenu.numMenuItems > 0) dropMenu.selection = 0;

            return;
        }

        let selectedIndex = 0;
        const captions: string[] = [];

        for(let i = 0; i < this._rooms.length; i++)
        {
            const room = this._rooms[i];

            if(repopulate)
            {
                captions.push(room.roomName.length > RoomAdsCatalogWidget.ROOM_NAME_MAX_LENGTH
                    ? `${room.roomName.substring(0, RoomAdsCatalogWidget.ROOM_NAME_MAX_LENGTH)}...`
                    : room.roomName);
            }

            if(room.roomId === roomId) selectedIndex = i;
        }

        if(repopulate)
        {
            if(captions.length === 0)
            {
                captions.push(this._catalog?.localization?.getLocalization('roomad.no.available.room', 'roomad.no.available.room') ?? '');
            }

            dropMenu.populate(captions);
        }

        const selectedRoom = this._rooms[selectedIndex] ?? null;

        if(selectedRoom != null)
        {
            dropMenu.selection = selectedIndex;

            let purchaseData = this._catalog?.roomAdPurchaseData ?? null;

            if(purchaseData == null)
            {
                purchaseData = new RoomAdPurchaseData();

                if(this._catalog != null) this._catalog.roomAdPurchaseData = purchaseData;
            }

            purchaseData.flatId = selectedRoom.roomId;
        }
        else
        {
            dropMenu.selection = 0;
        }
    }

    /**
     * Refills the form from an extend-mode purchase.
     *
     * `HabboCatalog.openRoomAdCatalogPageInExtendedMode()` fills the purchase data before the page
     * even loads, so the room being extended is not in the server's list — hence the push into
     * `_rooms`, which happens before `setDefaultRoom()` populates the menu from it.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::setExtendData()
    private setExtendData(): void
    {
        const purchaseData = this._catalog?.roomAdPurchaseData ?? null;

        if(purchaseData == null || !purchaseData.extended) return;

        const nameInput = this.window.findChildByName('name_input_text');
        const descInput = this.window.findChildByName('desc_input_text');

        if(nameInput != null) nameInput.caption = purchaseData.name ?? '';
        if(descInput != null) descInput.caption = purchaseData.description;

        this._rooms?.push(new GuildOwnedRoomData(purchaseData.flatId, purchaseData.roomName ?? '', false));

        if(this._categoriesList == null)
        {
            this._categoriesList = this.window.findChildByName('categories_list') as unknown as IDropMenuWindow | null;
        }

        if(this._categoriesList != null) this._categoriesList.selection = purchaseData.categoryId - 1;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::onPurchaseInfoEvent()
    private onPurchaseInfoEvent = (event: IMessageEvent): void =>
    {
        if(!this.window || this.disposed) return;

        const parser = event.parser as RoomAdPurchaseInfoMessageParser | null;

        if(parser == null) return;

        this._rooms = parser.rooms;
        this._isVip = parser.isVip;

        const activeRoomId = this._catalog?.roomEngine?.activeRoomId ?? 0;

        this.setExtendData();
        this.populateEventCategories();
        this.setDefaultRoom(activeRoomId, true);

        const offer = this.selectedOffer();

        if(offer == null) return;

        this.events.emit(SelectProductEvent.SELECT_PRODUCT, new SelectProductEvent(offer));

        let purchaseData = this._catalog?.roomAdPurchaseData ?? null;

        if(purchaseData == null) purchaseData = new RoomAdPurchaseData();

        purchaseData.offerId = offer.offerId;

        if(this._catalog != null) this._catalog.roomAdPurchaseData = purchaseData;

        const priceContainer = this.window.findChildByName('price_container') as IWindowContainer | null;

        if(priceContainer != null) this._catalog?.utils.showPriceInContainer(priceContainer, offer);
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::onPurchaseConfirmationEvent()
    private onPurchaseConfirmationEvent = (_event: CatalogWidgetEvent): void =>
    {
        this._catalog?.getRoomAdsPurchaseInfo();

        const nameInput = this.window.findChildByName('name_input_text');
        const descInput = this.window.findChildByName('desc_input_text');

        if(nameInput != null) nameInput.caption = '';
        if(descInput != null) descInput.caption = '';

        this._catalog?.roomAdPurchaseData?.clear();
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::onNameWindowEvent()
    private onNameWindowEvent = (event: WindowEvent): void =>
    {
        const textField = event.target as unknown as ITextFieldWindow | null;

        if(textField == null) return;

        const purchaseData = this._catalog?.roomAdPurchaseData ?? null;

        if(purchaseData != null) purchaseData.name = textField.text;
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::onDescWindowEvent()
    private onDescWindowEvent = (event: WindowEvent): void =>
    {
        const textField = event.target as unknown as ITextFieldWindow | null;

        if(textField == null) return;

        const purchaseData = this._catalog?.roomAdPurchaseData ?? null;

        if(purchaseData != null) purchaseData.description = textField.text;
    };

    /**
     * Re-quotes the duration when the player picks a different room from the drop-menu.
     *
     * **Dead in AS3 too.** The source declares this handler and never binds it — `init()` attaches
     * listeners to `name_input_text`, `desc_input_text` and `categories_list`, but nothing to
     * `room_drop_menu`, and the two-argument signature (event, window) is a window *procedure*
     * that is never assigned either. So in the real client, changing the room silently leaves the
     * duration caption stale, and the room's own `flatId` is only ever set by `setDefaultRoom()`.
     *
     * Ported rather than dropped because a member that exists in the source has to be visible
     * here — see `.claude/rules/30-as3-traceability.md`. Wiring it up would be inventing a
     * behaviour the original does not have.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::onRoomDropMenuEvent()
    private onRoomDropMenuEvent = (event: WindowEvent, window: IDropMenuWindow): void =>
    {
        if(event.type !== WindowEvent.WE_SELECTED || this._rooms == null || this._rooms.length === 0) return;

        const room = this._rooms[window.selection] ?? null;
        const purchaseData = this._catalog?.roomAdPurchaseData ?? null;

        if(room == null || purchaseData == null) return;

        purchaseData.flatId = room.roomId;

        let minutes = this._catalog?.getInteger('room_ad.duration.minutes', 120) ?? 120;

        if(room.roomId === purchaseData.extendedFlatId) minutes = this.getExtensionMinutes(purchaseData, minutes);

        const caption = this.window.findChildByName('ctlg_text_1');

        if(caption == null) return;

        caption.caption = '${roomad.catalog_text}';
        this._catalog?.localization?.registerParameter('roomad.catalog_text', 'duration', String(minutes));
        caption.caption = this._catalog?.localization?.getLocalization('roomad.catalog_text') ?? '';
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::onEventCategoryMenuEvent()
    private onEventCategoryMenuEvent = (_event: WindowEvent): void =>
    {
        let visibleIndex = 0;
        let categoryId = -1;
        const selection = this._categoriesList?.selection ?? 0;

        for(const category of this._catalog?.navigator?.visibleEventCategories ?? [])
        {
            if(!category.visible) continue;

            if(selection === visibleIndex)
            {
                categoryId = category.categoryId;

                break;
            }

            visibleIndex++;
        }

        const purchaseData = this._catalog?.roomAdPurchaseData ?? null;

        if(purchaseData != null) purchaseData.categoryId = categoryId;
    };

    /**
     * The offer whose club level matches the player's.
     *
     * A single-offer page short-circuits: the club check is only meaningful when the page carries
     * both variants.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::selectedOffer()
    private selectedOffer(): IPurchasableOffer | null
    {
        const offers = this.page?.offers ?? null;

        if(offers == null || offers.length === 0) return null;

        if(offers.length === 1) return offers[0];

        for(const offer of offers)
        {
            if((offer.clubLevel === 2 && this._isVip) || (offer.clubLevel !== 2 && !this._isVip)) return offer;
        }

        return null;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomAdsCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        // Port addition, matching the sibling widgets: AS3 leaves this listener on the page's
        // dispatcher and lets the player's GC sort it out, which an EventEmitter will not do.
        // It also has to happen before super.dispose(), which nulls `_events`.
        this.events.off('PURCHASE', this.onPurchaseConfirmationEvent);

        super.dispose();

        if(this._catalog == null) return;

        if(this._purchaseInfoEvent != null)
        {
            this._catalog.connection?.removeMessageEvent(this._purchaseInfoEvent);
            this._purchaseInfoEvent = null;
        }

        this._catalog.roomEngine?.events.off('REE_INITIALIZED', this.onRoomInitialized);
        this._catalog = null;
    }
}
