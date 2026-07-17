import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IWindowContainer} from '../IWindowContainer';
import {WindowType} from '../enum/WindowType';
import {buildCanvasFontString} from '../utils/CanvasFontString';
import {BitmapDataRenderer} from './renderer/BitmapDataRenderer';

type DrawBufferResolver = (window: IWindow) => OffscreenCanvas | null;

/**
 * Canvas composition and hit-test adapter for the web runtime.
 *
 * This class is not part of AS3 WindowRenderer itself; it contains the
 * bridge logic needed by the DOM canvas shell.
 *
 * Rendering here happens in two stages. `WindowRendererItem` drives the
 * `ISkinRenderer` for a window's *background* into a per-window buffer, which
 * this class then blits; content renderers that AS3 registers for the text,
 * label and bitmap window types are instead invoked directly from
 * `compositeWindow()` below, because `createRendererForType()` does not map
 * those types yet (they fall through to `NullSkinRenderer`). The renderer
 * classes themselves are faithful — see `BitmapDataRenderer` — but the caller
 * is not AS3's. Wiring them through `WindowRendererItem` needs the buffer
 * coordinates rebased to window-local and the `isStateDrawable(state) ===
 * (state === 0)` gate resolved for non-zero window states; until then these
 * two stages stay separate.
 */
export class WindowComposite
{
    // AS3: sources/win63_version/core/window/components/TextController.as::_field
    private static readonly FLASH_TEXT_FIELD_TOP_GUTTER: number = 2;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/utils/ModalDialog.as::COLOR_TRANSFORM
    // ColorTransform(0.25,0.25,0.25) multiplies R/G/B by 0.25 and leaves alpha
    // untouched — exactly what the CSS brightness() filter does, so no
    // approximation is needed here (unlike buildColorTransformFilter() below,
    // which combines multipliers/offsets/alpha and can't map 1:1 to filters).
    private static readonly MODAL_DARKEN_FILTER: string = 'brightness(25%)';

    // TS-only: distinguishes a plain pre-rendered bitmap (drawable straight
    // into the composite) from an externally-managed PixiJS DisplayObject
    // (needs the clearRect hole-punch instead — see compositeWindow()).
    private static isDrawableImage(value: unknown): value is CanvasImageSource
    {
        return value instanceof HTMLCanvasElement
            || value instanceof OffscreenCanvas
            || value instanceof HTMLImageElement
            || value instanceof ImageBitmap;
    }

    private _compositeBuffer: OffscreenCanvas | null = null;
    private _compositeCtx: OffscreenCanvasRenderingContext2D | null = null;
    // AS3 registers one BitmapDataRenderer per skin in the SkinContainer; this
    // port reaches the same drawing from compositeWindow() instead (see the
    // class note), so it holds a single stateless instance. The renderer keys
    // its own per-window pixel cache off window identity, so sharing it across
    // every bitmap-wrapper window is safe.
    private _bitmapDataRenderer: BitmapDataRenderer = new BitmapDataRenderer('bitmap');
    private _drawBufferResolver: DrawBufferResolver;

    constructor(drawBufferResolver: DrawBufferResolver)
    {
        this._drawBufferResolver = drawBufferResolver;
    }

    public composite(contexts: IWindowContext[], width: number, height: number): OffscreenCanvas
    {
        if(!this._compositeBuffer || (this._compositeBuffer.width !== width) || (this._compositeBuffer.height !== height))
        {
            this._compositeBuffer = new OffscreenCanvas(width, height);
            this._compositeCtx = this._compositeBuffer.getContext('2d');
        }

        const ctx = this._compositeCtx;

        if(!ctx)
        {
            return this._compositeBuffer!;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, width, height);

        for(let i = 0; i < contexts.length; i++)
        {
            const desktop = contexts[i].getDesktopWindow();

            if(!desktop || !desktop.visible)
            {
                continue;
            }

            const container = desktop as unknown as IWindowContainer;

            if(!this.isWindowContainer(container))
            {
                continue;
            }

            for(let j = 0; j < container.numChildren; j++)
            {
                const child = container.getChildAt(j);

                if(child)
                {
                    this.compositeWindow(ctx, child, 0, 0);
                }
            }
        }

        return this._compositeBuffer;
    }

