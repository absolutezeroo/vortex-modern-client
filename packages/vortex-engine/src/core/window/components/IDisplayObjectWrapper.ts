import type {IWindow} from '../IWindow';

/**
 * Interface for windows that wrap a display object.
 *
 * In the TypeScript port, display objects are represented as `unknown`
 * since Flash DisplayObject does not exist. The client layer provides
 * concrete rendering.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IDisplayObjectWrapper.as
 */
export interface IDisplayObjectWrapper extends IWindow
{
    setDisplayObject(displayObject: unknown): void;

    getDisplayObject(): unknown;
}
