import type {Container} from 'pixi.js';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IDisplayObjectWrapper} from '@core/window/components/IDisplayObjectWrapper';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {Vector3d} from '@room/utils/Vector3d';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {RoomPreviewer} from '@habbo/room/preview/RoomPreviewer';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {IProduct} from '../IProduct';
import {BundleProductContainer} from '../BundleProductContainer';
import type {IDragAndDropDoneReceiver} from '../IDragAndDropDoneReceiver';
import {SelectProductEvent} from './events/SelectProductEvent';
import {SetRoomPreviewerStuffDataEvent} from './events/SetRoomPreviewerStuffDataEvent';
import {CatalogWidgetSpinnerEvent} from './events/CatalogWidgetSpinnerEvent';
import {CatalogWidgetBundleDisplayExtraInfoEvent} from './events/CatalogWidgetBundleDisplayExtraInfoEvent';
import {ExtraInfoItemData} from './bundlepurchaseinfodisplay/ExtraInfoItemData';
import {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {CatalogWidget} from './CatalogWidget';

const log = Logger.getLogger('ProductViewCatalogWidget');

/**
 * Shows the currently selected offer's name/description/price and a preview (room-canvas
 * furniture/avatar render, or a static image for special products).
 *
 * TODO(AS3): the following AS3 sub-paths are not ported (each noted again at its call site):
 * - "i" wall-item category 2/3/4 (wallpaper/floor/landscape editing via getRoomStringValue(),
 *   which IRoomEngine doesn't expose yet).
 * - "r" (rentable avatar effect) and "e" (avatar effect) preview rendering - both need
 *   pixel-level sprite compositing (addEffectSprites()) onto a canvas, which requires bridging
 *   PixiJS Texture output to ImageBitmap the way ProductGridItem.renderAvatarImage() does, but
 *   for a multi-layer composite rather than a single crop.
 * - the no-room-canvas fallback (roomEngine.getFurnitureImage()/getWallItemImage()) - these
 *   engine methods aren't ported. Only the roomPreviewer-canvas path works.
 * - class_3172/ProductImageConfiguration's pre-rendered special-product image table.
 * - ProductDisplayWrapper (the generic default-case product renderer).
 *
 * @see sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as
 */
export class ProductViewCatalogWidget extends CatalogWidget implements IGetImageListener, IDragAndDropDoneReceiver
{
    private _catalog: HabboCatalog | null;

    private _productName: IWindow | null = null;

    private _productDescription: IWindow | null = null;

    private _teaserImage: IBitmapWrapperWindow | null = null;

    private _roomCanvasContainer: IWindowContainer | null = null;

    private _roomCanvas: IDisplayObjectWrapper | null = null;

    // TS deviation: RoomEngine.createRoomCanvas() parents the returned canvas directly onto the
    // shared root PixiJS stage, not into this widget's window tree (see
    // RoomPreviewerWidget.ts's file header for the same note) - so it needs continuous per-frame
    // position/visibility syncing to track room_canvas_container's screen position, exactly like
    // RoomPreviewerWidget.syncCanvasPosition() already does for the inventory item preview.
    private _canvasDisplayObject: Container | null = null;

    private readonly _syncCanvasPositionBound = (): void => this.syncCanvasPosition();

    private _previewOffset: {x: number; y: number} = {x: 0, y: 0};

    private _bundleGrid: IItemGridWindow | null = null;

    private _gridItemLayout: IWindow | null = null;

    private _overrideStuffData: IStuffData | null = null;

    private _lastSelectEvent: SelectProductEvent | null = null;

    private _priceBox: IWindow | null = null;

    private _useBundleSpinner: boolean = true;

    private _totalPriceWidgetInitialized: boolean = false;

    private _hasRoomCanvas: boolean = true;

    private _offer: IPurchasableOffer | null = null;

    private _mouseIsDown: boolean = false;

    constructor(window: IWindowContainer, catalog: HabboCatalog)
    {
        super(window);
        this._catalog = catalog;
    }

    override dispose(): void
    {
        if(this.disposed) return;

        this.events.off(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);
        this.events.off(SetRoomPreviewerStuffDataEvent.CWE_SET_PREVIEWER_STUFFDATA, this.onStuffDataSet);
        this.events.off(CatalogWidgetSpinnerEvent.VALUE_CHANGED, this.onSpinnerEvent);
        this.events.off('TOTAL_PRICE_WIDGET_INITIALIZED', this.onTotalPriceWidgetInitialized);
        this._catalog?.roomEngine?.unregisterCanvasSyncCallback(this._syncCanvasPositionBound);
        this._canvasDisplayObject = null;
        this._catalog = null;
        this._priceBox = null;
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView('productViewWidget');

        if(!this._isEmbedded)
        {
            const first = this.window.getChildAt(0);

            if(first != null)
            {
                first.width = this.window.width;
                first.height = this.window.height;
            }
        }

        this._hasRoomCanvas = this.window.tags.indexOf('NO_ROOM_CANVAS') === -1;
        this._priceBox = null;
        this._productName = this.window.findChildByName('ctlg_product_name');
        this._productName!.caption = '';
        this._productDescription = this.window.findChildByName('ctlg_description');
        this._productDescription!.caption = '';
        (this._productName as unknown as ITextWindow).textColor = 0;
        (this._productDescription as unknown as ITextWindow).textColor = 0;
        this._teaserImage = this.window.findChildByName('ctlg_teaserimg_1') as unknown as IBitmapWrapperWindow | null;
        this._roomCanvasContainer = this.window.findChildByName('room_canvas_container') as unknown as IWindowContainer | null;

        if(this._roomCanvasContainer != null)
        {
            this._roomCanvasContainer.visible = false;
            this._roomCanvas = this._roomCanvasContainer.findChildByName('room_canvas') as unknown as IDisplayObjectWrapper | null;

            const roomPreviewer = this._catalog!.roomPreviewer;

            if(this._roomCanvas != null && roomPreviewer != null)
            {
                this._roomCanvasContainer.addEventListener('WME_CLICK', this.roomCanvasContainerProcedure);
                roomPreviewer.disableUpdate = false;
                roomPreviewer.reset(false);

                const canvas = roomPreviewer.getRoomCanvas(this._roomCanvas.width, this._roomCanvas.height);

                if(canvas != null)
                {
                    this._roomCanvas.setDisplayObject(canvas);
                    this._canvasDisplayObject = canvas;
                    this._catalog!.roomEngine?.registerCanvasSyncCallback(this._syncCanvasPositionBound);
                    this.syncCanvasPosition();
                }
            }
            else
            {
                this._roomCanvasContainer = null;
                this._roomCanvas = null;
            }
        }

        this._previewOffset = {x: this._teaserImage!.x, y: this._teaserImage!.y};
        this._bundleGrid = this.window.findChildByName('bundleGrid') as unknown as IItemGridWindow | null;

        if(this._bundleGrid == null)
        {
            log.warn('[Product View Catalog Widget] Bundle Grid not initialized!');
        }

        this._gridItemLayout = this._catalog!.windowManager!.buildWidgetLayout('gridItem');

        this.events.on(SelectProductEvent.SELECT_PRODUCT, this.onPreviewProduct);
        this.events.on(SetRoomPreviewerStuffDataEvent.CWE_SET_PREVIEWER_STUFFDATA, this.onStuffDataSet);
        this.events.on(CatalogWidgetSpinnerEvent.VALUE_CHANGED, this.onSpinnerEvent);
        this.events.on('TOTAL_PRICE_WIDGET_INITIALIZED', this.onTotalPriceWidgetInitialized);

        return true;
    }

    // TS deviation: mirrors RoomPreviewerWidget.syncCanvasPosition() - see this._canvasDisplayObject's
    // field comment for why this is needed (canvas parented onto the shared root stage, not this
    // widget's own window tree).
    private syncCanvasPosition(): void
    {
        if(!this._canvasDisplayObject || !this._roomCanvas) return;

        const globalPosition = {x: 0, y: 0};

        this._roomCanvas.getGlobalPosition(globalPosition);

        this._canvasDisplayObject.x = globalPosition.x;
        this._canvasDisplayObject.y = globalPosition.y;

        const stage = this._canvasDisplayObject.parent;

        if(stage && stage.children[stage.children.length - 1] !== this._canvasDisplayObject)
        {
            stage.setChildIndex(this._canvasDisplayObject, stage.children.length - 1);
        }

        const desktop = this._catalog!.windowManager?.getDesktop(1) ?? null;
        let window: IWindow | null = this._roomCanvas;
        let visible = true;
        let reachedDesktop = false;

        while(window)
        {
            if(!window.visible)
            {
                visible = false;

                break;
            }

            if(window === desktop)
            {
                reachedDesktop = true;

                break;
            }

            window = window.parent;
        }

        this._canvasDisplayObject.visible = visible && reachedDesktop;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::roomCanvasContainerProcedure()
    // TODO(AS3): the WME_OUT drag-to-mover case needs CatalogObjectMover, which isn't ported
    // (see HabboCatalog.requestSelectedItemToMover()'s own TODO); the mouse-down/drag tracking
    // is preserved so that gap is visible rather than silently dropped.
    private roomCanvasContainerProcedure = (event: WindowMouseEvent): void =>
    {
        switch(event.type)
        {
            case 'WME_CLICK':
                this._catalog!.roomPreviewer?.changeRoomObjectState();

                break;
            case 'WME_UP':
            case 'WME_OVER':
                this._mouseIsDown = false;

                break;
            case 'WME_DOWN':
                this._mouseIsDown = true;

                break;
            case 'WME_OUT':
                if(this._mouseIsDown && this._offer != null)
                {
                    if(this._catalog!.isDraggable(this._offer))
                    {
                        this._catalog!.requestSelectedItemToMover(this, this._offer);
                    }
                }

                this._mouseIsDown = false;

                break;
        }
    };

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::ninjaEffectBundled()
    private static ninjaEffectBundled(event: SelectProductEvent): boolean
    {
        const products = event.offer.productContainer.products;

        if(products.length !== 2) return false;

        for(const product of products)
        {
            if(product.productType === 'e' && product.productClassId === 108) return true;
        }

        return false;
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onPreviewProduct()
    private onPreviewProduct = (event: SelectProductEvent): void =>
    {
        if(event == null) return;

        this._lastSelectEvent = event;

        const offer = event.offer;

        this._offer = offer;

        if(this._bundleGrid != null)
        {
            this._bundleGrid.visible = false;
            this._bundleGrid.destroyGridItems();
        }

        this._productName!.caption = offer.localizationName;
        this._productDescription!.caption = offer.localizationDescription;
        this._productDescription!.y = this._productName!.y + this._productName!.height;

        const catalog = this._catalog!;

        if(catalog.multiplePurchaseEnabled && offer.bundlePurchaseAllowed && this._totalPriceWidgetInitialized)
        {
            this.setSpinnerToBundleRuleset();
            this.setBundleInfoWidgetToOffer(offer);
            this._useBundleSpinner = false;
        }
        else
        {
            this.events.emit(CatalogWidgetSpinnerEvent.HIDE, new CatalogWidgetSpinnerEvent(CatalogWidgetSpinnerEvent.HIDE));
            this.events.emit(CatalogWidgetBundleDisplayExtraInfoEvent.HIDE, new CatalogWidgetBundleDisplayExtraInfoEvent(CatalogWidgetBundleDisplayExtraInfoEvent.HIDE));
            this._useBundleSpinner = true;
        }

        if(this._useBundleSpinner)
        {
            this._priceBox = catalog.utils.showPriceOnProduct(
                offer, this.window, this._priceBox, this._teaserImage, -6, false, 6,
                this.page.acceptSeasonCurrencyAsCredits, this.page.acceptSeasonCurrencyAsCredits
            );
        }
        else if(this._priceBox != null)
        {
            this.window.removeChild(this._priceBox);
            this._priceBox.dispose();
            this._priceBox = null;
        }

        if(offer.badgeCode != null && offer.badgeCode !== '')
        {
            catalog.utils.showExtraOnProduct(4, offer.badgeCode, this.window, 6, 38, true, false);
        }
        else if(offer.extraChatStyleCode != null && offer.extraChatStyleCode !== '')
        {
            catalog.utils.showExtraOnProduct(9, offer.extraChatStyleCode, this.window, 6, 38, true, false);
        }
        else if(ProductViewCatalogWidget.ninjaEffectBundled(event))
        {
            catalog.utils.showAssetImageAsBadgeOnProduct('catalogue_effects_ninja', this.window, 6, 38, true, false);
        }
        else
        {
            catalog.utils.hideExtraFromProduct(this.window);
        }

        // TODO(AS3): class_3172/ProductImageConfiguration's pre-rendered special-product image
        // table isn't ported - always falls through to the pricing-model preview below.
        this.renderPreviewForPricingModel(offer);

        this.window.invalidate();
    };

    private renderPreviewForPricingModel(offer: IPurchasableOffer): void
    {
        switch(offer.pricingModel)
        {
            case 'pricing_model_bundle':
                if(this._bundleGrid != null)
                {
                    this._bundleGrid.visible = true;

                    const container = offer.productContainer as BundleProductContainer;

                    if(this._gridItemLayout != null)
                    {
                        container.populateItemGrid(this._bundleGrid, this._gridItemLayout);
                    }

                    this._bundleGrid.scrollV = 0;
                }

                if(this._roomCanvasContainer != null)
                {
                    this._roomCanvasContainer.visible = false;
                }

                this.setPreviewImage(null);

                break;
            case 'pricing_model_single':
            case 'pricing_model_multi':
            case 'pricing_model_furniture':
                this.renderProductPreview(offer);

                break;
            default:
                log.warn(`[Product View Catalog Widget] Unknown pricing model ${offer.pricingModel}`);
        }
    }

    private renderProductPreview(offer: IPurchasableOffer): void
    {
        const product = offer.product;

        if(product == null) return;

        const roomPreviewer = this._catalog!.roomPreviewer;

        if(this._roomCanvasContainer != null && this._hasRoomCanvas)
        {
            this._roomCanvasContainer.visible = product.productType === 's' || product.productType === 'i' || product.productType === 'e';
        }

        if(roomPreviewer != null && this._roomCanvas != null)
        {
            roomPreviewer.addViewOffset = {x: 0, y: product.isUniqueLimitedItem ? -15 : 0};
            roomPreviewer.disableUpdate = false;
        }

        switch(product.productType)
        {
            case 's':
                this.renderFurniturePreview(product, roomPreviewer != null && this._roomCanvas != null);

                break;
            case 'i':
                this.renderWallItemPreview(product, roomPreviewer, offer);

                break;
            case 'r':
                // TODO(AS3): rentable/avatar-effect preview needs multi-layer sprite compositing
                // (addEffectSprites()) - not ported, see class doc comment.
                log.warn('[Product View Catalog Widget] "r" preview not ported yet');
                this.setPreviewImage(null);

                break;
            case 'e':
                // TODO(AS3): avatar effect preview needs multi-layer sprite compositing
                // (addEffectSprites()) - not ported, see class doc comment.
                log.warn('[Product View Catalog Widget] "e" preview not ported yet');
                this.setPreviewImage(null);

                break;
            case 'h':
                break;
            default:
                // TODO(AS3): ProductDisplayWrapper (generic default-case renderer) isn't ported.
                log.warn(`[Product View Catalog Widget] Unknown Product Type: ${product.productType}`);
        }
    }

    private renderFurniturePreview(product: IProduct, hasRoomCanvas: boolean): void
    {
        const roomPreviewer = this._catalog!.roomPreviewer;

        if(hasRoomCanvas && roomPreviewer != null)
        {
            roomPreviewer.addFurnitureIntoRoom(product.productClassId, new Vector3d(90, 0, 0), this._overrideStuffData, product.extraParam);
        }
        else
        {
            // TODO(AS3): no-room-canvas fallback needs roomEngine.getFurnitureImage(), which
            // isn't ported.
            log.warn('[Product View Catalog Widget] Furniture preview without room canvas not ported yet');
        }
    }

    private renderWallItemPreview(product: IProduct, roomPreviewer: RoomPreviewer | null, _offer: IPurchasableOffer): void
    {
        const furnitureData = product.furnitureData;

        if(furnitureData != null && (furnitureData.category === 2 || furnitureData.category === 3 || furnitureData.category === 4))
        {
            // TODO(AS3): wallpaper/floor/landscape category-specific editing needs
            // roomEngine.getRoomStringValue(), which IRoomEngine doesn't expose yet.
            log.warn('[Product View Catalog Widget] Wall-item category 2/3/4 preview not ported yet');

            return;
        }

        if(roomPreviewer != null && this._roomCanvas != null)
        {
            roomPreviewer.addWallItemIntoRoom(product.productClassId, new Vector3d(90, 0, 0), product.extraParam);
        }
        else
        {
            // TODO(AS3): no-room-canvas fallback needs roomEngine.getWallItemImage(), which
            // isn't ported.
            log.warn('[Product View Catalog Widget] Wall item preview without room canvas not ported yet');
        }
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::setBundleInfoWidgetToOffer()
    private setBundleInfoWidgetToOffer(offer: IPurchasableOffer): void
    {
        const data = new ExtraInfoItemData(ExtraInfoItemData.TYPE_BONUS_BADGE);

        data.activityPointType = offer.activityPointType;
        data.priceActivityPoints = offer.priceInActivityPoints;
        data.priceCredits = offer.priceInCredits;
        data.priceSilver = offer.priceInSilver;
        data.badgeCode = offer.badgeCode;
        this.events.emit(CatalogWidgetBundleDisplayExtraInfoEvent.RESET, new CatalogWidgetBundleDisplayExtraInfoEvent(CatalogWidgetBundleDisplayExtraInfoEvent.RESET, data));
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::setSpinnerToBundleRuleset()
    private setSpinnerToBundleRuleset(): void
    {
        const catalog = this._catalog!;

        if(catalog.bundleDiscountEnabled)
        {
            this.events.emit(CatalogWidgetSpinnerEvent.RESET, new CatalogWidgetSpinnerEvent(CatalogWidgetSpinnerEvent.RESET, 1, catalog.utils.bundleDiscountFlatPriceSteps));
        }
        else
        {
            this.events.emit(CatalogWidgetSpinnerEvent.RESET, new CatalogWidgetSpinnerEvent(CatalogWidgetSpinnerEvent.RESET, 1));
        }

        this.events.emit(CatalogWidgetSpinnerEvent.SHOW, new CatalogWidgetSpinnerEvent(CatalogWidgetSpinnerEvent.SHOW));

        const ruleset = catalog.bundleDiscountRuleset as { maxPurchaseSize: number } | null;

        if(ruleset != null)
        {
            this.events.emit(CatalogWidgetSpinnerEvent.SET_MAX, new CatalogWidgetSpinnerEvent(CatalogWidgetSpinnerEvent.SET_MAX, ruleset.maxPurchaseSize));
        }

        this.events.emit(CatalogWidgetSpinnerEvent.SET_MIN, new CatalogWidgetSpinnerEvent(CatalogWidgetSpinnerEvent.SET_MIN, 1));
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::imageReady()
    // TODO(AS3): only reachable from the unported no-room-canvas fallback (getFurnitureImage()/
    // getWallItemImage()); never invoked while that fallback stays unported.
    imageReady(id: number, data: ImageBitmap | null): void
    {
        if(this.disposed || this.page == null || this.page.offers == null) return;

        for(const offer of this.page.offers)
        {
            if(offer.previewCallbackId === id)
            {
                this.setPreviewImage(data);
                offer.previewCallbackId = 0;

                break;
            }
        }
    }

    imageFailed(_id: number): void
    {
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::setPreviewImage()
    private setPreviewImage(image: ImageBitmap | null): void
    {
        if(this._teaserImage != null && !this.window.disposed)
        {
            this._teaserImage.bitmap = image;
            this._teaserImage.x = this._previewOffset.x;
            this._teaserImage.y = this._previewOffset.y;
        }
    }

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onStuffDataSet()
    private onStuffDataSet = (event: SetRoomPreviewerStuffDataEvent): void =>
    {
        this._overrideStuffData = event.stuffData;

        if(this._lastSelectEvent != null)
        {
            this._catalog!.roomPreviewer?.reset(false);
            this.onPreviewProduct(this._lastSelectEvent);
        }
    };

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onSpinnerEvent()
    private onSpinnerEvent = (event: CatalogWidgetSpinnerEvent): void =>
    {
        if(event.type === CatalogWidgetSpinnerEvent.VALUE_CHANGED)
        {
            const priceBoxNew = this.window.findChildByName('price_box_new') as unknown as IWindowContainer | null;

            if(priceBoxNew != null && this._lastSelectEvent != null)
            {
                this._catalog!.utils.showPriceInContainer(priceBoxNew, this._lastSelectEvent.offer);
            }
        }
    };

    // AS3: sources/win63_version/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onTotalPriceWidgetInitialized()
    private onTotalPriceWidgetInitialized = (_event: CatalogWidgetEvent): void =>
    {
        this._totalPriceWidgetInitialized = true;
    };

    override closed(): void
    {
        const roomPreviewer = this._catalog!.roomPreviewer;

        if(roomPreviewer != null)
        {
            roomPreviewer.disableUpdate = true;
        }
    }

    onDragAndDropDone(_success: boolean, _extraParam: string): void
    {
    }
}
