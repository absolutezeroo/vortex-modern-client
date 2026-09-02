import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {IDragAndDropDoneReceiver} from '../IDragAndDropDoneReceiver';
import type {HabboCatalog} from '../../HabboCatalog';
import {Vector3d} from '@room/utils/Vector3d';
import {CatalogWidgetInitPurchaseEvent} from './events/CatalogWidgetInitPurchaseEvent';
import {CatalogWidgetUpdateRoomPreviewEvent} from './events/CatalogWidgetUpdateRoomPreviewEvent';
import {SelectProductEvent} from './events/SelectProductEvent';
import {CatalogWidget} from './CatalogWidget';

/**
 * The "spaces" pages' room preview: an isometric room rendered with the offer's floor, wall and
 * landscape, with one `ads_twi_windw` window object composited on top of it so the wall paper is
 * visible against something.
 *
 * Both images are asynchronous — `getRoomImage()`/`getGenericRoomObjectImage()` may answer inline
 * or call back through `IGetImageListener` — so the widget holds the two halves and recomposites
 * whenever the second one lands.
 *
 * Dragging the preview out of the window hands the offer to the object mover, which is why this
 * widget is also a drag-and-drop receiver: a successful drop turns into `INIT_PURCHASE`.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as
 */
export class RoomPreviewCatalogWidget extends CatalogWidget implements IGetImageListener, IDragAndDropDoneReceiver
{
    // TS-only: AS3 repeats the child's name at both look-up sites; named once here.
    private static readonly PREVIEW_NAME: string = 'catalog_floor_preview_example';

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::_imageResultIdRoom
    private _imageResultIdRoom: number = -1;

    // The pending id of the window-object render. Name DERIVED — `_SafeStr_8074` is obfuscated in
    // every tree; the room half next to it is unobfuscated and named `_imageResultIdRoom`.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::_SafeStr_8074
    private _imageResultIdObject: number = -1;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::_SafeStr_5199
    private _roomImage: ImageBitmap | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::_SafeStr_5151
    private _objectImage: ImageBitmap | null = null;

    // The window the pointer went down on, held until it leaves — that pair is what starts the drag.
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::_SafeStr_5137
    private _pressedWindow: IWindow | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::_offer
    private _offer: IPurchasableOffer | null = null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::RoomPreviewCatalogWidget()
    constructor(window: IWindowContainer)
    {
        super(window);
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::init()
    override init(): boolean
    {
        if(!super.init()) return false;

        const preview = this.window.getChildByName(RoomPreviewCatalogWidget.PREVIEW_NAME);

        if(preview) preview.procedure = this.eventProc;

        this.events.on(CatalogWidgetUpdateRoomPreviewEvent.UPDATE_ROOM_PREVIEW, this.onUpdateRoomPreview);
        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);

        return true;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::onPreviewProduct()
    private onPreviewProduct = (event: SelectProductEvent): void =>
    {
        if(event == null) return;

        this._offer = event.offer;
    };

    /**
     * AS3 has three unreachable branches here that are transcribed as nothing: a second `WME_UP`
     * arm after the first already returned, and two `_SafeStr_5137 == null` lines — comparisons
     * whose result is discarded, where every other arm assigns. Only the three arms below do work.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::eventProc()
    private eventProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === 'WME_UP' || event.type === 'WME_DOUBLE_CLICK')
        {
            this._pressedWindow = null;
        }
        else if(event.type === 'WME_DOWN')
        {
            if(window == null) return;

            this._pressedWindow = window;
        }
        else if(event.type === 'WME_OUT' && this._pressedWindow != null && this._pressedWindow === window)
        {
            if(this._offer)
            {
                (this.page.viewer.catalog as HabboCatalog).requestSelectedItemToMover(this, this._offer);
                this._pressedWindow = null;
            }
        }
    };

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::onDragAndDropDone()
    onDragAndDropDone(success: boolean, extraParam: string): void
    {
        if(this.disposed) return;

        if(success) this.events.emit(
            CatalogWidgetInitPurchaseEvent.INIT_PURCHASE,
            new CatalogWidgetInitPurchaseEvent(false, extraParam)
        );
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::stopDragAndDrop()
    stopDragAndDrop(): void
    {
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::onUpdateRoomPreview()
    private onUpdateRoomPreview = (event: CatalogWidgetUpdateRoomPreviewEvent): void =>
    {
        const roomEngine = this.page.viewer.roomEngine;
        const room = roomEngine.getRoomImage(
            event.floorType,
            event.wallType,
            event.landscapeType,
            event.tileSize,
            this,
            'ads_twi_windw'
        );
        const object = roomEngine.getGenericRoomObjectImage(
            'ads_twi_windw',
            '',
            new Vector3d(180, 0, 0),
            event.tileSize,
            this
        );

        if(room != null && object != null)
        {
            this._imageResultIdRoom = room.id;
            this._imageResultIdObject = object.id;

            this._roomImage?.close();
            this._objectImage?.close();

            this._roomImage = room.data;
            this._objectImage = object.data;

            this.setRoomImage(room.data, object.data);
        }
    };

    /**
     * Every number here is AS3's: the pair is drawn 45px left and 20px down of the slot's centre,
     * and the window object then sits one pixel right of that centre and 44px below its own top.
     * Nothing derives them.
     */
    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::setRoomImage()
    private setRoomImage(room: ImageBitmap | null, object: ImageBitmap | null): void
    {
        if(room == null || object == null || this.window.disposed) return;

        const preview = this.window.getChildByName(RoomPreviewCatalogWidget.PREVIEW_NAME) as unknown as IBitmapWrapperWindow | null;

        if(preview == null) return;

        const width = Math.max(1, Math.floor(preview.width));
        const height = Math.max(1, Math.floor(preview.height));
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');

        if(context === null) return;

        // AS3 clears the reused BitmapData with 0x00FFFFFF — white at zero alpha, i.e. transparent.
        // A fresh canvas already is, so there is nothing to fill.
        const offsetX = -45;
        const offsetY = 20;

        context.drawImage(
            room,
            Math.floor((width - room.width) / 2) + offsetX,
            Math.floor((height - room.height) / 2) + offsetY
        );
        context.drawImage(
            object,
            Math.floor(width / 2) + offsetX + 1,
            Math.floor(height / 2) + offsetY - object.height + 44
        );

        preview.bitmap = canvas.transferToImageBitmap();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this.disposed) return;

        // AS3 zeroes the consumed id rather than restoring the -1 it starts at, so a later result
        // carrying id 0 would be taken for this one. Transcribed as it stands.
        switch(id)
        {
            case this._imageResultIdRoom:
                this._imageResultIdRoom = 0;
                this._roomImage?.close();
                this._roomImage = data;
                break;
            case this._imageResultIdObject:
                this._imageResultIdObject = 0;
                this._objectImage?.close();
                this._objectImage = data;
                break;
        }

        if(this._roomImage != null && this._objectImage != null)
        {
            this.setRoomImage(this._roomImage, this._objectImage);
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/RoomPreviewCatalogWidget.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this._roomImage?.close();
        this._roomImage = null;
        this._objectImage?.close();
        this._objectImage = null;

        this.events.off(CatalogWidgetUpdateRoomPreviewEvent.UPDATE_ROOM_PREVIEW, this.onUpdateRoomPreview);
        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);
        super.dispose();
    }
}
