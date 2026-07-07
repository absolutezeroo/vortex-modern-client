import type {Container} from 'pixi.js';
import type {IRoomPreviewerWidget} from './IRoomPreviewerWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IDisplayObjectWrapper} from '@core/window/components/IDisplayObjectWrapper';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {RoomPreviewer} from '@habbo/room/preview/RoomPreviewer';

/**
 * Room previewer widget.
 *
 * Renders a 3D room preview with configurable scale, zoom, and offset.
 * Creates a RoomPreviewer instance for rendering furniture, avatars,
 * and pets in a mini room view.
 *
 * In the AS3 version, uses RoomPreviewer with DisplayObject canvas.
 * In the TypeScript port, preview configuration is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/RoomPreviewerWidget.as
 */
export class RoomPreviewerWidget implements IRoomPreviewerWidget 
{
    public static readonly TYPE: string = 'room_previewer';

    private static readonly SCALE_KEY: string = 'room_previewer:scale';
    private static readonly OFFSET_X_KEY: string = 'room_previewer:offsetx';
    private static readonly OFFSET_Y_KEY: string = 'room_previewer:offsety';
    private static readonly ZOOM_KEY: string = 'room_previewer:zoom';

    private static _roomIdCounter: number = 2;

    private _widgetWindow: IWidgetWindow | null = null;
    private _windowManager: IHabboWindowManager | null = null;