    public findWindowAtPoint(contexts: IWindowContext[], x: number, y: number): IWindow | null
    {
        for(let i = contexts.length - 1; i >= 0; i--)
        {
            const desktop = contexts[i].getDesktopWindow();

            if(!desktop || !desktop.visible)
            {
                continue;
            }

            const container = desktop as unknown as IWindowContainer;

            if(!this.isWindowContainer(container))
            {
                continue;
            }

            for(let j = container.numChildren - 1; j >= 0; j--)
            {
                const child = container.getChildAt(j);

                if(!child)
                {
                    continue;
                }

                const hit = this.hitTestRecursive(child, x, y, 0, 0);

                if(hit)
                {
                    return hit;
                }
            }
        }

        return null;
    }

    public dispose(): void
    {
        this._compositeBuffer = null;
        this._compositeCtx = null;
        // Releases the renderer's per-window pixel cache — see
        // BitmapDataRenderer.dispose().
        this._bitmapDataRenderer.dispose();
    }

    /**
	 * Renders a single window (and its children) into its own scratch canvas,
	 * optionally darkened. Unlike `composite()`, this does not touch the
	 * shared `_compositeBuffer` — the returned canvas is freshly allocated and
	 * safe for the caller to own/consume (e.g. via `transferToImageBitmap()`).
	 *
	 * Used by ModalDialog to freeze a previous dialog's rendered appearance
	 * into the accumulated background snapshot when a new dialog stacks on
	 * top of it (AS3: `WindowController(param).getGraphicContext(true)`
	 * drawn with a ColorTransform onto the accumulated BitmapData).
	 */
    public renderWindowToCanvas(window: IWindow, width: number, height: number, darken: boolean = false): OffscreenCanvas
    {
        const canvas = new OffscreenCanvas(Math.max(1, width), Math.max(1, height));
        const ctx = canvas.getContext('2d');

        if(ctx)
        {
            ctx.imageSmoothingEnabled = false;

            if(darken)
            {
                ctx.filter = WindowComposite.MODAL_DARKEN_FILTER;
            }

            this.compositeWindow(ctx, window, 0, 0);
        }

        return canvas;
    }

    /**
	 * Draws `source` into a freshly allocated canvas with the modal-dialog
	 * darkening filter applied.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/window/utils/ModalDialog.as::refresh()
	 * (`_loc1_.colorTransform(_loc1_.rect, COLOR_TRANSFORM)`)
	 */
    public darken(source: OffscreenCanvas | ImageBitmap, width: number, height: number): OffscreenCanvas
    {
        const canvas = new OffscreenCanvas(Math.max(1, width), Math.max(1, height));
        const ctx = canvas.getContext('2d');

        if(ctx)
        {
            ctx.imageSmoothingEnabled = false;
            ctx.filter = WindowComposite.MODAL_DARKEN_FILTER;
            ctx.drawImage(source, 0, 0);
        }

        return canvas;
    }

    private getDrawBufferForRenderable(window: IWindow): OffscreenCanvas | null
    {
        return this._drawBufferResolver(window);
    }

    private isWindowContainer(target: unknown): target is IWindowContainer
    {
        return !!target
            && (typeof (target as IWindowContainer).numChildren === 'number')
            && (typeof (target as IWindowContainer).getChildAt === 'function');
    }

