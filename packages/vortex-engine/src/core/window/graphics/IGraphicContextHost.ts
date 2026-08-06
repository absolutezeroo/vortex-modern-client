import type {IGraphicContext} from './IGraphicContext';

/**
 * Interface for objects that host a graphic context.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/IGraphicContextHost.as
 */
export interface IGraphicContextHost
{
    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContextHost.as::get name()
    readonly name: string;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContextHost.as::getGraphicContext()
    getGraphicContext(createIfMissing: boolean): IGraphicContext | null;

    // AS3: .../src/com/sulake/core/window/graphics/IGraphicContextHost.as::hasGraphicsContext()
    hasGraphicsContext(): boolean;
}
