import type {IWindow} from '../IWindow';
import type {IScrollableWindow} from './IScrollableWindow';

/**
 * Interface for text windows.
 *
 * Provides access to text content, formatting properties (font, size, bold,
 * italic, color), scrolling, and margins.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/components/ITextWindow.as
 */
export interface ITextWindow extends IWindow, IScrollableWindow
{
    readonly bold: boolean;
    readonly italic: boolean;
    readonly underline: boolean;
    readonly fontFace: string;
    readonly fontSize: number;
    readonly length: number;
    readonly numLines: number;
    readonly textHeight: number;
    readonly textWidth: number;

    text: string;
    textColor: number;
    textBackground: boolean;
    textBackgroundColor: number;
    maxChars: number;
    multiline: boolean;
    wordWrap: boolean;
    autoSize: string;

    appendText(text: string): void;

    replaceText(beginIndex: number, endIndex: number, newText: string): void;
}
