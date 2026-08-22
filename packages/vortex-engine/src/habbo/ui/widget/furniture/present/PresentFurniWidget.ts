import type {EventEmitter} from 'eventemitter3';
import type {BitmapDataAsset} from '@core/assets/BitmapDataAsset';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {FurnitureItem} from '@habbo/inventory/items/FurnitureItem';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {
    GetExtendedProfileByNameMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetExtendedProfileByNameMessageComposer';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {FurniturePresentWidgetHandler} from '@habbo/ui/handler/FurniturePresentWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import {RoomWidgetEcotronBoxDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetEcotronBoxDataUpdateEvent';
import {RoomWidgetPresentDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPresentDataUpdateEvent';
import {RoomWidgetRoomObjectUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetRoomObjectUpdateEvent';
import {RoomWidgetPresentOpenMessage} from '@habbo/ui/widget/messages/RoomWidgetPresentOpenMessage';

const log = Logger.getLogger('habbo.ui.widget.furniture.present.PresentFurniWidget');

/**
 * PresentFurniWidget
 *
 * The gift card, and the dialog that replaces it once the box is opened. Two different
 * layouts — `packagecard_new` and `packagecard_new_opened` — driven by one widget, because
 * the second is a continuation of the first: `_giftOpened` gates every contents event, so a
 * card the player never opened cannot be filled in by somebody else's unwrapping.
 *
 * An untrusted sender gets a warning banner and, when anonymous, an incognito avatar; a
 * trusted (staff) gift swaps the card art instead. Both branches are AS3's.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/present/PresentFurniWidget.as
 */
export class PresentFurniWidget extends RoomWidgetBase implements IAvatarImageListener
{
    // AS3: .../present/PresentFurniWidget.as::_SafeStr_10337
    private static readonly TYPE_FLOOR: string = 'floor';

    // AS3: .../present/PresentFurniWidget.as::TYPE_WALLPAPER
    private static readonly TYPE_WALLPAPER: string = 'wallpaper';

    // AS3: .../present/PresentFurniWidget.as::TYPE_LANDSCAPE
    private static readonly TYPE_LANDSCAPE: string = 'landscape';

    // AS3: .../present/PresentFurniWidget.as::PresentFurniWidget()
    constructor(
        handler: IRoomWidgetHandler,
        windowManager: IHabboWindowManager,
        assets: IAssetLibrary | null,
        localizations: IHabboLocalizationManager | null,
        configuration: IHabboConfigurationManager | null,
        catalog: IHabboCatalog | null,
        inventory: IHabboInventory | null,
        roomEngine: IRoomEngine | null
    )
    {
        super(handler, windowManager, assets, localizations);

        this._configuration = configuration;
        this._catalog = catalog;
        this._inventory = inventory;
        this._roomEngine = roomEngine;
    }

    // AS3: .../present/PresentFurniWidget.as::_SafeStr_7826
    private _configuration: IHabboConfigurationManager | null;

    // AS3: .../present/PresentFurniWidget.as::_catalog
    private _catalog: IHabboCatalog | null;

    // AS3: .../present/PresentFurniWidget.as::_inventory
    private _inventory: IHabboInventory | null;

    // AS3: .../present/PresentFurniWidget.as::_roomEngine
    private _roomEngine: IRoomEngine | null;

    // AS3: .../present/PresentFurniWidget.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../present/PresentFurniWidget.as::_SafeStr_4841
    private _objectId: number = -1;

    // AS3: .../present/PresentFurniWidget.as::_SafeStr_5613
    private _classId: number = 0;

    // AS3: .../present/PresentFurniWidget.as::_SafeStr_5296
    private _itemType: string = '';

    // AS3: .../present/PresentFurniWidget.as::_text
    private _text: string = '';

    /** Whether the viewer may open the box — the card's Open button is hidden without it. */
    // AS3: .../present/PresentFurniWidget.as::_SafeStr_4593
    private _controller: boolean = false;

    /** Set the moment Open is pressed. Every contents event is dropped unless it is true. */
    // AS3: .../present/PresentFurniWidget.as::_SafeStr_5015
    private _giftOpened: boolean = false;

    // AS3: .../present/PresentFurniWidget.as::_SafeStr_7951
    private _senderFigure: string | null = null;

    // AS3: .../present/PresentFurniWidget.as::_senderName
    private _senderName: string | null = null;

    // AS3: .../present/PresentFurniWidget.as::_SafeStr_4731
    private _placedItemId: number = -1;

    // AS3: .../present/PresentFurniWidget.as::_SafeStr_5481
    private _placedItemType: string = '';

    // AS3: .../present/PresentFurniWidget.as::_placedInRoom
    private _placedInRoom: boolean = false;

    // AS3: .../present/PresentFurniWidget.as::_SafeStr_7084
    private _trustedSender: boolean = false;

    // AS3: .../present/PresentFurniWidget.as::registerUpdateEvents()
    public override registerUpdateEvents(dispatcher: EventEmitter): void
    {
        if(dispatcher === null) return;

        for(const type of PresentFurniWidget.PRESENT_EVENT_TYPES)
        {
            dispatcher.on(type, this.onObjectUpdate);
        }

        dispatcher.on(RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED, this.onRoomObjectRemoved);
        dispatcher.on(RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_PACKAGEINFO, this.onEcotronUpdate);

        super.registerUpdateEvents(dispatcher);
    }

    // AS3: .../present/PresentFurniWidget.as::unregisterUpdateEvents()
    public override unregisterUpdateEvents(dispatcher: EventEmitter): void
    {
        if(dispatcher === null) return;

        for(const type of PresentFurniWidget.PRESENT_EVENT_TYPES)
        {
            dispatcher.off(type, this.onObjectUpdate);
        }

        dispatcher.off(RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_PACKAGEINFO, this.onEcotronUpdate);
        dispatcher.off(RoomWidgetRoomObjectUpdateEvent.FURNI_REMOVED, this.onRoomObjectRemoved);
    }

    /** The seven present events, registered and unregistered as one block in AS3 too. */
    private static readonly PRESENT_EVENT_TYPES: string[] = [
        RoomWidgetPresentDataUpdateEvent.UPDATE_PACKAGEINFO,
        RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS,
        RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_IMAGE,
        RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_CLUB,
        RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_FLOOR,
        RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_LANDSCAPE,
        RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_WALLPAPER
    ];

    // AS3: .../present/PresentFurniWidget.as::onObjectUpdate()
    private onObjectUpdate = (event: RoomWidgetPresentDataUpdateEvent): void =>
    {
        switch(event.type)
        {
            case RoomWidgetPresentDataUpdateEvent.UPDATE_PACKAGEINFO:
                this.hideInterface();

                this._giftOpened = false;
                this._objectId = event.objectId;
                this._text = event.text;
                this._controller = event.controller;
                this._senderName = event.purchaserName;
                this._senderFigure = event.purchaserFigure;
                this._trustedSender = event.trustedSender;

                this.showInterface();
                this.showIcon(event.iconBitmapData);
                break;
            case RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_FLOOR:
                if(!this._giftOpened) return;

                this.storeContents(event);
                this.showGiftOpenedInterface();
                this.showCustomIcon('packagecard_icon_floor');
                break;
            case RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_LANDSCAPE:
                if(!this._giftOpened) return;

                this.storeContents(event);
                this.showGiftOpenedInterface();
                this.showCustomIcon('packagecard_icon_landscape');
                break;
            case RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_WALLPAPER:
                if(!this._giftOpened) return;

                this.storeContents(event);
                this.showGiftOpenedInterface();
                this.showCustomIcon('packagecard_icon_wallpaper');
                break;
            case RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_CLUB:
                if(!this._giftOpened) return;

                // The club branch deliberately does not copy the placement fields: HC time
                // is not an item, so there is nothing to place or pick up.
                this._objectId = event.objectId;
                this._classId = event.classId;
                this._itemType = event.itemType;
                this._text = event.text;
                this._controller = event.controller;

                this.showGiftOpenedInterface();
                this.showCustomIcon('packagecard_icon_hc');
                break;
            case RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS:
                if(!this._giftOpened) return;

                this.storeContents(event);
                this.showGiftOpenedInterface();
                this.showIcon(event.iconBitmapData);
                break;
            case RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_IMAGE:
                if(!this._giftOpened) return;

                this.showIcon(event.iconBitmapData);
                break;
        }
    };

    /** The field copy AS3 repeats verbatim in five of the seven cases. */
    private storeContents(event: RoomWidgetPresentDataUpdateEvent): void
    {
        this._objectId = event.objectId;
        this._classId = event.classId;
        this._itemType = event.itemType;
        this._text = event.text;
        this._controller = event.controller;
        this._placedItemId = event.placedItemId;
        this._placedItemType = event.placedItemType;
        this._placedInRoom = event.placedInRoom;
    }

    /**
     * Two different objects can disappear: the present itself (close the card) or the item
     * that came out of it (it is no longer in the room, so the buttons change).
     */
    // AS3: .../present/PresentFurniWidget.as::onRoomObjectRemoved()
    private onRoomObjectRemoved = (event: RoomWidgetRoomObjectUpdateEvent): void =>
    {
        if(event.id === this._objectId)
        {
            this.hideInterface();
        }

        if(event.id === this._placedItemId && this._placedInRoom)
        {
            this._placedInRoom = false;

            this.updateRoomAndInventoryButtons();
        }
    };

    /** An Ecotron box opening takes the screen; the present card gets out of the way. */
    // AS3: .../present/PresentFurniWidget.as::onEcotronUpdate()
    private onEcotronUpdate = (event: RoomWidgetEcotronBoxDataUpdateEvent): void =>
    {
        if(event.type === RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_PACKAGEINFO)
        {
            this.hideInterface();
        }
    };

    // AS3: .../present/PresentFurniWidget.as::showCustomIcon()
    private showCustomIcon(assetName: string): void
    {
        const asset = this.assets?.getAssetByName(assetName) as BitmapDataAsset | null;

        this.showIcon((asset?.content as ImageBitmap | null) ?? null);
    }

    /**
     * AS3 allocates a bitmap the size of the slot and blits the icon into its centre. This
     * port assigns the bitmap and lets the window renderer place it — there is no
     * `BitmapData.copyPixels` here, and an `ImageBitmap` cannot be drawn into another
     * without a canvas round-trip for what is a centring offset.
     */
    // AS3: .../present/PresentFurniWidget.as::showIcon()
    private showIcon(bitmap: ImageBitmap | null): void
    {
        if(this._window === null || this._window.disposed) return;

        const image = this._window.findChildByName('gift_image') as IBitmapWrapperWindow | null;

        if(image === null) return;

        image.bitmap = bitmap;
    }

    /**
     * The opened dialog. Note it rebuilds the window from a *different* layout rather than
     * mutating the card — the two share only the sender block.
     */
    // AS3: .../present/PresentFurniWidget.as::showGiftOpenedInterface()
    private showGiftOpenedInterface(): void
    {
        if(this._objectId < 0) return;

        this._window?.dispose();

        this._window = this.buildWindow('packagecard_new_opened');

        if(this._window === null) return;

        this._window.center();

        this.applySenderCaption();

        this._window.findChildByName('header_button_close')?.addEventListener('WME_CLICK', this.onClose);

        const background = this._window.findChildByName('image_bg') as IBitmapWrapperWindow | null;
        const backgroundAsset = this.assets?.getAssetByName('gift_icon_background') as BitmapDataAsset | null;

        if(background !== null && backgroundAsset !== null)
        {
            background.bitmap = backgroundAsset.content as ImageBitmap | null;
        }

        const message = this._window.findChildByName('gift_message') as ITextWindow | null;

        if(message !== null)
        {
            message.text = '';

            if(this._text !== null)
            {
                const key = this.isSpacesItem()
                    ? 'widget.furni.present.spaces.message_opened'
                    : 'widget.furni.present.message_opened';

                this.localizations?.registerParameter(key, 'product', this._text);

                // Club time arrives pre-localised from the handler, so it is shown verbatim.
                message.text = this._itemType === 'h'
                    ? this._text
                    : this.localizations?.getLocalization(key, this._text) ?? this._text;
            }
            else
            {
                message.visible = false;
            }
        }

        const giveGift = this._window.findChildByName('give_gift_button');

        if(giveGift !== null)
        {
            if(!this.isUnknownSender())
            {
                const key = 'widget.furni.present.give_gift';

                this.localizations?.registerParameter(key, 'name', this._senderName ?? '');
                giveGift.caption = this.localizations?.getLocalization(key, this._senderName ?? '') ?? '';
                giveGift.addEventListener('WME_CLICK', this.onGiveGiftOpened);
            }
            else
            {
                giveGift.visible = false;
            }
        }

        this.prepareAvatarImageContainer();
        this.updateGiftDialogAvatarImage(this._senderFigure);
        this.updateRoomAndInventoryButtons();
        this.selectGiftedObject();
    }

    /** Floor, landscape and wallpaper rolls — they go straight to the room, never to a slot. */
    // AS3: .../present/PresentFurniWidget.as::isSpacesItem()
    private isSpacesItem(): boolean
    {
        if(this._itemType !== 'i') return false;

        const itemData = this.presentHandler?.container?.sessionDataManager?.getWallItemData(this._classId) ?? null;

        if(itemData === null) return false;

        return itemData.className === PresentFurniWidget.TYPE_FLOOR
            || itemData.className === PresentFurniWidget.TYPE_LANDSCAPE
            || itemData.className === PresentFurniWidget.TYPE_WALLPAPER;
    }

    // AS3: .../present/PresentFurniWidget.as::isClubItem()
    private isClubItem(): boolean
    {
        return this._itemType === 'h';
    }

    /**
     * Which of the three actions the opened dialog offers. Spaces items and club time get
     * none of them — there is nothing to place, keep or pocket.
     */
    // AS3: .../present/PresentFurniWidget.as::updateRoomAndInventoryButtons()
    private updateRoomAndInventoryButtons(): void
    {
        if(this._window === null || this._window.disposed) return;

        const isSpaces = this.isSpacesItem();
        const isClub = this.isClubItem();

        const keepInRoom = this._window.findChildByName('keep_in_room_button');

        if(keepInRoom !== null)
        {
            keepInRoom.addEventListener('WME_CLICK', this.onKeepInRoom);
            keepInRoom.visible = this._placedInRoom && !isSpaces && !isClub;
        }

        const placeInRoom = this._window.findChildByName('place_in_room_button');

        if(placeInRoom !== null)
        {
            placeInRoom.addEventListener('WME_CLICK', this.onPlaceInRoom);
            placeInRoom.visible = !this._placedInRoom;

            if(isSpaces)
            {
                placeInRoom.disable();
            }

            if(isSpaces || isClub)
            {
                placeInRoom.visible = false;
            }
        }

        const putInInventory = this._window.findChildByName('put_in_inventory_button');

        if(putInInventory !== null)
        {
            putInInventory.addEventListener('WME_CLICK', this.onPutInInventory);
            putInInventory.enable();

            if(isSpaces || isClub)
            {
                putInInventory.visible = false;
            }
        }

        const separator = this._window.findChildByName('separator');

        if(separator !== null)
        {
            separator.visible = this.isUnknownSender();
        }

        const giveContainer = this._window.findChildByName('give_container');

        if(giveContainer !== null)
        {
            giveContainer.visible = !this.isUnknownSender();
        }

        for(const listName of ['button_list', 'give_element_list', 'element_list'])
        {
            (this._window.findChildByName(listName) as IItemListWindow | null)?.arrangeListItems();
        }

        (this._window as unknown as IFrameWindow).resizeToFitContent();
    }

    // AS3: .../present/PresentFurniWidget.as::resetAndHideInterface()
    private resetAndHideInterface(): void
    {
        this._giftOpened = false;
        this._placedItemId = -1;
        this._placedInRoom = false;

        this.hideInterface();
    }

    // AS3: .../present/PresentFurniWidget.as::onKeepInRoom()
    private onKeepInRoom = (): void =>
    {
        this.resetAndHideInterface();
    };

    /**
     * Puts the opened present's contents straight into the room.
     *
     * The floor lookup negates the id, and the wall one does not — that asymmetry is AS3's, and it
     * is how the inventory tells its two furniture maps apart. Placing counts as seeing, so the
     * item's "new" mark goes with it.
     */
    // AS3: .../present/PresentFurniWidget.as::onPlaceInRoom()
    private onPlaceInRoom = (event: WindowEvent, window: IWindow): void =>
    {
        window?.disable();

        if(this._placedItemId > 0 && !this._placedInRoom)
        {
            const inventory = this._inventory;

            switch(this._placedItemType)
            {
                case 's':
                    if(inventory !== null && this.requestSelectedFurniPlacement(inventory.getFloorItemById(-this._placedItemId)))
                    {
                        inventory.removeUnseenFurniCounter(this._placedItemId);
                    }

                    break;
                case 'i':
                    if(inventory !== null && this.requestSelectedFurniPlacement(inventory.getWallItemById(this._placedItemId)))
                    {
                        inventory.removeUnseenFurniCounter(this._placedItemId);
                    }

                    break;
                case 'p':
                    if(inventory?.placePetToRoom(this._placedItemId, false) ?? false)
                    {
                        inventory?.removeUnseenPetCounter(this._placedItemId);
                    }

                    break;
            }
        }

        this.resetAndHideInterface();
    };

    /**
     * Hands one item to the furniture mover, unless it is a decoration.
     *
     * Wallpaper, floor and landscape (categories 2, 3 and 4) are refused outright here rather than
     * applied: a present containing one is opened, and the item goes to the inventory for the
     * player to apply from there.
     */
    // AS3: .../present/PresentFurniWidget.as::requestSelectedFurniPlacement()
    public requestSelectedFurniPlacement(item: FurnitureItem | null): boolean
    {
        if(item === null) return false;

        if(item.category === 2 || item.category === 3 || item.category === 4) return false;

        return this._inventory?.requestSelectedFurniToMover(item) ?? false;
    }

    /**
     * The reverse: pick the item back up. Pets go through the room session, furniture
     * through the room engine's own pickup verb.
     */
    // AS3: .../present/PresentFurniWidget.as::onPutInInventory()
    private onPutInInventory = (event: WindowEvent, window: IWindow): void =>
    {
        window?.disable();

        if(this._placedItemId > 0 && this._placedInRoom)
        {
            const container = this.presentHandler?.container ?? null;

            if(this._placedItemType === 'p')
            {
                container?.roomSession?.pickUpPet(this._placedItemId);
            }
            else
            {
                const roomId = container?.roomSession?.roomId ?? 0;
                const roomObject = this._roomEngine?.getRoomObject(
                    roomId, this._placedItemId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
                ) ?? null;

                if(roomObject !== null)
                {
                    this._roomEngine?.modifyRoomObject(
                        roomObject.getId(), RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE, 'OBJECT_PICKUP'
                    );
                }
            }
        }

        this.resetAndHideInterface();
    };

    /** The closed card: sender, note, wrapping art, and the trust banner. */
    // AS3: .../present/PresentFurniWidget.as::showInterface()
    private showInterface(): void
    {
        if(this._objectId < 0) return;

        this._window?.dispose();

        this._window = this.buildWindow('packagecard_new');

        if(this._window === null) return;

        this._window.center();

        this.applySenderCaption();

        this._window.findChildByName('header_button_close')?.addEventListener('WME_CLICK', this.onClose);

        const giftCard = this._window.findChildByName('gift_card') as IStaticBitmapWrapperWindow | null;

        if(giftCard !== null)
        {
            const wrapping = this._configuration?.getProperty('catalog.gift_wrapping_new.gift_card') ?? '';

            if(wrapping !== '')
            {
                giftCard.assetUri = `\${image.library.url}Giftcards/${wrapping}.png`;
            }
        }

        this.prepareAvatarImageContainer();

        if(this.isUnknownSender())
        {
            this.updateUnknownSenderAvatarImage();
        }
        else
        {
            this.updateGiftDialogAvatarImage(this._senderFigure);
        }

        if(!this._trustedSender)
        {
            const border = this._window.findChildByName('warning_foreground_border');

            if(border !== null)
            {
                border.color = 11599948;
            }

            const icon = this._window.findChildByName('warning_icon') as IStaticBitmapWrapperWindow | null;

            if(icon !== null)
            {
                icon.assetUri = 'catalogue_icon_alert_s';
                icon.width = 26;
                icon.height = 26;
                icon.x = 22;
                icon.y = 12;
            }

            // AS3 registers the literal "not trusted gift sender" as the parameter and then
            // resolves the key with the *sender's* name — the registered value is dead, and
            // it is kept here because removing it would change which string wins if the
            // localisation ever reads the registered parameter instead of the argument.
            const key = 'gift.untrusted.banner.text';

            this.localizations?.registerParameter(key, 'name', 'not trusted gift sender');

            const warningText = this._window.findChildByName('warning_text') as ITextWindow | null;

            if(warningText !== null)
            {
                warningText.text = this.localizations?.getLocalization(key, this._senderName ?? '') ?? '';
            }
        }
        else
        {
            const staffCard = this._window.findChildByName('gift_card') as IStaticBitmapWrapperWindow | null;

            if(staffCard !== null)
            {
                staffCard.assetUri = 'catalogue_giftcard_staff';
            }
        }

        const messageText = this._window.findChildByName('message_text') as ITextWindow | null;

        if(messageText !== null)
        {
            messageText.text = this._text;
        }

        const messageFrom = this._window.findChildByName('message_from') as ITextWindow | null;

        if(messageFrom !== null)
        {
            messageFrom.text = '';

            if(!this.isUnknownSender())
            {
                const key = 'widget.furni.present.message_from';

                this.localizations?.registerParameter(key, 'name', this._senderName ?? '');
                messageFrom.text = this.localizations?.getLocalization(key, this._senderName ?? '') ?? '';
                messageFrom.addEventListener('WME_CLICK', this.onSenderNameClick);
            }
            else
            {
                messageFrom.visible = false;
            }
        }

        const buttonList = this._window.findChildByName('button_list') as IItemListWindow | null;

        if(buttonList !== null)
        {
            const giveGift = buttonList.getListItemByName('give_gift_button');

            if(giveGift !== null)
            {
                if(!this.isUnknownSender())
                {
                    const key = 'widget.furni.present.give_gift';

                    this.localizations?.registerParameter(key, 'name', this._senderName ?? '');
                    giveGift.caption = this.localizations?.getLocalization(key, this._senderName ?? '') ?? '';
                }

                if(this._controller)
                {
                    giveGift.addEventListener('WME_CLICK', this.onGiveGift);
                }

                if(!this._controller || this.isUnknownSender())
                {
                    giveGift.visible = false;
                }
            }

            const openGift = this._window.findChildByName('open_gift_button');

            if(openGift !== null)
            {
                if(this._controller)
                {
                    openGift.addEventListener('WME_CLICK', this.onOpenGift);
                }
                else
                {
                    openGift.visible = false;
                }
            }

            buttonList.arrangeListItems();
        }

        const elementList = this._window.findChildByName('element_list') as IItemListWindow | null;

        if(elementList !== null)
        {
            elementList.x = elementList.spacing;

            (this._window as unknown as IFrameWindow).resizeToFitContent();

            if(elementList.parent !== null)
            {
                elementList.parent.height = elementList.x + elementList.height;
            }
        }
    }

    /** TS-only: the layout lookup both `showInterface()` variants open with. */
    private buildWindow(assetName: string): IWindowContainer | null
    {
        const asset = this.assets?.getAssetByName(assetName) as XmlAsset | null;

        if(asset === null || asset === undefined)
        {
            log.warn(`Missing layout asset "${assetName}" - the present card cannot open`);

            return null;
        }

        return this.windowManager.buildFromXML(asset.content as unknown as string) as IWindowContainer | null;
    }

    /** TS-only: the window caption both variants set the same way. */
    private applySenderCaption(): void
    {
        if(this._window === null || this.isUnknownSender()) return;

        const key = 'widget.furni.present.window.title_from';

        this.localizations?.registerParameter(key, 'name', this._senderName ?? '');
        this._window.caption = this.localizations?.getLocalization(key, this._senderName ?? '') ?? '';
    }

    // AS3: .../present/PresentFurniWidget.as::isUnknownSender()
    private isUnknownSender(): boolean
    {
        return this._senderName === null || this._senderName.length === 0;
    }

    // AS3: .../present/PresentFurniWidget.as::onClose()
    private onClose = (): void =>
    {
        this._giftOpened = false;

        this.hideInterface();
    };

    // AS3: .../present/PresentFurniWidget.as::onGiveGift()
    private onGiveGift = (): void =>
    {
        this.openGiftShop();

        // AS3 reaches the tracking singleton; this port has none, and the handler's container
        // already carries the same component as `habboTracking`.
        this.presentHandler?.container?.habboTracking?.trackEventLog('Catalog', 'click', 'client.return_gift_from_open_giftcard.clicked');
    };

    // AS3: .../present/PresentFurniWidget.as::onGiveGiftOpened()
    private onGiveGiftOpened = (): void =>
    {
        this.openGiftShop();

        this.presentHandler?.container?.habboTracking?.trackEventLog('Catalog', 'click', 'client.return_gift_from_opened_present.clicked');
    };

    /** Opens the catalog pre-addressed to whoever sent the gift. */
    // AS3: .../present/PresentFurniWidget.as::openGiftShop()
    private openGiftShop(): void
    {
        if(!this.isUnknownSender() && this._catalog !== null)
        {
            this._catalog.giftReceiver = this._senderName ?? '';
        }

        this._catalog?.openCatalogPage('gift_shop');
    }

    // AS3: .../present/PresentFurniWidget.as::send()
    private send(composer: IMessageComposer<unknown[]>): void
    {
        this._catalog?.connection?.send(composer);
    }

    // AS3: .../present/PresentFurniWidget.as::getExtendedProfile()
    private getExtendedProfile(): void
    {
        if(!this.isUnknownSender())
        {
            this.send(new GetExtendedProfileByNameMessageComposer(this._senderName ?? ''));
        }
    }

    // AS3: .../present/PresentFurniWidget.as::onSenderImageClick()
    private onSenderImageClick = (): void =>
    {
        this.getExtendedProfile();
    };

    // AS3: .../present/PresentFurniWidget.as::onSenderNameClick()
    private onSenderNameClick = (): void =>
    {
        this.getExtendedProfile();
    };

    // AS3: .../present/PresentFurniWidget.as::onOpenGift()
    private onOpenGift = (): void =>
    {
        this.sendOpen();
    };

    /**
     * The sender's head, cropped out of a full avatar render.
     *
     * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/present/PresentFurniWidget.as::getAvatarFaceBitmap()
     * reads `container.avatarRenderManager` and does
     * `createAvatarImage(figure, "h", null, this).getCroppedImage("head")`.
     * `IRoomWidgetHandlerContainer` does not expose the render manager in this port — the
     * same gap `ChatWidgetHandler` already documents — so the card shows its layout's
     * placeholder instead of the sender's face. Everything else on the card works.
     */
    // AS3: .../present/PresentFurniWidget.as::getAvatarFaceBitmap()
    public getAvatarFaceBitmap(figure: string | null): ImageBitmap | null
    {
        if(figure === null || figure.length === 0) return null;

        return null;
    }

    /** The render finished later; redraw only if it is still the figure being shown. */
    // AS3: .../present/PresentFurniWidget.as::avatarImageReady()
    public avatarImageReady(figure: string): void
    {
        if(this._window === null || this._window.disposed) return;

        if(figure === this._senderFigure)
        {
            this.updateGiftDialogAvatarImage(figure);
        }
    }

    // AS3: .../present/PresentFurniWidget.as::prepareAvatarImageContainer()
    private prepareAvatarImageContainer(): void
    {
        const region = this._window?.findChildByName('avatar_image_region') ?? null;

        if(region === null) return;

        if(!this.isUnknownSender())
        {
            region.addEventListener('WME_CLICK', this.onSenderImageClick);
        }
        else
        {
            region.disable();
        }
    }

    // AS3: .../present/PresentFurniWidget.as::updateGiftDialogAvatarImage()
    private updateGiftDialogAvatarImage(figure: string | null): void
    {
        const bitmap = this.getAvatarFaceBitmap(figure);

        if(bitmap !== null)
        {
            this.updateAvatarImageContainer(bitmap);
        }
    }

    // AS3: .../present/PresentFurniWidget.as::updateUnknownSenderAvatarImage()
    private updateUnknownSenderAvatarImage(): void
    {
        const asset = this.assets?.getAssetByName('gift_incognito') as BitmapDataAsset | null;
        const bitmap = (asset?.content as ImageBitmap | null) ?? null;

        if(bitmap !== null)
        {
            this.updateAvatarImageContainer(bitmap);
        }
    }

    /**
     * A trusted *and* anonymous gift shows the staff badge instead of a face, which is why
     * the image is disabled rather than filled in that one branch. The vertical divisor
     * differs too: a staff card leaves room for the badge below.
     */
    // AS3: .../present/PresentFurniWidget.as::updateAvatarImageContainer()
    private updateAvatarImageContainer(bitmap: ImageBitmap | null): void
    {
        if(bitmap === null || this._window === null) return;

        const avatarImage = this._window.findChildByName('avatar_image') as IBitmapWrapperWindow | null;

        if(avatarImage === null) return;

        const staffImage = this._window.findChildByName('staff_image') as IWindowContainer | null;
        const container = this._window.findChildByName('avatar_image_container') as IWindowContainer | null;

        if(this._trustedSender && this.isUnknownSender())
        {
            avatarImage.disable();

            if(staffImage !== null && container !== null)
            {
                staffImage.y = container.height / 2 - avatarImage.height / 2;
            }
        }
        else if(container !== null)
        {
            avatarImage.bitmap = bitmap;
            avatarImage.width = bitmap.width;
            avatarImage.height = bitmap.height;
            avatarImage.x = container.width / 2 - avatarImage.width / 2;
            avatarImage.y = container.height / (this._trustedSender ? 1.5 : 2) - avatarImage.height / 2;
        }

        if(!this._trustedSender && staffImage !== null)
        {
            (staffImage.parent as IWindowContainer | null)?.removeChild(staffImage);
        }
    }

    /** `_objectId` survives an open in progress — the contents events still need it. */
    // AS3: .../present/PresentFurniWidget.as::hideInterface()
    private hideInterface(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        if(!this._giftOpened)
        {
            this._objectId = -1;
        }

        this._text = '';
        this._controller = false;
    }

    // AS3: .../present/PresentFurniWidget.as::sendOpen()
    private sendOpen(): void
    {
        if(this._giftOpened || this._objectId === -1 || !this._controller) return;

        this._giftOpened = true;

        this.hideInterface();

        this.messageListener?.processWidgetMessage(
            new RoomWidgetPresentOpenMessage(RoomWidgetPresentOpenMessage.OPEN_PRESENT, this._objectId)
        );
    }

    /**
     * Highlights whatever came out, if it landed in the room. A pet has to be found by
     * walking the user objects: the placed id is a web id, not a room object id.
     */
    // AS3: .../present/PresentFurniWidget.as::selectGiftedObject()
    private selectGiftedObject(): void
    {
        if(this._placedItemId <= 0 || !this._placedInRoom || this._roomEngine === null) return;

        const roomId = this._roomEngine.activeRoomId;

        if(this._placedItemType !== 'p')
        {
            this._roomEngine.selectRoomObject(roomId, this._placedItemId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE);

            return;
        }

        const userDataManager = this.presentHandler?.container?.roomSession?.userDataManager ?? null;
        const count = this._roomEngine.getRoomObjectCount(roomId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

        for(let i = 0; i < count; i += 1)
        {
            const object = this._roomEngine.getRoomObjectWithIndex(roomId, i, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

            if(object === null) continue;

            const userData = userDataManager?.getUserDataByIndex(object.getId()) ?? null;

            if(userData !== null && userData.webID === this._placedItemId)
            {
                this._roomEngine.selectRoomObject(roomId, userData.roomObjectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_USER);

                break;
            }
        }
    }

    /** TS-only: the handler, typed — the widget reads its container for session data. */
    private get presentHandler(): FurniturePresentWidgetHandler | null
    {
        return this.widgetHandler as FurniturePresentWidgetHandler | null;
    }

    // AS3: .../present/PresentFurniWidget.as::dispose()
    public override dispose(): void
    {
        this.hideInterface();

        this._configuration = null;
        this._catalog = null;
        this._inventory = null;
        this._roomEngine = null;

        super.dispose();
    }
}
