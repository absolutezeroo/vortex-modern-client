import type {Container, Point, Rectangle} from 'pixi.js';
import type {IChatTextFormat} from '@habbo/freeflowchat/style/IChatStyle';

/**
 * IChatLinkStyleSheet
 *
 * Minimal subset of AS3 flash.text.StyleSheet actually populated by
 * ChatStyleLibrary — the hyperlink colors used inside `allowHTML` bubbles
 * (the `a:link` / `a:hover` / `a:active` CSS-like rules).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/ChatStyleLibrary.as::initializeStyleFromAssets()
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
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/visualization/style/_SafeCls_1776.as
 * (readable name recovered from sources/win63_2023_version/com/sulake/habbo/freeflowchat/viewer/visualization/style/IChatStyleInternal.as,
 * which only carries a partial member list — the primary source above is the fuller, ground-truth version)
 */
export interface IChatStyleInternal
{
    getNewBackgroundSprite(tint?: number): Container;

    readonly textFormat: IChatTextFormat;
    readonly styleSheet: IChatLinkStyleSheet | null;
    readonly pointer: ImageBitmap | null;
    readonly pointerOffsetToBubbleBottom: number;

    getPointerLeftMargin(defaultValue: number): number;

    getPointerRightMargin(defaultValue: number): number;

    readonly faceOffset: Point | null;

    getEmblem(multiline?: boolean): ImageBitmap | null;

    getEmblemOffset(multiline?: boolean): Point | null;

    readonly textFieldMargins: Rectangle;
    readonly overlap: Rectangle | null;
    readonly allowHTML: boolean;
    readonly isAnonymous: boolean;
    readonly isSystemStyle: boolean;
    readonly isNotification: boolean;
}
