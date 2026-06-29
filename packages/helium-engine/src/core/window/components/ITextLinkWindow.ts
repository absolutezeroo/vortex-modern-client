import type {IWindow} from '../IWindow';

/**
 * Interface for text link windows.
 *
 * Extends IWindow with a link property representing the URL
 * or action associated with the text link.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ITextLinkWindow.as
 */
export interface ITextLinkWindow extends IWindow
{
	link: string;
}
