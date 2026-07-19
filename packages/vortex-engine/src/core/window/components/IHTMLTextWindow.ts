import type {IWindow} from '../IWindow';

/**
 * Interface for HTML text windows with link support.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IHTMLTextWindow.as
 */
export interface IHTMLTextWindow extends IWindow
{
    html: string;
    linkTarget: string;
}