    private compositeWindow(
        ctx: OffscreenCanvasRenderingContext2D,
        window: IWindow,
        offsetX: number,
        offsetY: number
    ): void
    {
        if(!window.visible) return;

        const absX = offsetX + window.x + window.offsetX;
        const absY = offsetY + window.y + window.offsetY;
        const w = window.width;
        const h = window.height;

        if(w <= 0 || h <= 0) return;

        ctx.save();

        // Clip to window bounds
        if(window.clipping)
        {
            ctx.beginPath();
            ctx.rect(absX, absY, w, h);
            ctx.clip();
        }

        // display_object_wrapper windows (DisplayObjectWrapperController) hold no
        // bitmap content of their own by default — they exist to let an
        // externally-rendered PixiJS DisplayObject (e.g. a live room preview
        // canvas; see RoomPreviewerWidget) show through at this exact screen
        // position. A transparent *background* fill isn't enough for that:
        // fillRect with alpha 0 is a no-op blend, it doesn't erase whatever an
        // ancestor window already painted at these same pixels. clearRect
        // actually punches the hole through the composited buffer so the
        // separately-rendered PixiJS layer underneath is visible.
        //
        // A plain drawable (HTMLCanvasElement/ImageBitmap/etc, e.g. a static
        // avatar snapshot set via RoomPreviewerWidget.showPreview()) needs the
        // opposite treatment: it has no separate PIXI layer to show through
        // to, so punching a transparent hole here would just erase whatever
        // an ancestor already painted (e.g. the cover art behind it) without
        // anything replacing it. Draw it straight into the composite instead,
        // same as any other bitmap window.
        if(window.type === WindowType.DISPLAY_OBJECT_WRAPPER)
        {
            const displayObject = (window as unknown as {getDisplayObject?: () => unknown}).getDisplayObject?.();

            if(WindowComposite.isDrawableImage(displayObject))
            {
                ctx.drawImage(displayObject, absX, absY);
            }
            else
            {
                ctx.clearRect(absX, absY, w, h);
            }
        }

        // Apply blend (opacity)
        const blend = window.blend;

        if(blend < 1)
        {
            ctx.globalAlpha = blend;
        }

        // Bitmap wrappers apply the colour/dynamic-style transform exactly inside
        // BitmapDataRenderer.draw(); the CSS-filter approximation must not also run
        // for them, or the transform would be applied twice.
        const isBitmapWrapper = window.type === WindowType.BITMAP_WRAPPER || window.type === WindowType.STATIC_BITMAP_WRAPPER;

        // Apply dynamic style color transform as a CSS brightness/opacity filter.
        // In AS3 this was BitmapData.colorTransform() applied to each window's buffer.
        // Canvas 2D has no direct colorTransform API so we approximate with filters.
        const ctFilter = isBitmapWrapper ? '' : this.buildColorTransformFilter(window.dynamicStyleColor);

        if(ctFilter)
        {
            ctx.filter = ctFilter;
        }

        // Draw background fill if the window has one
        if(window.background)
        {
            const color = window.color;
            const a = ((color >>> 24) & 0xFF) / 255;
            const r = (color >> 16) & 0xFF;
            const g = (color >> 8) & 0xFF;
            const b = color & 0xFF;

            ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
            ctx.fillRect(absX, absY, w, h);
        }

        // Draw the skin buffer (skip for bitmap wrappers — their content is drawn via bitmapData below)
        if(!isBitmapWrapper)
        {
            const buffer = this.getDrawBufferForRenderable(window);

            if(buffer && buffer.width > 0 && buffer.height > 0)
            {
                ctx.drawImage(buffer, absX, absY);
            }
        }

        // Draw bitmapData content (zoom/flip, pivot, stretch, wrap/tiling, rotation,
        // etching silhouette, greyscale, color-multiply). The renderer reads
        // window.blend itself, so the globalAlpha set above is redundant for this
        // branch but harmless — it save()/restore()s around its own blit.
        if(isBitmapWrapper)
        {
            this._bitmapDataRenderer.draw(
                window,
                ctx,
                {x: absX, y: absY, width: w, height: h},
                window.state,
                false
            );
        }

        // Draw text content for text-type windows
        this.compositeText(ctx, window, absX, absY, w, h);

        // Reset filter before recursing into children so children apply their own
        if(ctFilter)
        {
            ctx.filter = 'none';
        }

        // Reset blend before recursing into children so children apply their own -
        // `blend` is a per-window property (see WindowUtils.disableSection(), which
        // dims a whole section by explicitly walking every child rather than relying
        // on a single ancestor's alpha to cascade), not an inherited display-list alpha.
        // Unconditional on purpose: a child with its own blend===1 must still get
        // globalAlpha reset to 1 even though it never sets it itself - otherwise a
        // translucent ancestor (e.g. styleselector_menu_new_xml's background border,
        // blend=0.8) leaks its globalAlpha onto every descendant drawn before
        // ctx.restore(), washing out unrelated child content (bug report: chat-style
        // picker previews rendering dark/muddy instead of their own colors).
        ctx.globalAlpha = 1;

        // Recurse into children
        const container = window as unknown as IWindowContainer;

        if(typeof container.numChildren === 'number')
        {
            for(let i = 0; i < container.numChildren; i++)
            {
                const child = container.getChildAt(i);

                if(child)
                {
                    this.compositeWindow(ctx, child, absX, absY);
                }
            }
        }

        ctx.restore();
    }

