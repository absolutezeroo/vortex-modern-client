import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IWindowContainer} from '../IWindowContainer';
import {WindowType} from '../enum/WindowType';
import {BitmapDataRenderer} from './renderer/BitmapDataRenderer';
import {LabelRenderer} from './renderer/LabelRenderer';
import {TextSkinRenderer} from './renderer/TextSkinRenderer';

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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/utils/ModalDialog.as::COLOR_TRANSFORM
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
    private _textSkinRenderer: TextSkinRenderer = new TextSkinRenderer('text');
    private _labelRenderer: LabelRenderer = new LabelRenderer('label');
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
        this._textSkinRenderer.dispose();
        this._labelRenderer.dispose();
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
        const textRenderer = this.resolveTextRenderer(window.type);

        if(textRenderer)
        {
            textRenderer.draw(window, ctx, {x: absX, y: absY, width: w, height: h}, window.state, false);
        }

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
	 * Returns the renderer that draws a window type's text content, or null if
	 * the type has none.
	 *
	 * Stands in for AS3's SkinContainer lookup. There, the skin descriptor names
	 * a renderer per window type and `getSkinRendererByTypeAndStyle()` resolves
	 * it; the mapping this reproduces is the one the game's own element
	 * description declares:
	 *
	 *     <window type="text"           renderer="text"  .../>
	 *     <window type="formatted_text" renderer="text"  .../>
	 *     <window type="password"       renderer="text"  .../>
	 *     <window type="link"           renderer="text"  .../>
	 *     <window type="label"          renderer="label" .../>
	 *
	 * TODO(AS3): TEXTFIELD and HTML are drawn here as text, but the element
	 * description maps neither to a text renderer — those two types have no
	 * entry at all, and AS3 relies on Flash compositing their TextField as a
	 * live child DisplayObject instead of blitting it through a skin renderer.
	 * Dropping them would stop their text rendering outright, so they keep the
	 * TextSkinRenderer path until that display path is ported.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/window/utils/_SafeCls_1859.as::parse()
    // (_SafeCls_1859 is SkinParserUtil — it implements no interface, so the name
    // comes from PRODUCTION-201601012205-226667486, which carries the same class
    // at the same path unobfuscated. `parse()` builds the renderer-name table.)
    private resolveTextRenderer(type: number): TextSkinRenderer | null
    {
        if(type === WindowType.LABEL) return this._labelRenderer;

        if(type === WindowType.TEXT || type === WindowType.LINK
			|| type === WindowType.FORMATTED_TEXT || type === WindowType.PASSWORD
			|| type === WindowType.TEXTFIELD || type === WindowType.HTML)
        {
            return this._textSkinRenderer;
        }

        return null;
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
