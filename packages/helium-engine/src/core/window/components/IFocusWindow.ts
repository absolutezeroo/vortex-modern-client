/**
 * Interface for focusable windows.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IFocusWindow.as
 */
export interface IFocusWindow
{
	readonly focused: boolean;

	focus(): boolean;

	unfocus(): boolean;
}
