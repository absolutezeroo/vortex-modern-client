import type {IDisposable} from "../../runtime/IDisposable";

/**
 * Interface for a graphic context that manages rendering metadata.
 *
 * In AS3 this extended IBitmapDrawable and managed BitmapData.
 * In TypeScript this is abstracted to rendering metadata consumed by SolidJS.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/IGraphicContext.as
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
    fetchDrawBuffer(): unknown;

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