    private _root: IWindowContainer | null = null;
    private _canvasWrapper: IWindow | null = null;
    private _canvasDisplayObject: Container | null = null;
    private _onClickRoomViewBound: Function;
    private _onResizeCanvasBound: Function;
    private _roomEngine: IRoomEngine | null = null;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager) 
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        this._onClickRoomViewBound = this.onClickRoomView.bind(this);
        this._onResizeCanvasBound = this.onResizeCanvas.bind(this);

        const root = this._windowManager.buildWidgetLayout('room_previewer_xml') as IWindowContainer | null;

        if(root) 
        {
            this._root = root;

            root.addEventListener(WindowMouseEvent.CLICK, this._onClickRoomViewBound);
            root.addEventListener(WindowEvent.WE_RESIZE, this._onResizeCanvasBound);

            this._widgetWindow.rootWindow = root as unknown as IWindow;
            root.width = this._widgetWindow.width;
            root.height = this._widgetWindow.height;

            this.createRoomPreviewer(root);
        }
    }

    private _roomPreviewer: RoomPreviewer | null = null;

    public get roomPreviewer(): RoomPreviewer | null 
    {
        return this._roomPreviewer;
    }

    private _disposed: boolean = false;

    public get disposed(): boolean 
    {
        return this._disposed;
    }

    private _scale: number = 64;

    public get scale(): number 
    {
        return this._scale;
    }

    public set scale(value: number) 
    {
        this._scale = value;
        this.refresh();
    }

    private _offsetX: number = 0;

    public get offsetX(): number 
    {
        return this._offsetX;
    }

    public set offsetX(value: number) 
    {
        this._offsetX = value;
        this.refresh();
    }

    private _offsetY: number = 0;

    public get offsetY(): number 
    {
        return this._offsetY;
    }

    public set offsetY(value: number) 
    {
        this._offsetY = value;
        this.refresh();
    }

    private _zoom: number = 1;

    public get zoom(): number 
    {
        return this._zoom;
    }

    public set zoom(value: number) 
    {
        this._zoom = value;
        this.refresh();
    }

    public get properties(): PropertyStruct[] 
    {
        if(this._disposed) return [];

        return [
            new PropertyStruct(RoomPreviewerWidget.SCALE_KEY, this._scale),
            new PropertyStruct(RoomPreviewerWidget.OFFSET_X_KEY, this._offsetX),
            new PropertyStruct(RoomPreviewerWidget.OFFSET_Y_KEY, this._offsetY),
            new PropertyStruct(RoomPreviewerWidget.ZOOM_KEY, this._zoom),
        ];
    }

    public set properties(values: PropertyStruct[]) 
    {
        for(const prop of values) 
        {
            switch(prop.key) 
            {
                case RoomPreviewerWidget.SCALE_KEY:
                    this.scale = Number(prop.value);
                    break;
                case RoomPreviewerWidget.OFFSET_X_KEY:
                    this.offsetX = Number(prop.value);
                    break;
                case RoomPreviewerWidget.OFFSET_Y_KEY:
                    this.offsetY = Number(prop.value);
                    break;
                case RoomPreviewerWidget.ZOOM_KEY:
                    this.zoom = Number(prop.value);
                    break;
            }
        }
    }

    // AS3: sources/win63_version/habbo/window/widgets/RoomPreviewerWidget.as::showPreview()
    public showPreview(image: HTMLCanvasElement): void 
    {
        const wrapper = this._root?.findChildByName('room_canvas') as unknown as IDisplayObjectWrapper | null;

        if(!wrapper) return;

        // The live room canvas is parented directly onto the shared root
        // PixiJS stage rather than into the window tree (see
        // createRoomPreviewer()), and needs continuous per-frame position
        // syncing to track its host window on screen. A static preview needs
        // neither: WindowComposite draws a plain bitmap display object
        // straight into the window's own composited buffer at the right
        // position automatically, so once we're showing one, the live canvas
        // and its sync callback can go entirely.
        if(this._canvasDisplayObject) 
        {
            this._roomEngine?.unregisterCanvasSyncCallback(this._syncCanvasPositionBound);
            this._canvasDisplayObject.parent?.removeChild(this._canvasDisplayObject);
            this._canvasDisplayObject = null;
            this._canvasWrapper = null;
        }

        // AS3: new Bitmap(param1) with scaleX = scaleY = 2. Baked into a
        // pre-scaled canvas here since this now goes through the normal
        // drawImage() compositing path (see WindowComposite.ts) rather than
        // a PixiJS Sprite.
        const scaled = document.createElement('canvas');

        scaled.width = image.width * 2;
        scaled.height = image.height * 2;

        const ctx = scaled.getContext('2d');

        if(!ctx) return;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0, scaled.width, scaled.height);

        wrapper.setDisplayObject(scaled);
    }

    public dispose(): void 
    {
        if(this._disposed) return;

        this._disposed = true;

        this._roomEngine?.unregisterCanvasSyncCallback(this._syncCanvasPositionBound);
        this._roomEngine = null;
        this._canvasWrapper = null;
        this._canvasDisplayObject = null;

        if(this._root) 
        {
            this._root.removeEventListener(WindowMouseEvent.CLICK, this._onClickRoomViewBound);
            this._root.removeEventListener(WindowEvent.WE_RESIZE, this._onResizeCanvasBound);
            this._root.dispose();
            this._root = null;
        }

        if(this._widgetWindow) 
        {
            this._widgetWindow.rootWindow = null;
        }

        this._widgetWindow = null;
        this._windowManager = null;
        this._roomPreviewer?.dispose();
        this._roomPreviewer = null;
    }

    private readonly _syncCanvasPositionBound = (): void => this.syncCanvasPosition();

    // AS3: sources/win63_version/habbo/window/widgets/RoomPreviewerWidget.as constructor
    private createRoomPreviewer(root: IWindowContainer): void 
    {
        const roomEngine = this._windowManager?.roomEngine;

        if(!roomEngine) return;

        RoomPreviewerWidget._roomIdCounter++;

        const previewRoomId = RoomPreviewerWidget._roomIdCounter;

        this._roomPreviewer = new RoomPreviewer(roomEngine, previewRoomId);
        this._roomPreviewer.createRoomForPreviews();

        const canvasWrapper = root.findChildByName('room_canvas') as unknown as IDisplayObjectWrapper | null;

        if(!canvasWrapper) return;

        const canvas = this._roomPreviewer.getRoomCanvas(root.width, root.height);

        if(canvas) 
        {
            canvasWrapper.setDisplayObject(canvas);
            this._canvasDisplayObject = canvas;
            this._canvasWrapper = canvasWrapper as unknown as IWindow;
            this._roomEngine = roomEngine;

            // TS deviation: RoomEngine.createRoomCanvas() parents the canvas
            // directly onto the root PixiJS stage (see RoomEngine.ts), not into
            // this widget's own window tree — so its screen position/visibility
            // has to be synced continuously to the wrapper window's global state
            // (window events alone can't catch every case, e.g. an ancestor
            // window being hidden), exactly like RoomDesktop does for the main
            // room view via a per-frame position sync.
            roomEngine.registerCanvasSyncCallback(this._syncCanvasPositionBound);
            this.syncCanvasPosition();
        }
    }

    private syncCanvasPosition(): void 
    {
        if(!this._canvasDisplayObject || !this._canvasWrapper) return;

        const globalPosition = {x: 0, y: 0};

        this._canvasWrapper.getGlobalPosition(globalPosition);

        // AS3 sets the canvas's own x/y to offsetX/offsetY (RoomPreviewerWidget.as::refresh()),
        // which works there because the canvas is a child of this widget's window. Here it's
        // parented directly onto the root stage (see deviation note below), so the offset has
        // to be folded into the same global-position assignment instead of applied separately.
        this._canvasDisplayObject.x = globalPosition.x + this._offsetX;
        this._canvasDisplayObject.y = globalPosition.y + this._offsetY;

        // TS deviation: this canvas and the main room view's canvas both get
        // parented directly onto the same shared PixiJS stage (see file header
        // comment / RoomEngine.createRoomCanvas()), so their relative stacking
        // depends purely on PixiJS child order, not window z-order. If the main
        // room view's canvas is (re)created after this one — e.g. entering a
        // room while the inventory/preview is already open — it ends up on top
        // and visually covers the preview wherever their screen rects overlap.
        // Since this widget is always logically a floating UI element above the
        // room view, re-assert front-of-stage every frame here.
        const stage = this._canvasDisplayObject.parent;

        if(stage && stage.children[stage.children.length - 1] !== this._canvasDisplayObject) 
        {
            stage.setChildIndex(this._canvasDisplayObject, stage.children.length - 1);
        }

        // Flash semantics: a DisplayObject parented into the window is only
        // shown when the window AND all its ancestors are visible. The canvas
        // lives on the root PixiJS stage here, so replicate that by walking
        // the wrapper's parent chain.
        //
        // Bug fix: switching inventory tabs detaches the inactive tab's whole
        // container via removeChild() (InventoryMainView.setViewToCategory())
        // rather than setting .visible = false on it. Walking upward from a
        // detached subtree hits a null parent without ever finding a
        // window.visible === false, so this used to always conclude "visible"
        // — leaving the 3D preview floating on screen for a tab that's no
        // longer attached anywhere. Require the walk to actually reach the
        // real desktop root; stopping short of it means the window is
        // detached, which is exactly the invisible case Flash semantics need.
        const desktop = this._windowManager?.getDesktop(1) ?? null;
        let window: IWindow | null = this._canvasWrapper;
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

    // AS3: sources/win63_version/habbo/window/widgets/RoomPreviewerWidget.as::refresh()
    private refresh(): void 
    {
        if(!this._roomPreviewer || !this._roomPreviewer.isRoomEngineReady) return;

        if(this._scale === 64) 
        {
            this._roomPreviewer.zoomIn();
        }
        else 
        {
            this._roomPreviewer.zoomOut();
        }

        this._roomPreviewer.addViewOffset = {x: this._offsetX, y: this._offsetY};

        if(this._canvasDisplayObject) 
        {
            this._canvasDisplayObject.scale.x = this._zoom;
            this._canvasDisplayObject.scale.y = this._zoom;
        }

        this.syncCanvasPosition();
    }

    // AS3: sources/win63_version/habbo/window/widgets/RoomPreviewerWidget.as::onClickRoomView()
    private onClickRoomView(): void 
    {
        this._roomPreviewer?.changeRoomObjectState();
    }

    /**
     * Handle resize of the room preview canvas.
     *
     * In AS3, updates the RoomPreviewer canvas dimensions.
     */
    private onResizeCanvas(): void 
    {
        if(this._root && this._roomPreviewer) 
        {
            this._roomPreviewer.modifyRoomCanvas(this._root.width, this._root.height);
            this.syncCanvasPosition();
        }
    }
}
