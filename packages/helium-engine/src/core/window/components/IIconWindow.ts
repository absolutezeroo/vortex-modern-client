import type {IWindow} from '../IWindow';

/**
 * Interface for icon windows.
 *
 * Provides access to the icon image URL for rendering.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IIconWindow.as
 */
export interface IIconWindow extends IWindow
{
    imageUrl: string;
}
