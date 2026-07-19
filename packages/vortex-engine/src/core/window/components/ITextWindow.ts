import type {IWindow} from '../IWindow';
import type {IScrollableWindow} from './IScrollableWindow';

/**
 * A per-range text format override, mirroring the subset of Flash's
 * `flash.text.TextFormat` that WindowComposite's Canvas2D text renderer can
 * actually apply per-range (see getTextFormat()/setTextFormat() below).
 *
 * TODO(AS3): AS3's TextFormat also has font/size/align/leftMargin/
 * rightMargin/indent/leading/url/target - not threaded through here since
 * no current caller (chat-message links, the only setTextFormat() consumer)
 * needs them, and the renderer only supports one font/size per text window.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/core/window/components/TextController.as::getTextFormat()
 */
export interface ITextFormat
{
    font?: string | null;
    size?: number | null;
    color?: number | null;
    bold?: boolean | null;
    italic?: boolean | null;
    underline?: boolean | null;
}

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
    underline: boolean;
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
    etchingColor: number;
    etchingPosition: string;
    border: boolean;

    appendText(text: string): void;

    replaceText(beginIndex: number, endIndex: number, newText: string): void;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/components/TextController.as::getCharIndexAtPoint()
    getCharIndexAtPoint(localX: number, localY: number): number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/components/TextController.as::getTextFormat()
    getTextFormat(beginIndex?: number, endIndex?: number): ITextFormat;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/components/TextController.as::setTextFormat()
    setTextFormat(format: ITextFormat, beginIndex?: number, endIndex?: number): void;
}
