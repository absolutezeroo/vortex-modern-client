import type {IGraphicContext} from './IGraphicContext';

/**
 * Interface for objects that host a graphic context.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/graphics/IGraphicContextHost.as
 */
export interface IGraphicContextHost
{
    readonly name: string;

    getGraphicContext(createIfMissing: boolean): IGraphicContext | null;

    hasGraphicsContext(): boolean;
}
