import type {IDisposable} from "../../runtime/IDisposable";

/**
 * Interface for a graphic context: a node of the window system's own render
 * tree, owning the draw buffer its window renders into.
 *
 * In AS3 the implementation extends `Sprite` and the buffer is the `BitmapData`
 * of a child `Bitmap`. The port has no Flash display list, so the buffer is an
 * `OffscreenCanvas` and child contexts live in an array — see
 * `GraphicContext` for what that costs and what it keeps.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/graphics/IGraphicContext.as
 */
export interface IGraphicContext extends IDisposable
{
    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::get filters()
    filters: unknown[];
    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::get visible()
    visible: boolean;
    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::get blend()
    blend: number;
    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::get mouse()
    mouse: boolean;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::get numChildContexts()
    readonly numChildContexts: number;

    offset(x: number, y: number): void;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::getDrawRegion()
    getDrawRegion(): { x: number; y: number; width: number; height: number };

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::fetchDrawBuffer()
    fetchDrawBuffer(): OffscreenCanvas | null;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::allocateDrawBuffer()
    allocateDrawBuffer(width: number, height: number): OffscreenCanvas | null;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::releaseDrawBuffer()
    releaseDrawBuffer(): void;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::setDrawRegion()
    setDrawRegion(
        rect: { x: number; y: number; width: number; height: number },
        reallocate: boolean,
        maskRect: { x: number; y: number; width: number; height: number } | null
    ): OffscreenCanvas | null;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::getChildContextByName()
    getChildContextByName(name: string): IGraphicContext | null;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::showRedrawRegion()
    showRedrawRegion(rect: { x: number; y: number; width: number; height: number } | null): void;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::addChildContext()
    addChildContext(context: IGraphicContext): IGraphicContext;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::addChildContextAt()
    addChildContextAt(context: IGraphicContext, index: number): IGraphicContext;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::getChildContextAt()
    getChildContextAt(index: number): IGraphicContext;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::getChildContextIndex()
    getChildContextIndex(context: IGraphicContext): number;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::removeChildContext()
    removeChildContext(context: IGraphicContext): IGraphicContext;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::removeChildContextAt()
    removeChildContextAt(index: number): IGraphicContext;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::setChildContextIndex()
    setChildContextIndex(context: IGraphicContext, index: number): void;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::swapChildContexts()
    swapChildContexts(a: IGraphicContext, b: IGraphicContext): void;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContext.as::swapChildContextsAt()
    swapChildContextsAt(indexA: number, indexB: number): void;
}
