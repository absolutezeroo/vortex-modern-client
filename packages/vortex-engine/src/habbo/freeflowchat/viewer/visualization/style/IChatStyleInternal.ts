import type {Container, Point, Rectangle} from 'pixi.js';
import type {IChatTextFormat} from '@habbo/freeflowchat/style/IChatStyle';

/**
 * IChatLinkStyleSheet
 *
 * Minimal subset of AS3 flash.text.StyleSheet actually populated by
 * ChatStyleLibrary — the hyperlink colors used inside `allowHTML` bubbles
 * (the `a:link` / `a:hover` / `a:active` CSS-like rules).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::initializeStyleFromAssets()
 */
export interface IChatLinkStyleSheet
{
    linkColor: string;
    linkHoverColor: string;
    linkActiveColor: string;
}

/**
 * IChatStyleInternal Interface
 *
 * Extended chat style contract used internally within the freeflowchat
 * viewer package (bubble text positioning, pointer/emblem placement, link
 * styling) — a superset of the public IChatStyle contract.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as
 * (readable name recovered from sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/IChatStyleInternal.as,
 * which only carries a partial member list — the primary source above is the fuller, ground-truth version)
 */
export interface IChatStyleInternal
{
    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::getNewBackgroundSprite()
    getNewBackgroundSprite(tint?: number): Container;

    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get textFormat()
    readonly textFormat: IChatTextFormat;
    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get styleSheet()
    readonly styleSheet: IChatLinkStyleSheet | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get pointer()
    readonly pointer: ImageBitmap | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get pointerOffsetToBubbleBottom()
    readonly pointerOffsetToBubbleBottom: number;

    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::getPointerLeftMargin()
    getPointerLeftMargin(defaultValue: number): number;

    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::getPointerRightMargin()
    getPointerRightMargin(defaultValue: number): number;

    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get faceOffset()
    readonly faceOffset: Point | null;

    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::getEmblem()
    getEmblem(multiline?: boolean): ImageBitmap | null;

    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::getEmblemOffset()
    getEmblemOffset(multiline?: boolean): Point | null;

    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get textFieldMargins()
    readonly textFieldMargins: Rectangle;
    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get overlap()
    readonly overlap: Rectangle | null;
    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get allowHTML()
    readonly allowHTML: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get isAnonymous()
    readonly isAnonymous: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get isSystemStyle()
    readonly isSystemStyle: boolean;
    // AS3: .../src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as::get isNotification()
    readonly isNotification: boolean;
}
