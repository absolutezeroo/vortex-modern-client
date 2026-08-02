import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {ImageResult} from '@habbo/room/ImageResult';
import {PetFigureData} from '@habbo/avatar/pets/PetFigureData';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import {RoomSessionPresentEvent} from '@habbo/session/events/RoomSessionPresentEvent';
import {RoomWidgetPresentDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetPresentDataUpdateEvent';
import {RoomWidgetFurniToWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniToWidgetMessage';
import {RoomWidgetPresentOpenMessage} from '@habbo/ui/widget/messages/RoomWidgetPresentOpenMessage';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import {Vector3d} from '@room/utils/Vector3d';

/**
 * FurniturePresentWidgetHandler
 *
 * Gift boxes. Two jobs, and they are further apart than they look: reading the *closed*
 * box's card off the room object's model, and describing whatever came out of it once the
 * server says it was opened.
 *
 * It is also an `IGetImageListener`, because the contents' image is often not ready
 * synchronously — the icon then arrives later as a second `RWPDUE_CONTENTS_IMAGE` event.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurniturePresentWidgetHandler.as
 */
export class FurniturePresentWidgetHandler implements IRoomWidgetHandler, IGetImageListener
{
    // AS3: FurniturePresentWidgetHandler.as::_SafeStr_10337
    private static readonly TYPE_FLOOR: string = 'floor';

    // AS3: FurniturePresentWidgetHandler.as::TYPE_WALLPAPER
    private static readonly TYPE_WALLPAPER: string = 'wallpaper';

    // AS3: FurniturePresentWidgetHandler.as::TYPE_LANDSCAPE
    private static readonly TYPE_LANDSCAPE: string = 'landscape';

    // AS3: FurniturePresentWidgetHandler.as::TYPE_POSTER
    private static readonly TYPE_POSTER: string = 'poster';

    // AS3: FurniturePresentWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: FurniturePresentWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    /** The present whose card is currently open — `RWPOM_OPEN_PRESENT` is ignored for any other id. */
    // AS3: FurniturePresentWidgetHandler.as::_SafeStr_4841
    private _objectId: number = -1;

    /** Carried between the contents event and the late `imageReady()` callback. */
    // AS3: FurniturePresentWidgetHandler.as::_name
    private _name: string = '';

    // AS3: FurniturePresentWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: FurniturePresentWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_FURNI_PRESENT_WIDGET';
    }

    // AS3: FurniturePresentWidgetHandler.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: FurniturePresentWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: FurniturePresentWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [
            RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_PRESENT_WIDGET,
            RoomWidgetPresentOpenMessage.OPEN_PRESENT
        ];
    }

    // AS3: FurniturePresentWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown
    {
        const widgetMessage = message as RoomWidgetMessage | null;

        if(widgetMessage === null || this._container === null) return null;

        switch(widgetMessage.type)
        {
            case RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_PRESENT_WIDGET:
                this.openPackageCard(widgetMessage as RoomWidgetFurniToWidgetMessage);
                break;
            case RoomWidgetPresentOpenMessage.OPEN_PRESENT:
            {
                const openMessage = widgetMessage as RoomWidgetPresentOpenMessage;

                if(openMessage.objectId !== this._objectId) return null;

                this._container.roomSession?.sendPresentOpenMessage(openMessage.objectId);

                // Stops the box replaying its pickup animation while the contents dialog is
                // up. 10 is the floor-furniture category.
                this._container.roomEngine?.changeObjectModelData(
                    this._container.roomEngine.activeRoomId,
                    openMessage.objectId,
                    RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE,
                    RoomObjectVariableEnum.FURNITURE_DISABLE_PICKING_ANIMATION,
                    1
                );
                break;
            }
        }

        return null;
    }

    /**
     * The closed box. Everything shown on the card — the note, who sent it, and the icon of
     * the wrapping itself — comes off the room object's own model, not from the server.
     */
    // AS3: FurniturePresentWidgetHandler.as::processWidgetMessage() "RWFWM_MESSAGE_REQUEST_PRESENT"
    private openPackageCard(request: RoomWidgetFurniToWidgetMessage): void
    {
        const roomObject = this._container?.roomEngine?.getRoomObject(request.roomId, request.id, request.category) ?? null;

        if(roomObject === null) return;

        const model = roomObject.getModel();

        if(model === null) return;

        this._objectId = request.id;

        const furnitureData = model.getString(RoomObjectVariableEnum.FURNITURE_DATA) ?? '';
        const purchaserName = model.getString(RoomObjectVariableEnum.FURNITURE_PURCHASER_NAME);
        const purchaserFigure = model.getString(RoomObjectVariableEnum.FURNITURE_PURCHASER_FIGURE);
        const typeId = model.getNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID);
        const extras = model.getString(RoomObjectVariableEnum.FURNITURE_EXTRAS);
        const trustedSender = model.getNumber(RoomObjectVariableEnum.FURNITURE_TRUSTED_SENDER) === 1;

        const image = this._container?.roomEngine?.getFurnitureImage(
            typeId, new Vector3d(180), 32, this, 0, extras
        ) ?? null;

        const event = new RoomWidgetPresentDataUpdateEvent(
            RoomWidgetPresentDataUpdateEvent.UPDATE_PACKAGEINFO,
            request.id,
            furnitureData,
            this._container?.isOwnerOfFurniture(roomObject) ?? false,
            image?.data ?? null,
            purchaserName,
            purchaserFigure,
            trustedSender
        );

        this._container?.desktopEvents.emit(event.type, event);
    }

    // AS3: FurniturePresentWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [RoomSessionPresentEvent.RSPE_PRESENT_OPENED];
    }

    /**
     * What came out. The shape of the answer depends on `itemType`: `i` is a wall item and
     * splits again by class (a floor/landscape/wallpaper roll has no icon at all, only a
     * localised name), `h` is Habbo Club time, and everything else is a floor item — or a
     * pet, which is the one case that reads a figure string rather than a class id.
     */
    // AS3: FurniturePresentWidgetHandler.as::processEvent()
    public processEvent(event: unknown): void
    {
        if(this._container === null || this._container.desktopEvents === null) return;

        const presentEvent = event as RoomSessionPresentEvent | null;

        if(presentEvent === null || presentEvent.type !== RoomSessionPresentEvent.RSPE_PRESENT_OPENED) return;

        this._name = '';

        const itemData = presentEvent.itemType === 's'
            ? this._container.sessionDataManager?.getFloorItemData(presentEvent.classId) ?? null
            : presentEvent.itemType === 'i'
                ? this._container.sessionDataManager?.getWallItemData(presentEvent.classId) ?? null
                : null;

        let isOwner = false;

        if(presentEvent.placedInRoom)
        {
            const placedObject = this._container.roomEngine?.getRoomObject(
                this._container.roomSession?.roomId ?? 0,
                presentEvent.placedItemId,
                RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
            ) ?? null;

            if(placedObject !== null)
            {
                isOwner = this._container.isOwnerOfFurniture(placedObject);
            }
        }

        let update: RoomWidgetPresentDataUpdateEvent | null;

        switch(presentEvent.itemType)
        {
            case 'i':
                update = this.buildWallItemUpdate(presentEvent, itemData, isOwner);
                break;
            case 'h':
                update = new RoomWidgetPresentDataUpdateEvent(
                    RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_CLUB,
                    0,
                    this._container.localization?.getLocalization('widget.furni.present.hc') ?? '',
                    false,
                    null
                );
                break;
            default:
                update = this.buildFloorItemUpdate(presentEvent, itemData, isOwner);
                break;
        }

        if(update === null) return;

        update.classId = presentEvent.classId;
        update.itemType = presentEvent.itemType;
        update.placedItemId = presentEvent.placedItemId;
        update.placedInRoom = presentEvent.placedInRoom;
        update.placedItemType = presentEvent.placedItemType;

        this._container.desktopEvents.emit(update.type, update);
    }

    /** AS3: the `case "i"` branch of `processEvent()`. */
    // AS3: FurniturePresentWidgetHandler.as::processEvent() "i"
    private buildWallItemUpdate(
        presentEvent: RoomSessionPresentEvent,
        itemData: {className: string; localizedName: string} | null,
        isOwner: boolean
    ): RoomWidgetPresentDataUpdateEvent | null
    {
        if(itemData === null) return null;

        const localization = this._container?.localization ?? null;

        switch(itemData.className)
        {
            case FurniturePresentWidgetHandler.TYPE_FLOOR:
                return new RoomWidgetPresentDataUpdateEvent(
                    RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_FLOOR,
                    0, localization?.getLocalization('inventory.furni.item.floor.name') ?? '', isOwner, null
                );
            case FurniturePresentWidgetHandler.TYPE_LANDSCAPE:
                return new RoomWidgetPresentDataUpdateEvent(
                    RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_LANDSCAPE,
                    0, localization?.getLocalization('inventory.furni.item.landscape.name') ?? '', isOwner, null
                );
            case FurniturePresentWidgetHandler.TYPE_WALLPAPER:
                return new RoomWidgetPresentDataUpdateEvent(
                    RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_WALLPAPER,
                    0, localization?.getLocalization('inventory.furni.item.wallpaper.name') ?? '', isOwner, null
                );
            case FurniturePresentWidgetHandler.TYPE_POSTER:
            {
                // A poster's product code carries its number ("poster123"), and that number
                // is the icon parameter — the class id alone renders the wrong poster.
                const productCode = presentEvent.productCode;
                const posterNumber = productCode.indexOf('poster') === 0
                    ? String(parseInt(productCode.replace('poster', ''), 10))
                    : null;

                const icon = this._container?.roomEngine?.getWallItemIcon(presentEvent.classId, this, posterNumber) ?? null;

                this._name = this._container?.sessionDataManager?.getProductData(productCode)?.name
                    ?? itemData.localizedName;

                return icon === null
                    ? null
                    : new RoomWidgetPresentDataUpdateEvent(
                        RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS, 0, this._name, isOwner, icon.data
                    );
            }
            default:
            {
                const icon = this._container?.roomEngine?.getWallItemIcon(presentEvent.classId, this) ?? null;

                this._name = itemData.localizedName;

                return icon === null
                    ? null
                    : new RoomWidgetPresentDataUpdateEvent(
                        RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS, 0, this._name, isOwner, icon.data
                    );
            }
        }
    }

    /** AS3: the `default` branch of `processEvent()` — floor furniture, and pets. */
    // AS3: FurniturePresentWidgetHandler.as::processEvent() default
    private buildFloorItemUpdate(
        presentEvent: RoomSessionPresentEvent,
        itemData: {localizedName: string} | null,
        isOwner: boolean
    ): RoomWidgetPresentDataUpdateEvent | null
    {
        let image: ImageResult | null = null;

        if(presentEvent.placedItemType === 'p')
        {
            const figureString = presentEvent.petFigureString;

            if(figureString !== null && figureString.length > 0)
            {
                const figure = new PetFigureData(figureString);

                // Monsterplants (type 15) are drawn at half scale; everything else at 64.
                const scale = figure.typeId === 15 ? 32 : 64;

                image = this._container?.roomEngine?.getPetImage(
                    figure.typeId, figure.paletteId, figure.color, new Vector3d(2 * 45), scale,
                    this, true, 0, figure.customParts
                ) ?? null;
            }
        }

        if(image === null)
        {
            image = this._container?.roomEngine?.getFurnitureImage(
                presentEvent.classId, new Vector3d(90), 64, this
            ) ?? null;
        }

        this._name = this._container?.sessionDataManager?.getProductData(presentEvent.productCode)?.name
            ?? itemData?.localizedName
            ?? '';

        return image === null
            ? null
            : new RoomWidgetPresentDataUpdateEvent(
                RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS, 0, this._name, isOwner, image.data
            );
    }

    /**
     * The contents image, when it was not ready synchronously. Note the object id is 0 and
     * the owner flag false: this event only replaces the icon on a card already on screen.
     */
    // AS3: FurniturePresentWidgetHandler.as::imageReady()
    public imageReady(_id: number, data: ImageBitmap | null): void
    {
        if(this.disposed || this._container === null) return;

        const event = new RoomWidgetPresentDataUpdateEvent(
            RoomWidgetPresentDataUpdateEvent.UPDATE_CONTENTS_IMAGE, 0, this._name, false, data
        );

        this._container.desktopEvents.emit(event.type, event);
    }

    // AS3: FurniturePresentWidgetHandler.as::imageFailed()
    public imageFailed(_id: number): void
    {
        // AS3 no-op — a failed icon leaves the card showing whatever it already had.
    }

    // AS3: FurniturePresentWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: FurniturePresentWidgetHandler.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}
