/**
 * IRoomRenderingCanvas
 *
 * Based on AS3: com.sulake.room.renderer.IRoomRenderingCanvas
 *
 * Interface for a rendering canvas that displays room objects as sprites.
 * Handles rendering, mouse events, scaling, and viewport management.
 *
 * @see sources/win63_version/room/renderer/IRoomRenderingCanvas.as
 */
import type {Container, Renderer} from 'pixi.js';
import type {IRoomGeometry} from '../utils/IRoomGeometry';
import type {IRoomRenderingCanvasMouseListener} from './IRoomRenderingCanvasMouseListener';

export interface IRoomRenderingCanvas
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::get width()
    readonly width: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::get height()
    readonly height: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::get screenOffsetX()
    screenOffsetX: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::get screenOffsetY()
    screenOffsetY: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::get scale()
    readonly scale: number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::get geometry()
    readonly geometry: IRoomGeometry;

    mouseListener: IRoomRenderingCanvasMouseListener | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::useMask
    useMask: boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::fpsCounterEnabled
    fpsCounterEnabled: boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::initialize()
    initialize(width: number, height: number): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::render()
    render(time: number, force?: boolean): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::handleMouseEvent()
    handleMouseEvent(
        x: number,
        y: number,
        type: string,
        altKey: boolean,
        ctrlKey: boolean,
        shiftKey: boolean,
        buttonDown: boolean
    ): boolean;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::setScale()
    setScale(scale: number, point?: { x: number; y: number } | null, offset?: { x: number; y: number } | null): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::getId()
    getId(): number;

    update(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::takeScreenShot()
    // AS3 signature takes no arguments (Flash's Stage/DisplayObject could be
    // rasterized directly). PixiJS extraction requires an explicit Renderer,
    // which this engine-side class doesn't own, so the caller must supply one.
    takeScreenShot(renderer: Renderer): HTMLCanvasElement;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::skipSpriteVisibilityChecking()
    skipSpriteVisibilityChecking(): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::resumeSpriteVisibilityChecking()
    resumeSpriteVisibilityChecking(): void;

    /**
	 * The container this canvas draws into — AS3's `displayObject`, a PixiJS Container here.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::get displayObject()
    readonly container: Container;

    /**
	 * Latest measured round-trip to the server, stored for a debug overlay to print.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/renderer/IRoomRenderingCanvas.as::set pingMs()
    pingMs: number;

    // TODO(AS3): .../src/com/sulake/room/renderer/IRoomRenderingCanvas.as::getSortableSpriteList()
    // and getPlaneSortableSprites() both hand back sprite lists, and both delegate to
    // `_roomObjectCache` — the per-object sprite cache AS3 keeps beside the draw list and this
    // port does not.
    //
    // Blocker restated 2026-09-05, because the one this used to give was wrong. It said declaring
    // the first here would invert the layering, since `SortableSprite` lives in
    // `habbo/room/renderer/utils/` while this interface is generic `room/`, and that "AS3 gets away
    // with it by returning an untyped Array". AS3 returns `Vector.<RoomObjectSpriteData>` — only
    // the *second* method is untyped — and `RoomObjectSpriteData` lives in `com/sulake/room/data/`,
    // the same generic layer as this file. There is no inversion in AS3's shape.
    //
    // The real gap is that the two types are not the same thing. AS3's `RoomObjectSpriteData` is
    // the *serialisation* record — objectId, x/y/z, name, blendMode, flipH, skew, frame, color,
    // alpha, width, height, objectType, posture — which is the shape `SpriteDataCollector` emits as
    // the room-photo JSON. This port's `SortableSprite` is the renderer's own draw-order record,
    // a different thing that happens to be what its `getSortableSpriteList()` returns, which is why
    // `SpriteDataCollector` has to wrap every entry. Closing this means porting `_roomObjectCache`
    // and `RoomObjectSpriteData` for real, not moving a type: see `SpriteDataCollector`'s own two
    // markers for the rest of the same feature, and note the emulator's `RenderRoomMessageHandler`
    // is an 18-line accept-and-drop stub, so none of it is exercisable end to end today.

    dispose(): void;
}
