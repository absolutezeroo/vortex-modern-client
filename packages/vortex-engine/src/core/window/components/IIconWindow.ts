import type {IWindow} from '../IWindow';

/**
 * Interface for icon windows.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/core/window/components/IIconWindow.as
 */
export interface IIconWindow extends IWindow
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/components/IIconWindow.as::fitToSize()
    fitToSize(): void;
}
