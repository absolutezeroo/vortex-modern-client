import type {ITextFieldWindow} from './ITextFieldWindow';

/**
 * Interface for HTML text windows with link support.
 *
 * AS3 `_SafeCls_2117` extends ITextFieldWindow (adding linkTarget/initializeLinkStyle); the concrete
 * HTMLTextController extends TextFieldController and already implements that surface, so this extends
 * ITextFieldWindow to expose text/selectable/fontSize (needed by wired HtmlPreset), not just IWindow.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/IHTMLTextWindow.as
 */
export interface IHTMLTextWindow extends ITextFieldWindow
{
    html: string;
    linkTarget: string;
}
