import type {Container} from 'pixi.js';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IDisplayObjectWrapper} from '@core/window/components/IDisplayObjectWrapper';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import {Vector3d} from '@room/utils/Vector3d';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {RoomPreviewer} from '@habbo/room/preview/RoomPreviewer';
import {AvatarAction} from '@habbo/avatar/enum/AvatarAction';
import type {HabboCatalog} from '../../HabboCatalog';
import type {IPurchasableOffer} from '../../IPurchasableOffer';
import type {IProduct} from '../IProduct';
import {ProductDisplayWrapper} from '../ProductDisplayWrapper';
import type {ProductImageWidget} from '../../../window/widgets/ProductImageWidget';
import type {BundleProductContainer} from '../BundleProductContainer';
import type {IDragAndDropDoneReceiver} from '../IDragAndDropDoneReceiver';
import {SelectProductEvent} from './events/SelectProductEvent';
import {SetRoomPreviewerStuffDataEvent} from './events/SetRoomPreviewerStuffDataEvent';
import {CatalogWidgetSpinnerEvent} from './events/CatalogWidgetSpinnerEvent';
import {CatalogWidgetBundleDisplayExtraInfoEvent} from './events/CatalogWidgetBundleDisplayExtraInfoEvent';
import {ExtraInfoItemData} from './bundlepurchaseinfodisplay/ExtraInfoItemData';
import type {CatalogWidgetEvent} from './events/CatalogWidgetEvent';
import {CatalogWidgetName} from './CatalogWidgetName';
import {CatalogWidget} from './CatalogWidget';

const log = Logger.getLogger('ProductViewCatalogWidget');

/**
 * Shows the currently selected offer's name/description/price and a preview (room-canvas
 * furniture/avatar render, or a static image for special products), plus the preview
 * interaction controls (rotate_avatar_left/right, toggle_preview_magic - avatar pose cycling,
 * toggle_preview_zoom).
 *
 * TODO(AS3): the following AS3 sub-paths are not ported (each noted again at its call site):
 * - "i" wall-item category 2/3/4 (wallpaper/floor/landscape editing via getRoomStringValue(),
 *   which IRoomEngine doesn't expose yet).
 * - "r" (rentable avatar effect) and "e" (avatar effect) preview rendering - both need
 *   pixel-level sprite compositing (addEffectSprites()) onto a canvas, which requires bridging
 *   PixiJS Texture output to ImageBitmap the way ProductGridItem.renderAvatarImage() does, but
 *   for a multi-layer composite rather than a single crop.
 * - class_3172/ProductImageConfiguration's pre-rendered special-product image table.
 * - ProductDisplayWrapper (the generic default-case product renderer).
 * - furniture/wall-item preview ROTATION specifically: RoomPreviewer.canRotatePreviewFurniture()/
 *   rotatePreviewFurniture()/canRotatePreviewWallItem()/rotatePreviewWallItem() are stubbed to
 *   always report "not rotatable" - they need the previewed room object's allowed-direction set,
 *   which the ported room engine doesn't expose yet. The rotate buttons show up correctly for
 *   these modes but stay disabled. Avatar-mode rotation, pose-cycling ("preview magic"), and zoom
 *   are fully implemented (they only depend on RoomPreviewer.updateAvatarDirectionAndLocation(),
 *   which is real).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as
 */
export class ProductViewCatalogWidget extends CatalogWidget implements IGetImageListener, IDragAndDropDoneReceiver
{
    private static readonly PREVIEW_MODE_NONE: number = 0;
    private static readonly PREVIEW_MODE_AVATAR: number = 1;
    private static readonly PREVIEW_MODE_FLOOR_FURNITURE: number = 2;
    private static readonly PREVIEW_MODE_WALL_ITEM: number = 3;

    private static readonly PREVIEW_AVATAR_DEFAULT_BODY_DIRECTION: number = 2;
    private static readonly PREVIEW_AVATAR_DEFAULT_HEAD_DIRECTION: number = 3;

    private static readonly PREVIEW_ACTION_STAND: number = 0;
    private static readonly PREVIEW_ACTION_WALK: number = 1;
    private static readonly PREVIEW_ACTION_DANCE: number = 2;
    private static readonly PREVIEW_ACTION_SIT: number = 3;
    private static readonly PREVIEW_ACTION_LAY: number = 4;
    private static readonly PREVIEW_ACTION_WAVE: number = 5;
    private static readonly PREVIEW_ACTION_COUNT: number = 6;

