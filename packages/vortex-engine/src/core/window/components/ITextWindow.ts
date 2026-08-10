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
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::getTextFormat()
 */
export interface ITextFormat
{
    font?: string | null;
    size?: number | null;
    color?: number | null;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get bold()
    bold?: boolean | null;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get italic()
    italic?: boolean | null;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get underline()
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
    // TextController has had a setter all along; the interface declared `bold` read-only, so
    // callers that need it (the mannequin's name field, SearchView's placeholder, and now every
    // forum row, which bolds an unread thread) had to cast around the type. The same was already
    // true of `italic` below.
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get bold()
    bold: boolean;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get italic()
    italic: boolean;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get underline()
    underline: boolean;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get fontFace()
    readonly fontFace: string;
    // AS3 ITextWindow exposes fontSize as read/write; TextController already implements the setter.
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get fontSize()
    fontSize: number;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get length()
    readonly length: number;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get numLines()
    readonly numLines: number;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textHeight()
    readonly textHeight: number;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textWidth()
    readonly textWidth: number;

    // AS3: .../src/com/sulake/core/window/components/TextController.as::get text()
    text: string;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/ITextWindow.as::get htmlText()
    // Declared on AS3's ITextWindow (lines 37 and 107) and implemented by this port's
    // TextController all along — the interface simply never exposed it, so a caster to
    // ITextWindow could not reach it. PollOfferDialog is the first ported caller that needs it.
    htmlText: string;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textColor()
    textColor: number;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textBackground()
    textBackground: boolean;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get textBackgroundColor()
    textBackgroundColor: number;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get maxChars()
    maxChars: number;
    // AS3-settable line cap (TextController implements it); used by wired TextPreset multiline mode.
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get maxLines()
    maxLines: number;
    // AS3-settable overflow ellipsis replacement (TextController implements it); wired overflow mode.
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get overflowReplace()
    overflowReplace: string;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get multiline()
    multiline: boolean;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get wordWrap()
    wordWrap: boolean;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get autoSize()
    autoSize: string;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get etchingColor()
    etchingColor: number;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get etchingPosition()
    etchingPosition: string;
    // AS3: .../src/com/sulake/core/window/components/TextController.as::get border()
    border: boolean;

    // AS3: .../src/com/sulake/core/window/components/TextController.as::appendText()
    appendText(text: string): void;

    // AS3: .../src/com/sulake/core/window/components/TextController.as::replaceText()
    replaceText(beginIndex: number, endIndex: number, newText: string): void;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::getCharIndexAtPoint()
    getCharIndexAtPoint(localX: number, localY: number): number;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::getTextFormat()
    getTextFormat(beginIndex?: number, endIndex?: number): ITextFormat;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/core/window/components/TextController.as::setTextFormat()
    setTextFormat(format: ITextFormat, beginIndex?: number, endIndex?: number): void;
}