    /**
	 * Converts a DynamicStyle color transform to a CSS filter string.
	 *
	 * In AS3, colorTransform was applied directly to BitmapData pixels.
	 * Canvas 2D approximates this with brightness() and opacity() filters.
	 * Returns an empty string when the transform is identity (no-op).
	 *
	 * @see sources/win63_version/core/window/dynamicstyle/DynamicStyle.as getColorTransform()
	 */
    private buildColorTransformFilter(ct: IWindow['dynamicStyleColor']): string
    {
        if(!ct) return '';

        const { redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier,
            redOffset, greenOffset, blueOffset } = ct;

        const isIdentity =
            redMultiplier === 1 && greenMultiplier === 1 && blueMultiplier === 1
			&& alphaMultiplier === 1 && redOffset === 0 && greenOffset === 0 && blueOffset === 0;

        if(isIdentity) return '';

        const parts: string[] = [];

        // Average RGB multipliers → brightness
        const brightness = (redMultiplier + greenMultiplier + blueMultiplier) / 3;

        if(Math.abs(brightness - 1) > 0.005)
        {
            parts.push(`brightness(${(brightness * 100).toFixed(1)}%)`);
        }

        // Uniform RGB offset → additional brightness boost (offset 77 ≈ +30%)
        const offsetMag = (Math.abs(redOffset) + Math.abs(greenOffset) + Math.abs(blueOffset)) / 3;

        if(offsetMag > 0)
        {
            const boost = 1 + offsetMag / 255;
            parts.push(`brightness(${(boost * 100).toFixed(1)}%)`);
        }

        if(alphaMultiplier !== 1)
        {
            parts.push(`opacity(${(alphaMultiplier * 100).toFixed(1)}%)`);
        }

        return parts.join(' ');
    }