    private static readonly PREVIEW_ZOOM_NORMAL: number = 1;
    private static readonly PREVIEW_ZOOM_IN: number = 2;
    private static readonly PREVIEW_ZOOM_IN_CAMERA_OFFSET_Y: number = 41;
    private static readonly PREVIEW_ZOOM_MOVE_SPEED_DENOMINATOR: number = 9;
    private static readonly PREVIEW_ZOOM_SPEED_SLOW: number = 0.12;

    private static readonly PREVIEW_SIT_OFFSETS = new Vector3d(2, 2, 0.55);
    private static readonly PREVIEW_LAY_OFFSETS = new Vector3d(1, 1, 0.8);

    private _catalog: HabboCatalog | null;

    private _productName: IWindow | null = null;

    private _productDescription: IWindow | null = null;

    private _teaserImage: IBitmapWrapperWindow | null = null;

    private _roomCanvasContainer: IWindowContainer | null = null;

    private _roomCanvas: IDisplayObjectWrapper | null = null;

    // AS3: var_1030/var_3250 - the fallback "product_image_widget" preview shown for product
    // types renderProductPreview() doesn't otherwise handle (currently: chat_style, gated by
    // ProductDisplayWrapper.isSupported() below). AS3 hides this container unconditionally before
    // every preview render and only re-shows it in that default case - our port previously never
    // looked this node up at all, so its placeholder graphic (visible by default, see
    // ProductImageWidget's constructor) stayed on screen forever, overlapping the room-canvas
    // furniture/wall-item preview.
    private _productImageWidgetContainer: IWidgetWindow | null = null;

    private _productImageWidget: ProductImageWidget | null = null;

    // TS deviation: RoomEngine.createRoomCanvas() parents the returned canvas directly onto the
    // shared root PixiJS stage, not into this widget's window tree (see
    // RoomPreviewerWidget.ts's file header for the same note) - so it needs continuous per-frame
    // position/visibility syncing to track room_canvas_container's screen position, exactly like
    // RoomPreviewerWidget.syncCanvasPosition() already does for the inventory item preview.
    private _canvasDisplayObject: Container | null = null;

    // Pre-existing repo-wide pattern for bound-callback private fields (RoomPreviewer.ts,
    // RoomPreviewerWidget.ts); the naming-convention rule's `method` selector misclassifies
    // arrow-function class properties.
    // eslint-disable-next-line @typescript-eslint/naming-convention
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

    private _rotateAvatarLeftButton: IWindow | null = null;

    private _rotateAvatarRightButton: IWindow | null = null;

    private _togglePreviewMagicButton: IWindow | null = null;

    private _toggleZoomButton: IWindow | null = null;

    private _previewMode: number = ProductViewCatalogWidget.PREVIEW_MODE_NONE;

    private _floorFurnitureCanRotate: boolean = false;

    private _avatarBodyDirection: number = ProductViewCatalogWidget.PREVIEW_AVATAR_DEFAULT_BODY_DIRECTION;

    private _avatarHeadDirection: number = ProductViewCatalogWidget.PREVIEW_AVATAR_DEFAULT_HEAD_DIRECTION;

    private _avatarAction: number = ProductViewCatalogWidget.PREVIEW_ACTION_STAND;

    private _zoomState: number = ProductViewCatalogWidget.PREVIEW_ZOOM_NORMAL;

    private _previewZoomAnimationProgress: number = 0;

    private _previewZoomAnimationTargetProgress: number = 0;

    private _zoomAnimationMaxDelta: number = 0;

    private _zoomAnimationLastStep: number = 0;

    private _zoomAnimationDecelerating: boolean = false;

    private _zoomAnimationActive: boolean = false;

