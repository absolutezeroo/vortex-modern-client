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
	private _roomPreviewer: RoomPreviewer | null = null;
	private _canvasWrapper: IWindow | null = null;
	private _canvasDisplayObject: Container | null = null;

	private _onClickRoomViewBound: Function;
	private _onResizeCanvasBound: Function;
	private readonly _syncCanvasPositionBound = (): void => this.syncCanvasPosition();

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;

		this._onClickRoomViewBound = this.onClickRoomView.bind(this);
		this._onResizeCanvasBound = this.onResizeCanvas.bind(this);

		const root = this._windowManager.buildWidgetLayout('room_previewer') as IWindowContainer | null;

		if (root)
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

	private _roomEngine: IRoomEngine | null = null;

	// AS3: sources/win63_version/habbo/window/widgets/RoomPreviewerWidget.as constructor
	private createRoomPreviewer(root: IWindowContainer): void
	{
		const roomEngine = this._windowManager?.roomEngine;

		if (!roomEngine) return;

		RoomPreviewerWidget._roomIdCounter++;

		const previewRoomId = RoomPreviewerWidget._roomIdCounter;

		this._roomPreviewer = new RoomPreviewer(roomEngine, previewRoomId);
		this._roomPreviewer.createRoomForPreviews();

		const canvasWrapper = root.findChildByName('room_canvas') as unknown as IDisplayObjectWrapper | null;

		if (!canvasWrapper) return;

		const canvas = this._roomPreviewer.getRoomCanvas(root.width, root.height);

		if (canvas)
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
		if (!this._canvasDisplayObject || !this._canvasWrapper) return;

		const globalPosition = {x: 0, y: 0};

		this._canvasWrapper.getGlobalPosition(globalPosition);

		this._canvasDisplayObject.x = globalPosition.x;
		this._canvasDisplayObject.y = globalPosition.y;
		this._canvasDisplayObject.visible = this._canvasWrapper.visible;
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
	}

	private _offsetX: number = 0;

	public get offsetX(): number
	{
		return this._offsetX;
	}

	public set offsetX(value: number)
	{
		this._offsetX = value;
	}

	private _offsetY: number = 0;

	public get offsetY(): number
	{
		return this._offsetY;
	}

	public set offsetY(value: number)
	{
		this._offsetY = value;
	}

	private _zoom: number = 1;

	public get zoom(): number
	{
		return this._zoom;
	}

	public set zoom(value: number)
	{
		this._zoom = value;
	}

	public get roomPreviewer(): RoomPreviewer | null
	{
		return this._roomPreviewer;
	}

	private _previewImageUrl: string = '';

	/**
	 * The static preview image URL, if set via showPreview().
	 */
	public get previewImageUrl(): string
	{
		return this._previewImageUrl;
	}

	public get properties(): PropertyStruct[]
	{
		if (this._disposed) return [];

		return [
			new PropertyStruct(RoomPreviewerWidget.SCALE_KEY, this._scale),
			new PropertyStruct(RoomPreviewerWidget.OFFSET_X_KEY, this._offsetX),
			new PropertyStruct(RoomPreviewerWidget.OFFSET_Y_KEY, this._offsetY),
			new PropertyStruct(RoomPreviewerWidget.ZOOM_KEY, this._zoom),
		];
	}

	public set properties(values: PropertyStruct[])
	{
		for (const prop of values)
		{
			switch (prop.key)
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

	public showPreview(imageUrl: string): void
	{
		this._previewImageUrl = imageUrl;
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		this._roomEngine?.unregisterCanvasSyncCallback(this._syncCanvasPositionBound);
		this._roomEngine = null;
		this._canvasWrapper = null;
		this._canvasDisplayObject = null;

		if (this._root)
		{
			this._root.removeEventListener(WindowMouseEvent.CLICK, this._onClickRoomViewBound);
			this._root.removeEventListener(WindowEvent.WE_RESIZE, this._onResizeCanvasBound);
			this._root.dispose();
			this._root = null;
		}

		if (this._widgetWindow)
		{
			this._widgetWindow.rootWindow = null;
		}

		this._widgetWindow = null;
		this._windowManager = null;
		this._roomPreviewer?.dispose();
		this._roomPreviewer = null;
	}

	/**
	 * Handle click on the room preview canvas.
	 *
	 * In AS3, forwards click coordinates to the RoomPreviewer.
	 */
	private onClickRoomView(): void
	{
		// TODO: Forward click to RoomPreviewer when integrated
	}

	/**
	 * Handle resize of the room preview canvas.
	 *
	 * In AS3, updates the RoomPreviewer canvas dimensions.
	 */
	private onResizeCanvas(): void
	{
		if (this._root && this._roomPreviewer)
		{
			this._roomPreviewer.modifyRoomCanvas(this._root.width, this._root.height);
			this.syncCanvasPosition();
		}
	}
}