    /**
	 * Renders text content for text-type windows.
	 *
	 * In AS3, text was rendered by native Flash TextFields which were then
	 * composited as BitmapData via refreshTextImage(). In TypeScript, we
	 * render text directly onto the composite canvas using fillText().
	 *
	 * @param ctx - The 2D rendering context
	 * @param window - The window to render text for
	 * @param absX - Absolute X position
	 * @param absY - Absolute Y position
	 * @param w - Window width
	 * @param h - Window height
	 *
	 * @see sources/win63_2021_version/com/sulake/core/window/components/TextController.as refreshTextImage()
	 */
    // AS3: sources/win63_version/core/window/components/TextController.as::refreshTextImage()
    private compositeText(
        ctx: OffscreenCanvasRenderingContext2D,
        window: IWindow,
        absX: number,
        absY: number,
        w: number,
        h: number
    ): void
    {
        const type = window.type;

        if(type !== WindowType.TEXT && type !== WindowType.LABEL
			&& type !== WindowType.LINK && type !== WindowType.FORMATTED_TEXT
			&& type !== WindowType.TEXTFIELD && type !== WindowType.PASSWORD
			&& type !== WindowType.HTML)
        {
            return;
        }

        const typedWindow = window as unknown as { text?: string };
        const text = typedWindow.text ?? window.caption;

        if(!text) return;

        // Duck-type text properties from TextController
        const tw = window as unknown as {
            textColor?: number;
            fontSize?: number;
            fontFace?: string;
            bold?: boolean;
            italic?: boolean;
            underline?: boolean;
            multiline?: boolean;
            wordWrap?: boolean;
            etchingColor?: number;
            etchingPosition?: string;
            autoSize?: string;
            _autoSize?: string;
            spacing?: number;
            _spacing?: number;
            leading?: number;
            _leading?: number;
            marginLeft?: number;
            marginTop?: number;
            marginRight?: number;
            marginBottom?: number;
            _marginLeft?: number;
            _marginTop?: number;
            _marginRight?: number;
            _marginBottom?: number;
        };

        const fontSize = tw.fontSize ?? 12;
        const fontFace = tw.fontFace || 'Ubuntu, Arial, sans-serif';
        const isBold = tw.bold ?? false;
        const isItalic = tw.italic ?? false;

        // Text color from TextController.textColor (defaults to 0x000000 = black)
        const textColor = tw.textColor ?? 0x000000;
        const r = (textColor >> 16) & 0xFF;
        const g = (textColor >> 8) & 0xFF;
        const b = textColor & 0xFF;

        // Build CSS font string
        const fontStr = buildCanvasFontString(fontSize, fontFace, isBold, isItalic);

        ctx.font = fontStr;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.textBaseline = 'top';

        // Margins from TextController
        const marginL = tw.marginLeft ?? tw._marginLeft ?? 2;
        const isDropListTitleText = window.name === '_DROPLIST_TITLETEXT';
        const isDropListButtonText = window.name === '_BTN_TEXT'
			&& (window.parent?.type === WindowType.DROPMENU_ITEM || window.parent?.type === WindowType.DROPLIST_ITEM);
        const isCompactDropListText = isDropListTitleText || isDropListButtonText;
        const marginT = isCompactDropListText
            ? 0
            : tw.marginTop ?? tw._marginTop ?? 2;
        const marginR = tw.marginRight ?? tw._marginRight ?? 2;
        const marginB = isCompactDropListText
            ? 0
            : tw.marginBottom ?? tw._marginBottom ?? 2;
        const autoSize = (tw.autoSize ?? tw._autoSize ?? 'none').toLowerCase();
        const spacing = tw.spacing ?? tw._spacing ?? 0;
        const leading = tw.leading ?? tw._leading ?? 0;
        const maxWidth = w - marginL - marginR;
        const flashTextFieldTopGutter = isCompactDropListText
            ? 0
            : WindowComposite.FLASH_TEXT_FIELD_TOP_GUTTER;

        if(maxWidth <= 0) return;

        // Determine display text
        let displayText = text;

        if(type === WindowType.PASSWORD)
        {
            displayText = '\u2022'.repeat(text.length);
        }

        if(isCompactDropListText)
        {
            ctx.textBaseline = 'alphabetic';
        }

        // Etching (shadow text) support for il_* styles
        const etchColor = tw.etchingColor ?? 0;
        const hasEtching = etchColor !== 0 && ((etchColor >>> 24) & 0xFF) > 0;

        // Underline support for link windows
        if(type === WindowType.LINK || tw.underline)
        {
            ctx.save();

            const measuredWidth = this.measureTextWidth(ctx, displayText, spacing);
            const textW = Math.min(measuredWidth, maxWidth);
            const textX = this.resolveAlignedTextX(absX + marginL, maxWidth, measuredWidth, autoSize);
            const textY = absY + marginT + flashTextFieldTopGutter;

            if(hasEtching)
            {
                this.drawEtching(ctx, displayText, textX, textY, maxWidth, etchColor, tw.etchingPosition, spacing);
            }

            this.drawTextLine(ctx, displayText, textX, textY, maxWidth, spacing);

            // Draw underline
            const underlineY = textY + fontSize + 1;

            ctx.strokeStyle = `rgb(${r},${g},${b})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(textX, underlineY);
            ctx.lineTo(textX + textW, underlineY);
            ctx.stroke();
            ctx.restore();

            return;
        }

        // Multiline / word-wrap rendering
        if((tw.multiline || tw.wordWrap) && (type === WindowType.TEXT || type === WindowType.FORMATTED_TEXT || type === WindowType.HTML))
        {
            this.compositeTextMultiline(
                ctx,
                displayText,
                absX + marginL,
                absY + marginT + flashTextFieldTopGutter,
                maxWidth,
                h - marginT - marginB - flashTextFieldTopGutter,
                fontSize,
                tw.wordWrap ?? false,
                hasEtching ? etchColor : 0,
                tw.etchingPosition,
                spacing,
                leading,
                autoSize
            );

            return;
        }

        const measuredWidth = this.measureTextWidth(ctx, displayText, spacing);
        const textX = this.resolveAlignedTextX(absX + marginL, maxWidth, measuredWidth, autoSize);
        const textY = isCompactDropListText
            ? this.resolveCompactDropListTextY(ctx, displayText, absY, h, fontSize)
            : absY + marginT + flashTextFieldTopGutter;
        const clipY = isCompactDropListText ? absY : undefined;
        const clipHeight = isCompactDropListText ? h : undefined;

        if(hasEtching)
        {
            this.drawEtching(ctx, displayText, textX, textY, maxWidth, etchColor, tw.etchingPosition, spacing, clipY, clipHeight);
        }

        // Duck-type per-range TextFormat overrides from TextController
        // (chat-message links, and <b>/<i>/<u> runs from FormattedTextController's
        // HTML-lite parser — see TextController.setTextFormat()).
        const formatRuns = (window as unknown as {
            formatRuns?: ReadonlyArray<{ start: number; end: number; format: { color?: number | null; underline?: boolean | null; bold?: boolean | null; italic?: boolean | null } }>;
        }).formatRuns;

        if(formatRuns && formatRuns.length > 0)
        {
            this.drawTextLineWithRuns(ctx, displayText, formatRuns, textX, textY, maxWidth, spacing, fontSize, fontFace, isBold, isItalic, `rgb(${r},${g},${b})`, clipY, clipHeight);
        }
        else
        {
            this.drawTextLine(ctx, displayText, textX, textY, maxWidth, spacing, clipY, clipHeight);
        }
    }

    /**
	 * Renders multiline text with optional word wrapping.
	 *
	 * @param ctx - The 2D rendering context
	 * @param text - The text to render
	 * @param x - Start X position
	 * @param y - Start Y position
	 * @param maxWidth - Maximum line width
	 * @param maxHeight - Maximum total height
	 * @param fontSize - Font size for line height calculation
	 * @param wordWrap - Whether to wrap at word boundaries
	 */
    private compositeTextMultiline(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        maxHeight: number,
        fontSize: number,
        wordWrap: boolean,
        etchingColor: number = 0,
        etchingPosition?: string,
        spacing: number = 0,
        leading: number = 0,
        autoSize: string = 'none'
    ): void
    {
        const lineHeight = Math.max(1, fontSize + 2 + leading);
        const lines = text.split('\n');
        let currentY = y;
        const hasEtching = etchingColor !== 0 && ((etchingColor >>> 24) & 0xFF) > 0;

        for(const line of lines)
        {
            if(currentY + lineHeight > y + maxHeight)
            {
                break;
            }

            if(wordWrap && this.measureTextWidth(ctx, line, spacing) > maxWidth)
            {
                for(const wrappedLine of this.wrapLine(ctx, line, maxWidth, spacing))
                {
                    if(currentY + lineHeight > y + maxHeight)
                    {
                        break;
                    }

                    const measuredWidth = this.measureTextWidth(ctx, wrappedLine, spacing);
                    const drawX = this.resolveAlignedTextX(x, maxWidth, measuredWidth, autoSize);

                    if(hasEtching)
                    {
                        this.drawEtching(ctx, wrappedLine, drawX, currentY, maxWidth, etchingColor, etchingPosition, spacing);
                    }

                    this.drawTextLine(ctx, wrappedLine, drawX, currentY, maxWidth, spacing);
                    currentY += lineHeight;
                }
            }
            else
            {
                const measuredWidth = this.measureTextWidth(ctx, line, spacing);
                const drawX = this.resolveAlignedTextX(x, maxWidth, measuredWidth, autoSize);

                if(hasEtching)
                {
                    this.drawEtching(ctx, line, drawX, currentY, maxWidth, etchingColor, etchingPosition, spacing);
                }

                this.drawTextLine(ctx, line, drawX, currentY, maxWidth, spacing);
                currentY += lineHeight;
            }
        }
    }

    private resolveAlignedTextX(
        baseX: number,
        maxWidth: number,
        textWidth: number,
        autoSize: string
    ): number
    {
        if(autoSize === 'center')
        {
            return baseX + Math.max(0, Math.floor((maxWidth - textWidth) / 2));
        }

        if(autoSize === 'right')
        {
            return baseX + Math.max(0, Math.floor(maxWidth - textWidth));
        }

        return baseX;
    }

    private measureTextWidth(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        spacing: number
    ): number
    {
        if(!text)
        {
            return 0;
        }

        const width = ctx.measureText(text).width;

        if(spacing === 0 || text.length <= 1)
        {
            return width;
        }

        return width + ((text.length - 1) * spacing);
    }

    // AS3: sources/win63_version/core/window/graphics/renderer/TextSkinRenderer.as::draw()
    private resolveCompactDropListTextY(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        top: number,
        height: number,
        fontSize: number
    ): number
    {
        const metrics = ctx.measureText(text || 'Hg');
        const ascent = metrics.actualBoundingBoxAscent || Math.ceil(fontSize * 0.75);
        const descent = metrics.actualBoundingBoxDescent || Math.ceil(fontSize * 0.25);
        const textHeight = ascent + descent;
        const safeHeight = Math.max(1, height);

        if(textHeight <= safeHeight)
        {
            const flashTextFieldInnerOffset = 2;
            const centeredBaseline = top + ((safeHeight - textHeight) / 2) + ascent;
            const bottomSafeBaseline = top + safeHeight - descent;

            return Math.floor(Math.min(centeredBaseline + flashTextFieldInnerOffset, bottomSafeBaseline));
        }

        return Math.floor(top + safeHeight - descent);
    }

    private drawTextLine(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        spacing: number,
        clipY?: number,
        clipHeight?: number
    ): void
    {
        if(!text)
        {
            return;
        }

        const resolvedClipY = clipY ?? y - 2;
        const resolvedClipHeight = clipHeight ?? 4096;

        if(spacing === 0)
        {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, resolvedClipY, maxWidth, resolvedClipHeight);
            ctx.clip();
            ctx.fillText(text, x, y);
            ctx.restore();

            return;
        }

        let drawX = x;
        const maxX = x + maxWidth;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, resolvedClipY, maxWidth, resolvedClipHeight);
        ctx.clip();

        for(let i = 0; i < text.length; i++)
        {
            const char = text.charAt(i);
            const charWidth = ctx.measureText(char).width;

            if(drawX + charWidth > maxX)
            {
                break;
            }

            ctx.fillText(char, drawX, y);
            drawX += charWidth + spacing;
        }

        ctx.restore();
    }

    /**
	 * Per-character variant of drawTextLine() that applies a per-range color/
	 * underline override where a format run covers the character, and the
	 * base fill style everywhere else. Always walks character-by-character
	 * (unlike drawTextLine()'s spacing===0 fast path) since every char needs
	 * an independent run lookup.
	 *
	 * Driven by RoomChatItem.applyMessageLinks()'s TextController.setTextFormat()
	 * calls (AS3: sources/win63_version/habbo/ui/widget/roomchat/RoomChatItem.as::renderView(),
	 * the links/var_1993 branch).
	 */
    // TS-only: no AS3 equivalent — Flash's native TextField renders per-range
    // TextFormat runs itself; this is the Canvas2D port's replacement.
    private drawTextLineWithRuns(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        runs: ReadonlyArray<{ start: number; end: number; format: { color?: number | null; underline?: boolean | null; bold?: boolean | null; italic?: boolean | null } }>,
        x: number,
        y: number,
        maxWidth: number,
        spacing: number,
        fontSize: number,
        fontFace: string,
        baseBold: boolean,
        baseItalic: boolean,
        baseFillStyle: string,
        clipY?: number,
        clipHeight?: number
    ): void
    {
        if(!text) return;

        const resolvedClipY = clipY ?? y - 2;
        const resolvedClipHeight = clipHeight ?? 4096;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, resolvedClipY, maxWidth, resolvedClipHeight);
        ctx.clip();

        let drawX = x;
        const maxX = x + maxWidth;
        const baseFontStr = buildCanvasFontString(fontSize, fontFace, baseBold, baseItalic);
        let currentFontStr = baseFontStr;

        ctx.font = currentFontStr;

        for(let i = 0; i < text.length; i++)
        {
            const char = text.charAt(i);
            const run = runs.find((r) => i >= r.start && i < r.end);
            const runFontStr = run
                ? buildCanvasFontString(fontSize, fontFace, run.format.bold ?? baseBold, run.format.italic ?? baseItalic)
                : baseFontStr;

            if(runFontStr !== currentFontStr)
            {
                ctx.font = runFontStr;
                currentFontStr = runFontStr;
            }

            const charWidth = ctx.measureText(char).width;

            if(drawX + charWidth > maxX) break;

            const fillStyle = (run?.format.color != null) ? this.colorToRgbString(run.format.color) : baseFillStyle;

            ctx.fillStyle = fillStyle;
            ctx.fillText(char, drawX, y);

            if(run?.format.underline)
            {
                ctx.strokeStyle = fillStyle;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(drawX, y + fontSize + 1);
                ctx.lineTo(drawX + charWidth, y + fontSize + 1);
                ctx.stroke();
            }

            drawX += charWidth + spacing;
        }

        ctx.restore();
    }

    // TS-only: small ARGB->CSS helper shared by drawTextLineWithRuns().
    private colorToRgbString(color: number): string
    {
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        return `rgb(${r},${g},${b})`;
    }

    private wrapLine(
        ctx: OffscreenCanvasRenderingContext2D,
        line: string,
        maxWidth: number,
        spacing: number
    ): string[]
    {
        if(!line)
        {
            return [''];
        }

        const words = line.split(' ');
        const out: string[] = [];
        let current = '';

        for(const word of words)
        {
            const candidate = current ? `${current} ${word}` : word;

            if(this.measureTextWidth(ctx, candidate, spacing) <= maxWidth || !current)
            {
                current = candidate;
            }
            else
            {
                out.push(current);
                current = word;
            }

            if(this.measureTextWidth(ctx, current, spacing) > maxWidth)
            {
                const broken = this.wrapLongWord(ctx, current, maxWidth, spacing);

                if(broken.length > 0)
                {
                    out.push(...broken.slice(0, broken.length - 1));
                    current = broken[broken.length - 1];
                }
            }
        }

        if(current)
        {
            out.push(current);
        }

        return out;
    }

    private wrapLongWord(
        ctx: OffscreenCanvasRenderingContext2D,
        word: string,
        maxWidth: number,
        spacing: number
    ): string[]
    {
        const out: string[] = [];
        let current = '';

        for(let i = 0; i < word.length; i++)
        {
            const next = current + word.charAt(i);

            if(this.measureTextWidth(ctx, next, spacing) <= maxWidth || !current)
            {
                current = next;
            }
            else
            {
                out.push(current);
                current = word.charAt(i);
            }
        }

        if(current)
        {
            out.push(current);
        }

        return out;
    }

    /**
	 * Draws an etching (shadow) effect behind text.
	 *
	 * The etching is a 1px offset text in the given color, typically used
	 * by `il_*` styles to give a subtle raised/sunken appearance.
	 *
	 * @param ctx - The 2D rendering context
	 * @param text - The text to etch
	 * @param x - Text X position
	 * @param y - Text Y position
	 * @param maxWidth - Maximum text width
	 * @param color - ARGB etching color
	 * @param position - Etching direction (default: "bottom")
	 */
    private drawEtching(
        ctx: OffscreenCanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        color: number,
        position?: string,
        spacing: number = 0,
        clipY?: number,
        clipHeight?: number
    ): void
    {
        const a = ((color >>> 24) & 0xFF) / 255;
        const er = (color >> 16) & 0xFF;
        const eg = (color >> 8) & 0xFF;
        const eb = color & 0xFF;

        let dx: number;
        let dy: number;

        switch(position)
        {
            case 'top':
                dx = 0;
                dy = -1;
                break;
            case 'top-left':
                dx = -1;
                dy = -1;
                break;
            case 'top-right':
                dx = 1;
                dy = -1;
                break;
            case 'left':
                dx = -1;
                dy = 0;
                break;
            case 'right':
                dx = 1;
                dy = 0;
                break;
            case 'bottom-left':
                dx = -1;
                dy = 1;
                break;
            case 'bottom-right':
                dx = 1;
                dy = 1;
                break;
            case 'bottom':
            default:
                dx = 0;
                dy = 1;
                break;
        }

        const prevFill = ctx.fillStyle;

        ctx.fillStyle = `rgba(${er},${eg},${eb},${a})`;
        this.drawTextLine(ctx, text, x + dx, y + dy, maxWidth, spacing, clipY, clipHeight);
        ctx.fillStyle = prevFill;
    }

    /**
	 * Recursively hit-tests a window tree.
	 *
	 * Returns the deepest window that has INPUT_EVENT_PROCESSOR (param flag 1).
	 * Child windows without this flag (e.g. static bitmaps with param 208) are
	 * tested for bounds but not returned as targets — their parent region is
	 * returned instead. This mirrors AS3's event routing where mouse events
	 * target the INPUT_EVENT_PROCESSOR container, not its passive children.
	 *
	 * @param window - The window to test
	 * @param globalX - The global X coordinate
	 * @param globalY - The global Y coordinate
	 * @param offsetX - The parent's absolute X offset
	 * @param offsetY - The parent's absolute Y offset
	 * @returns The deepest INPUT_EVENT_PROCESSOR window at the point, or null
	 */
    private hitTestRecursive(
        window: IWindow,
        globalX: number,
        globalY: number,
        offsetX: number,
        offsetY: number
    ): IWindow | null
    {
        if(!window.visible) return null;

        // FLAG 9 = INTERNAL_EVENT_HANDLING → ignore mouse events
        if(window.testParamFlag(9))
        {
            return null;
        }

        const absX = offsetX + window.x;
        const absY = offsetY + window.y;
        const w = window.width;
        const h = window.height;

        // AABB bounds test
        if(globalX < absX || globalX >= absX + w || globalY < absY || globalY >= absY + h)
        {
            return null;
        }

        // Test children in reverse (topmost first)
        const container = window as unknown as IWindowContainer;

        if(typeof container.numChildren === 'number')
        {
            for(let i = container.numChildren - 1; i >= 0; i--)
            {
                const child = container.getChildAt(i);

                if(!child) continue;

                const hit = this.hitTestRecursive(child, globalX, globalY, absX, absY);

                if(hit) return hit;
            }
        }

        // Only return this window as a hit target if it is an INPUT_EVENT_PROCESSOR
        if(window.testParamFlag(1))
        {
            return window;
        }

        return null;
    }
}