    private _floorRotationMonitorActive: boolean = false;

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
        this._rotateAvatarLeftButton?.removeEventListener('WME_CLICK', this.onRotateAvatarLeft);
        this._rotateAvatarLeftButton = null;
        this._rotateAvatarRightButton?.removeEventListener('WME_CLICK', this.onRotateAvatarRight);
        this._rotateAvatarRightButton = null;
        this._togglePreviewMagicButton?.removeEventListener('WME_CLICK', this.onTogglePreviewMagic);
        this._togglePreviewMagicButton = null;
        this._toggleZoomButton?.removeEventListener('WME_CLICK', this.onTogglePreviewZoom);
        this._toggleZoomButton = null;
        this.setFloorFurnitureRotationAvailabilityMonitorEnabled(false);
        this.stopPreviewZoomAnimation();
        this._catalog?.roomEngine?.unregisterCanvasSyncCallback(this._syncCanvasPositionBound);
        this._canvasDisplayObject = null;
        this._catalog = null;
        this._priceBox = null;
        super.dispose();
    }

    override init(): boolean
    {
        if(!super.init()) return false;

        this.attachWidgetView(CatalogWidgetName.PRODUCT_VIEW);

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

        // AS3: var_1030 = _window.findChildByName("product_image_widget") as class_2010;
        this._productImageWidgetContainer = this.window.findChildByName('product_image_widget') as unknown as IWidgetWindow | null;

        if(this._productImageWidgetContainer != null)
        {
            this._productImageWidget = this._productImageWidgetContainer.widget as ProductImageWidget | null;
            this._productImageWidgetContainer.visible = false;
        }

        // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::init()
        this._rotateAvatarLeftButton = this.window.findChildByName('rotate_avatar_left');

        if(this._rotateAvatarLeftButton != null)
        {
            this._rotateAvatarLeftButton.visible = false;
            this._rotateAvatarLeftButton.addEventListener('WME_CLICK', this.onRotateAvatarLeft);
        }

        this._rotateAvatarRightButton = this.window.findChildByName('rotate_avatar_right');

        if(this._rotateAvatarRightButton != null)
        {
            this._rotateAvatarRightButton.visible = false;
            this._rotateAvatarRightButton.addEventListener('WME_CLICK', this.onRotateAvatarRight);
        }

        this._togglePreviewMagicButton = this.window.findChildByName('toggle_preview_magic');

        if(this._togglePreviewMagicButton != null)
        {
            this._togglePreviewMagicButton.visible = false;
            this._togglePreviewMagicButton.addEventListener('WME_CLICK', this.onTogglePreviewMagic);
        }

        this._toggleZoomButton = this.window.findChildByName('toggle_preview_zoom');

        if(this._toggleZoomButton != null)
        {
            this._toggleZoomButton.visible = false;
            this._toggleZoomButton.addEventListener('WME_CLICK', this.onTogglePreviewZoom);
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onRotateAvatarLeft()
    private onRotateAvatarLeft = (event: WindowMouseEvent): void =>
    {
        this.rotateCurrentPreview(1);
        event.stopPropagation();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onRotateAvatarRight()
    private onRotateAvatarRight = (event: WindowMouseEvent): void =>
    {
        this.rotateCurrentPreview(-1);
        event.stopPropagation();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onTogglePreviewMagic()
    private onTogglePreviewMagic = (event: WindowMouseEvent): void =>
    {
        this.cyclePreviewAvatarAction();
        event.stopPropagation();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onTogglePreviewZoom()
    private onTogglePreviewZoom = (event: WindowMouseEvent): void =>
    {
        this.togglePreviewZoom();
        event.stopPropagation();
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::rotateCurrentPreview()
    private rotateCurrentPreview(direction: number): void
    {
        const roomPreviewer = this._catalog?.roomPreviewer ?? null;

        if(roomPreviewer == null) return;

        switch(this._previewMode - 1)
        {
            case 0:
                this.rotatePreviewAvatar(direction, roomPreviewer);

                break;
            case 1:
                roomPreviewer.rotatePreviewFurniture(direction > 0);

                break;
            case 2:
                roomPreviewer.rotatePreviewWallItem();

                break;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::rotatePreviewAvatar()
    private rotatePreviewAvatar(direction: number, roomPreviewer: RoomPreviewer): void
    {
        if(this._previewMode !== ProductViewCatalogWidget.PREVIEW_MODE_AVATAR) return;

        if(this._avatarAction === ProductViewCatalogWidget.PREVIEW_ACTION_SIT && this.isDiagonalAvatarDirection(this._avatarBodyDirection + direction))
        {
            direction *= 2;
        }
        else if(this._avatarAction === ProductViewCatalogWidget.PREVIEW_ACTION_LAY && !this.isValidLayingDirection(this._avatarBodyDirection + direction))
        {
            direction = this._avatarBodyDirection === 0 ? 2 : -this._avatarBodyDirection;
        }

        this._avatarBodyDirection = this.normalizeAvatarDirection(this._avatarBodyDirection + direction);
        this._avatarHeadDirection = this._avatarBodyDirection;
        this.applyPreviewAvatarDirection(roomPreviewer);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::cyclePreviewAvatarAction()
    private cyclePreviewAvatarAction(): void
    {
        const roomPreviewer = this._catalog?.roomPreviewer ?? null;

        if(this._previewMode !== ProductViewCatalogWidget.PREVIEW_MODE_AVATAR || roomPreviewer == null) return;

        this._avatarAction = this.getNextPreviewAvatarAction(this._avatarAction);
        this.applyPreviewAvatarAction(roomPreviewer);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::togglePreviewZoom()
    private togglePreviewZoom(): void
    {
        if(this._previewMode !== ProductViewCatalogWidget.PREVIEW_MODE_AVATAR) return;

        this._zoomState = this._zoomState === ProductViewCatalogWidget.PREVIEW_ZOOM_NORMAL
            ? ProductViewCatalogWidget.PREVIEW_ZOOM_IN
            : ProductViewCatalogWidget.PREVIEW_ZOOM_NORMAL;
        this.animatePreviewZoomToSelection();
        this.updatePreviewControls();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::applyPreviewAvatarDirection()
    private applyPreviewAvatarDirection(roomPreviewer: RoomPreviewer): void
    {
        roomPreviewer.updateAvatarDirectionAndLocation(this._avatarBodyDirection, this._avatarHeadDirection, this.getPreviewAvatarLocation());
        roomPreviewer.updatePreviewRoomView(true);
        roomPreviewer.updateRoomEngine();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::setPreviewMode()
    private setPreviewMode(mode: number, canRotate: boolean = false): void
    {
        let resolvedMode = mode;

        if(!this._hasRoomCanvas || this._roomCanvasContainer == null || !this._roomCanvasContainer.visible)
        {
            resolvedMode = ProductViewCatalogWidget.PREVIEW_MODE_NONE;
        }

        if(this._previewMode === ProductViewCatalogWidget.PREVIEW_MODE_AVATAR && resolvedMode !== ProductViewCatalogWidget.PREVIEW_MODE_AVATAR)
        {
            this.resetPreviewAvatarDirection();
            this.resetPreviewAvatarAction();
            this.resetPreviewZoom();
            this.setPreviewZoomAnimationTarget(0, true);
        }

        if(this._previewMode !== ProductViewCatalogWidget.PREVIEW_MODE_AVATAR && resolvedMode === ProductViewCatalogWidget.PREVIEW_MODE_AVATAR)
        {
            this._zoomState = ProductViewCatalogWidget.PREVIEW_ZOOM_IN;
            this.setPreviewZoomAnimationTarget(1, true);
        }

        this._previewMode = resolvedMode;
        this._floorFurnitureCanRotate = resolvedMode === ProductViewCatalogWidget.PREVIEW_MODE_FLOOR_FURNITURE && canRotate;
        this.setFloorFurnitureRotationAvailabilityMonitorEnabled(resolvedMode === ProductViewCatalogWidget.PREVIEW_MODE_FLOOR_FURNITURE);

        if(resolvedMode === ProductViewCatalogWidget.PREVIEW_MODE_AVATAR && this._previewZoomAnimationProgress !== this._previewZoomAnimationTargetProgress)
        {
            this.animatePreviewZoomToSelection();
        }

        this.updatePreviewControls();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::setFloorFurnitureRotationAvailabilityMonitorEnabled()
    // TS deviation: AS3 hooks the room canvas DisplayObject's own "enterFrame" event; we don't
    // have a per-DisplayObject frame event here, so this uses the window manager's shared
    // update-receiver loop instead (same mechanism HintManager uses for its own polling).
    private setFloorFurnitureRotationAvailabilityMonitorEnabled(enabled: boolean): void
    {
        if(enabled === this._floorRotationMonitorActive) return;

        const updateAware = this._catalog?.windowManager as unknown as {
            registerUpdateReceiver?: (receiver: {update: (t: number) => void; dispose: () => void; disposed: boolean}, priority: number) => void
            removeUpdateReceiver?: (receiver: {update: (t: number) => void; dispose: () => void; disposed: boolean}) => void
        } | null;

        if(enabled)
        {
            updateAware?.registerUpdateReceiver?.(this._floorRotationMonitorReceiver, 10);
        }
        else
        {
            updateAware?.removeUpdateReceiver?.(this._floorRotationMonitorReceiver);
        }

        this._floorRotationMonitorActive = enabled;
    }

    private readonly _floorRotationMonitorReceiver = {
        update: (): void => this.onFloorFurnitureRotationAvailabilityFrame(),
        dispose: (): void => {},
        disposed: false,
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onFloorFurnitureRotationAvailabilityFrame()
    private onFloorFurnitureRotationAvailabilityFrame(): void
    {
        const roomPreviewer = this._catalog?.roomPreviewer ?? null;

        if(this._previewMode !== ProductViewCatalogWidget.PREVIEW_MODE_FLOOR_FURNITURE || roomPreviewer == null)
        {
            this.setFloorFurnitureRotationAvailabilityMonitorEnabled(false);

            return;
        }

        const canRotate = roomPreviewer.canRotatePreviewFurniture();

        if(this._floorFurnitureCanRotate !== canRotate)
        {
            this._floorFurnitureCanRotate = canRotate;
            this.updatePreviewControls();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::updatePreviewControls()
    private updatePreviewControls(): void
    {
        const isAvatar = this._previewMode === ProductViewCatalogWidget.PREVIEW_MODE_AVATAR;
        const hasAnyMode = this._previewMode !== ProductViewCatalogWidget.PREVIEW_MODE_NONE;
        const canRotate = hasAnyMode && (this._previewMode !== ProductViewCatalogWidget.PREVIEW_MODE_FLOOR_FURNITURE || this._floorFurnitureCanRotate);

        this.setPreviewButtonState(this._rotateAvatarLeftButton, hasAnyMode, canRotate);
        this.setPreviewButtonState(this._rotateAvatarRightButton, hasAnyMode, canRotate);
        this.setPreviewButtonState(this._togglePreviewMagicButton, isAvatar, isAvatar);
        this.setPreviewButtonState(this._toggleZoomButton, isAvatar, isAvatar);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::setPreviewButtonState()
    private setPreviewButtonState(button: IWindow | null, visible: boolean, enabled: boolean): void
    {
        if(button == null) return;

        button.visible = visible;

        if(enabled)
        {
            button.enable();
        }
        else
        {
            button.disable();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::resetPreviewAvatarDirection()
    private resetPreviewAvatarDirection(): void
    {
        this._avatarBodyDirection = ProductViewCatalogWidget.PREVIEW_AVATAR_DEFAULT_BODY_DIRECTION;
        this._avatarHeadDirection = ProductViewCatalogWidget.PREVIEW_AVATAR_DEFAULT_HEAD_DIRECTION;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::resetPreviewAvatarAction()
    private resetPreviewAvatarAction(): void
    {
        this._avatarAction = ProductViewCatalogWidget.PREVIEW_ACTION_STAND;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::getPreviewAvatarLocation()
    private getPreviewAvatarLocation(): Vector3d | null
    {
        switch(this._avatarAction - ProductViewCatalogWidget.PREVIEW_ACTION_SIT)
        {
            case 0:
                return ProductViewCatalogWidget.PREVIEW_SIT_OFFSETS;
            case 1:
                return ProductViewCatalogWidget.PREVIEW_LAY_OFFSETS;
            default:
                return null;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::applyPreviewAvatarAction()
    private applyPreviewAvatarAction(roomPreviewer: RoomPreviewer): void
    {
        roomPreviewer.updateObjectUserAction('figure_dance', 0);
        roomPreviewer.updateObjectUserAction('figure_expression', 0);

        switch(this._avatarAction)
        {
            case ProductViewCatalogWidget.PREVIEW_ACTION_WALK:
                roomPreviewer.updateUserPosture('mv');

                break;
            case ProductViewCatalogWidget.PREVIEW_ACTION_DANCE:
                roomPreviewer.updateUserPosture('std');
                roomPreviewer.updateObjectUserAction('figure_dance', 1);

                break;
            case ProductViewCatalogWidget.PREVIEW_ACTION_SIT:
                roomPreviewer.updateUserPosture('sit');

                break;
            case ProductViewCatalogWidget.PREVIEW_ACTION_LAY:
                roomPreviewer.updateUserPosture('lay');

                break;
            case ProductViewCatalogWidget.PREVIEW_ACTION_WAVE:
                roomPreviewer.updateUserPosture('std');
                roomPreviewer.updateObjectUserAction('figure_expression', AvatarAction.getExpressionId('wave'));

                break;
            default:
                roomPreviewer.updateUserPosture('std');
        }

        roomPreviewer.updateAvatarDirectionAndLocation(this._avatarBodyDirection, this._avatarHeadDirection, this.getPreviewAvatarLocation());
        roomPreviewer.updatePreviewRoomView(true);
        roomPreviewer.updateRoomEngine();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::getNextPreviewAvatarAction()
    private getNextPreviewAvatarAction(current: number): number
    {
        let next = current;

        do
        {
            next = (next + 1) % ProductViewCatalogWidget.PREVIEW_ACTION_COUNT;
        }
        while(this.isPreviewAvatarActionSkippedForDirection(next, this._avatarBodyDirection));

        return next;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::isPreviewAvatarActionSkippedForDirection()
    private isPreviewAvatarActionSkippedForDirection(action: number, direction: number): boolean
    {
        return (action === ProductViewCatalogWidget.PREVIEW_ACTION_SIT && this.isDiagonalAvatarDirection(direction))
            || (action === ProductViewCatalogWidget.PREVIEW_ACTION_LAY && !this.isValidLayingDirection(direction));
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::resetPreviewZoom()
    private resetPreviewZoom(): void
    {
        this._zoomState = ProductViewCatalogWidget.PREVIEW_ZOOM_NORMAL;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::animatePreviewZoomToSelection()
    private animatePreviewZoomToSelection(): void
    {
        this.setPreviewZoomAnimationTarget(this._zoomState === ProductViewCatalogWidget.PREVIEW_ZOOM_IN ? 1 : 0);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::setPreviewZoomAnimationTarget()
    private setPreviewZoomAnimationTarget(target: number, immediate: boolean = false): void
    {
        const clamped = Math.max(0, Math.min(1, target));

        this._previewZoomAnimationTargetProgress = clamped;

        if(immediate)
        {
            this.stopPreviewZoomAnimation();
            this._previewZoomAnimationProgress = clamped;
            this._zoomAnimationMaxDelta = 0;
            this._zoomAnimationLastStep = 0;
            this._zoomAnimationDecelerating = false;
            this.applyRoomCanvasZoom();

            return;
        }

        const delta = Math.abs(this._previewZoomAnimationTargetProgress - this._previewZoomAnimationProgress);

        if(delta <= 0)
        {
            this.stopPreviewZoomAnimation();
            this._previewZoomAnimationProgress = this._previewZoomAnimationTargetProgress;
            this._zoomAnimationLastStep = 0;
            this._zoomAnimationDecelerating = false;
            this.applyRoomCanvasZoom();

            return;
        }

        this._zoomAnimationMaxDelta = delta;
        this._zoomAnimationDecelerating = true;
        this.startPreviewZoomAnimation();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::startPreviewZoomAnimation()
    // TS deviation: driven by the window manager's shared update-receiver loop rather than a
    // DisplayObject "enterFrame" event - see setFloorFurnitureRotationAvailabilityMonitorEnabled().
    private startPreviewZoomAnimation(): void
    {
        if(this._zoomAnimationActive) return;

        this._zoomAnimationActive = true;

        const updateAware = this._catalog?.windowManager as unknown as {
            registerUpdateReceiver?: (receiver: {update: (t: number) => void; dispose: () => void; disposed: boolean}, priority: number) => void
        } | null;

        updateAware?.registerUpdateReceiver?.(this._zoomAnimationReceiver, 10);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::stopPreviewZoomAnimation()
    private stopPreviewZoomAnimation(): void
    {
        if(!this._zoomAnimationActive) return;

        this._zoomAnimationActive = false;

        const updateAware = this._catalog?.windowManager as unknown as {
            removeUpdateReceiver?: (receiver: {update: (t: number) => void; dispose: () => void; disposed: boolean}) => void
        } | null;

        updateAware?.removeUpdateReceiver?.(this._zoomAnimationReceiver);
    }

    private readonly _zoomAnimationReceiver = {
        update: (): void => this.onPreviewZoomAnimationFrame(),
        dispose: (): void => {},
        disposed: false,
    };

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onPreviewZoomAnimationFrame()
    private onPreviewZoomAnimationFrame(): void
    {
        const remaining = this._previewZoomAnimationTargetProgress - this._previewZoomAnimationProgress;
        const distance = Math.abs(remaining);

        if(distance <= ProductViewCatalogWidget.PREVIEW_ZOOM_SPEED_SLOW)
        {
            this._previewZoomAnimationProgress = this._previewZoomAnimationTargetProgress;
            this._zoomAnimationLastStep = 0;
            this._zoomAnimationDecelerating = false;
            this.stopPreviewZoomAnimation();
            this.applyRoomCanvasZoom();

            return;
        }

        if(distance > this._zoomAnimationMaxDelta)
        {
            this._zoomAnimationMaxDelta = distance;
        }

        const ease = Math.sin(Math.PI * distance / this._zoomAnimationMaxDelta);
        const speedCap = this._zoomAnimationMaxDelta / ProductViewCatalogWidget.PREVIEW_ZOOM_MOVE_SPEED_DENOMINATOR;
        let step = ProductViewCatalogWidget.PREVIEW_ZOOM_SPEED_SLOW + (speedCap - ProductViewCatalogWidget.PREVIEW_ZOOM_SPEED_SLOW) * ease;

        if(this._zoomAnimationDecelerating)
        {
            if(step < this._zoomAnimationLastStep)
            {
                step = Math.min(this._zoomAnimationLastStep, distance);
            }
            else
            {
                this._zoomAnimationDecelerating = false;
            }
        }

        this._zoomAnimationLastStep = step;
        this._previewZoomAnimationProgress += remaining > 0 ? step : -step;
        this.applyRoomCanvasZoom();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::applyRoomCanvasZoom()
    private applyRoomCanvasZoom(): void
    {
        if(this._roomCanvas == null || this._canvasDisplayObject == null) return;

        const scale = 1 + (2 - 1) * this._previewZoomAnimationProgress;
        const offsetY = ProductViewCatalogWidget.PREVIEW_ZOOM_IN_CAMERA_OFFSET_Y * this._previewZoomAnimationProgress;

        this._canvasDisplayObject.scale.x = scale;
        this._canvasDisplayObject.scale.y = scale;

        // TS deviation: AS3 assigns _roomCanvasDisplayObject.x/y directly, relative to a wrapper
        // Sprite that's separately positioned/clipped. Our canvas is parented onto the shared
        // root stage and kept aligned with room_canvas's screen position every frame by
        // syncCanvasPosition() - so the zoom offset here is applied on top of that same base
        // position (re-read fresh, not accumulated onto whatever .x/.y already holds) to avoid
        // drifting across repeated calls during the zoom animation.
        const basePosition = {x: 0, y: 0};

        this._roomCanvas.getGlobalPosition(basePosition);

        this._canvasDisplayObject.x = basePosition.x - (this._roomCanvas.width * scale - this._roomCanvas.width) / 2;
        this._canvasDisplayObject.y = basePosition.y - (this._roomCanvas.height * scale - this._roomCanvas.height) / 2 - offsetY;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::normalizeAvatarDirection()
    private normalizeAvatarDirection(direction: number): number
    {
        let result = direction % 8;

        if(result < 0) result += 8;

        return result;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::isDiagonalAvatarDirection()
    private isDiagonalAvatarDirection(direction: number): boolean
    {
        return this.normalizeAvatarDirection(direction) % 2 !== 0;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::isValidLayingDirection()
    private isValidLayingDirection(direction: number): boolean
    {
        const normalized = this.normalizeAvatarDirection(direction);

        return normalized === 0 || normalized === 2;
    }

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

        // AS3: var_1030.visible = false; - unconditionally hidden before every preview render;
        // only the (still-unported) default case in renderProductPreview() shows it again.
        if(this._productImageWidgetContainer != null)
        {
            this._productImageWidgetContainer.visible = false;
        }

        // TODO(AS3): class_3172/ProductImageConfiguration's pre-rendered special-product image
        // table isn't ported - always falls through to the pricing-model preview below.
        const {mode, canRotate} = this.renderPreviewForPricingModel(offer);

        this.setPreviewMode(mode, canRotate);

        this.window.invalidate();
    };

    private renderPreviewForPricingModel(offer: IPurchasableOffer): {mode: number; canRotate: boolean}
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

                return {mode: ProductViewCatalogWidget.PREVIEW_MODE_NONE, canRotate: false};
            case 'pricing_model_single':
            case 'pricing_model_multi':
            case 'pricing_model_furniture':
                return this.renderProductPreview(offer);
            default:
                log.warn(`[Product View Catalog Widget] Unknown pricing model ${offer.pricingModel}`);

                return {mode: ProductViewCatalogWidget.PREVIEW_MODE_NONE, canRotate: false};
        }
    }

    private renderProductPreview(offer: IPurchasableOffer): {mode: number; canRotate: boolean}
    {
        const product = offer.product;

        if(product == null) return {mode: ProductViewCatalogWidget.PREVIEW_MODE_NONE, canRotate: false};

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
                return this.renderFurniturePreview(offer, product, roomPreviewer, roomPreviewer != null && this._roomCanvas != null);
            case 'i':
                return this.renderWallItemPreview(offer, product, roomPreviewer);
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
                // AS3: since "s"/"i"/"r"/"e"/"h" are all their own explicit cases above,
                // ProductDisplayWrapper.isSupported() (chat_style or "r") is only ever reachable
                // here for "chat_style" in practice - "r" always takes the case above instead.
                if(ProductDisplayWrapper.isSupported(product.productType)
                    && this._productImageWidgetContainer != null && this._productImageWidget != null)
                {
                    this._productImageWidgetContainer.visible = true;
                    this._productImageWidget.productInfo = new ProductDisplayWrapper(product);
                    break;
                }

                log.warn(`[Product View Catalog Widget] Unknown Product Type: ${product.productType}`);
        }

        return {mode: ProductViewCatalogWidget.PREVIEW_MODE_NONE, canRotate: false};
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onPreviewProduct()
    // ("s" product-type branch)
    private renderFurniturePreview(offer: IPurchasableOffer, product: IProduct, roomPreviewer: RoomPreviewer | null, hasRoomCanvas: boolean): {mode: number; canRotate: boolean}
    {
        if(!hasRoomCanvas || roomPreviewer == null)
        {
            const roomEngine = this.page?.viewer?.roomEngine;

            if(roomEngine != null)
            {
                const result = roomEngine.getFurnitureImage(
                    product.productClassId, new Vector3d(90, 0, 0), 64, this, 0, product.extraParam, -1, -1, this._overrideStuffData);

                offer.previewCallbackId = result.id;
            }

            return {mode: ProductViewCatalogWidget.PREVIEW_MODE_NONE, canRotate: false};
        }

        const furnitureData = product.furnitureData;

        if(furnitureData != null && furnitureData.category === 23)
        {
            const catalog = this._catalog!;
            const floorItemData = catalog.sessionDataManager?.getFloorItemData(furnitureData.id) ?? null;
            const avatarRenderer = catalog.avatarRenderManager;
            const sessionDataManager = catalog.sessionDataManager;

            if(floorItemData != null && avatarRenderer != null && sessionDataManager != null)
            {
                const figureSetIds = (floorItemData.customParams ?? '')
                    .split(',')
                    .map((value) => parseInt(value, 10))
                    .filter((id) => !Number.isNaN(id) && avatarRenderer.isValidFigureSetForGender(id, sessionDataManager.gender));

                const figure = avatarRenderer.getFigureStringWithFigureIds(sessionDataManager.figure, sessionDataManager.gender, figureSetIds);

                roomPreviewer.addAvatarIntoRoom(figure);
                this.applyPreviewAvatarDirection(roomPreviewer);
                this.applyPreviewAvatarAction(roomPreviewer);
            }

            return {mode: ProductViewCatalogWidget.PREVIEW_MODE_AVATAR, canRotate: false};
        }

        roomPreviewer.addFurnitureIntoRoom(product.productClassId, new Vector3d(90, 0, 0), this._overrideStuffData, product.extraParam);

        return {mode: ProductViewCatalogWidget.PREVIEW_MODE_FLOOR_FURNITURE, canRotate: roomPreviewer.canRotatePreviewFurniture()};
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/ProductViewCatalogWidget.as::onPreviewProduct()
    // ("i" product-type branch)
    private renderWallItemPreview(offer: IPurchasableOffer, product: IProduct, roomPreviewer: RoomPreviewer | null): {mode: number; canRotate: boolean}
    {
        const furnitureData = product.furnitureData;

        if(furnitureData != null && (furnitureData.category === 2 || furnitureData.category === 3 || furnitureData.category === 4))
        {
            // TODO(AS3): wallpaper/floor/landscape category-specific editing needs
            // roomEngine.getRoomStringValue(), which IRoomEngine doesn't expose yet.
            log.warn('[Product View Catalog Widget] Wall-item category 2/3/4 preview not ported yet');

            return {mode: ProductViewCatalogWidget.PREVIEW_MODE_NONE, canRotate: false};
        }

        if(roomPreviewer != null && this._roomCanvas != null)
        {
            roomPreviewer.addWallItemIntoRoom(product.productClassId, new Vector3d(90, 0, 0), product.extraParam);

            return {
                mode: roomPreviewer.canRotatePreviewWallItem() ? ProductViewCatalogWidget.PREVIEW_MODE_WALL_ITEM : ProductViewCatalogWidget.PREVIEW_MODE_NONE,
                canRotate: false,
            };
        }

        const roomEngine = this.page?.viewer?.roomEngine;

        if(roomEngine != null)
        {
            const result = roomEngine.getWallItemImage(product.productClassId, new Vector3d(90, 0, 0), 64, this, 0, product.extraParam);

            offer.previewCallbackId = result.id;
        }

        return {mode: ProductViewCatalogWidget.PREVIEW_MODE_NONE, canRotate: false};
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
    // Reached from the no-room-canvas fallback in renderFurniturePreview()/renderWallItemPreview()
    // (Phase 5, getFurnitureImage()/getWallItemImage()).
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

        this.setPreviewMode(ProductViewCatalogWidget.PREVIEW_MODE_NONE);
    }

    onDragAndDropDone(_success: boolean, _extraParam: string): void
    {
    }
}
