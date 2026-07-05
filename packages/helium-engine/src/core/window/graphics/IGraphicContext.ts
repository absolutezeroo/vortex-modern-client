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
    filters: unknown[];
    visible: boolean;
    blend: number;
    mouse: boolean;

    readonly numChildContexts: number;

    offset(x: number, y: number): void;

    getDrawRegion(): { x: number; y: number; width: number; height: number };

    fetchDrawBuffer(): unknown;

    addChildContext(context: IGraphicContext): IGraphicContext;

    addChildContextAt(context: IGraphicContext, index: number): IGraphicContext;

    getChildContextAt(index: number): IGraphicContext;

    getChildContextIndex(context: IGraphicContext): number;

    removeChildContext(context: IGraphicContext): IGraphicContext;

    removeChildContextAt(index: number): IGraphicContext;

    setChildContextIndex(context: IGraphicContext, index: number): void;

    swapChildContexts(a: IGraphicContext, b: IGraphicContext): void;

    swapChildContextsAt(indexA: number, indexB: number): void;
}
