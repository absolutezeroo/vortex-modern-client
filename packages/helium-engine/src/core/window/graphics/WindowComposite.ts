import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IWindowContainer} from '../IWindowContainer';
import {WindowParam} from '../enum/WindowParam';
import {PivotPoint} from '../enum/PivotPoint';
import {WindowType} from '../enum/WindowType';
import {quoteFontFamilyList} from '../utils/CanvasFontString';

type DrawBufferResolver = (window: IWindow) => OffscreenCanvas | null;

/**
 * PERFORMANCE CACHE — do not remove or "simplify away".
 *
 * Holds the fully-composited output of `compositeBitmapWrapper()` for one
 * bitmap-wrapper window, plus every input that output depends on. Rebuilding
 * that output requires `getImageData`/`putImageData` (in `tintBitmap()` and
 * `applyGreyscale()`), which are pixel-by-pixel CPU operations — by far the
 * most expensive step in the whole window-compositing pipeline (see
 * docs/STYLEGUIDE.md "Performance"). Without this cache, `compositeToBuffer()`
 * re-ran that pixel work for every bitmap-wrapper window on every single
 * frame where ANY window in the desktop was dirty, not just when that
 * window's own bitmap/colour actually changed.
 *
 * If you find this entry unused after a refactor, verify the replacement
 * still skips getImageData/putImageData when nothing changed before deleting
 * this — otherwise the CPU cost regresses silently (no functional bug, no
 * test failure, just a slower client).
 */
interface IBitmapWrapperCacheEntry
{
    canvas: OffscreenCanvas;
    ctx: OffscreenCanvasRenderingContext2D;
    bmp: ImageBitmap | null;
    zoomX: number;
    zoomY: number;
    isFlippedX: boolean;
    isFlippedY: boolean;
    stretchedX: boolean;
    stretchedY: boolean;
    wrapX: boolean;
    wrapY: boolean;
    rotation: number;
    greyscale: boolean;
    pivotPoint: number;
    etchColor: number;
    w: number;
    h: number;
    color: number;
    hasDynamicStyle: boolean;
    dsRedMultiplier: number;
    dsGreenMultiplier: number;
    dsBlueMultiplier: number;
    dsAlphaMultiplier: number;
    dsRedOffset: number;
    dsGreenOffset: number;
    dsBlueOffset: number;
    dsAlphaOffset: number;
}

/**
 * Canvas composition and hit-test adapter for the web runtime.
 *
 * This class is not part of AS3 WindowRenderer itself; it contains the
 * bridge logic needed by the DOM canvas shell.
 */
export class WindowComposite
{
    // AS3: sources/win63_version/core/window/components/TextController.as::_field
    private static readonly FLASH_TEXT_FIELD_TOP_GUTTER: number = 2;

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
    // See IBitmapWrapperCacheEntry doc comment above — perf-critical, keyed by
    // window identity, WeakMap so entries drop automatically once a window is
    // disposed and no longer referenced elsewhere.
    private _bitmapWrapperCache: WeakMap<IWindow, IBitmapWrapperCacheEntry> = new WeakMap();
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
        // WeakMap has no clear(); dropping the reference releases every entry.
        this._bitmapWrapperCache = new WeakMap();
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
        // compositeBitmapWrapper(); the CSS-filter approximation must not also run
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
        // etching silhouette, greyscale, color-multiply). Faithful port of AS3
        // BitmapDataRenderer.draw().
        if(isBitmapWrapper)
        {
            this.compositeBitmapWrapper(ctx, window, absX, absY, w, h, blend);
        }

        // Draw text content for text-type windows
        this.compositeText(ctx, window, absX, absY, w, h);

        // Reset filter before recursing into children so children apply their own
        if(ctFilter)
        {
            ctx.filter = 'none';
        }

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
	 * Faithful port of AS3 `BitmapDataRenderer.draw()`.
	 *
	 * Renders a bitmap-wrapper window's content into a per-window scratch buffer,
	 * applying — in the same order as Flash — rotation, zoom/flip, stretch, pivot
	 * placement, wrap/tiling, the etching silhouette, then the greyscale or
	 * color-multiply colour transform on the whole buffer, before blitting the
	 * result to the composite canvas clipped to the window bounds.
	 *
	 * @see sources/win63_version/core/window/graphics/renderer/BitmapDataRenderer.as
	 */
    private compositeBitmapWrapper(
        ctx: OffscreenCanvasRenderingContext2D,
        window: IWindow,
        absX: number,
        absY: number,
        w: number,
        h: number,
        blend: number
    ): void
    {
        const bdc = window as unknown as {
            bitmapData?: ImageBitmap | null;
            zoomX?: number;
            zoomY?: number;
            flipX?: boolean;
            flipY?: boolean;
            stretchedX?: boolean;
            stretchedY?: boolean;
            wrapX?: boolean;
            wrapY?: boolean;
            rotation?: number;
            greyscale?: boolean;
            etchingColor?: number;
            pivotPoint?: number;
        };

        const bmp = bdc.bitmapData ?? null;

        if(!bmp) return;

        const zoomX = bdc.zoomX ?? 1;
        const zoomY = bdc.zoomY ?? 1;
        // AS3 flips around an independent flipX/flipY flag XOR'd against the zoom
        // sign (BitmapDataRenderer.draw() l.68-69), not the zoom sign alone - a
        // negative zoom and flipX=true cancel out back to unflipped.
        const isFlippedX = (zoomX < 0) !== (bdc.flipX ?? false);
        const isFlippedY = (zoomY < 0) !== (bdc.flipY ?? false);
        const stretchedX = bdc.stretchedX ?? false;
        const stretchedY = bdc.stretchedY ?? false;
        const wrapX = bdc.wrapX ?? false;
        const wrapY = bdc.wrapY ?? false;
        const rotation = bdc.rotation ?? 0;
        const greyscale = bdc.greyscale ?? false;
        const pivotPoint = bdc.pivotPoint ?? PivotPoint.TOP_LEFT;
        const etchColor = bdc.etchingColor ?? 0;
        const etchPt = window.etchingPoint;
        const ds = window.dynamicStyleColor;

        // PERF: see IBitmapWrapperCacheEntry doc comment. Only re-run the
        // pixel-level compositing (rotate/tile/tint/greyscale) below when a
        // value it actually depends on has changed since the last frame;
        // otherwise reuse last frame's canvas as-is.
        const cached = this._bitmapWrapperCache.get(window) ?? null;
        const paramsUnchanged = cached !== null
			&& cached.bmp === bmp
			&& cached.zoomX === zoomX
			&& cached.zoomY === zoomY
			&& cached.isFlippedX === isFlippedX
			&& cached.isFlippedY === isFlippedY
			&& cached.stretchedX === stretchedX
			&& cached.stretchedY === stretchedY
			&& cached.wrapX === wrapX
			&& cached.wrapY === wrapY
			&& cached.rotation === rotation
			&& cached.greyscale === greyscale
			&& cached.pivotPoint === pivotPoint
			&& cached.etchColor === etchColor
			&& cached.w === w
			&& cached.h === h
			&& cached.color === window.color
			&& cached.hasDynamicStyle === (ds !== null)
			&& (ds === null
				|| (cached.dsRedMultiplier === ds.redMultiplier
					&& cached.dsGreenMultiplier === ds.greenMultiplier
					&& cached.dsBlueMultiplier === ds.blueMultiplier
					&& cached.dsAlphaMultiplier === ds.alphaMultiplier
					&& cached.dsRedOffset === ds.redOffset
					&& cached.dsGreenOffset === ds.greenOffset
					&& cached.dsBlueOffset === ds.blueOffset
					&& cached.dsAlphaOffset === ds.alphaOffset));

        const entry = this.acquireBitmapWrapperCacheEntry(window, cached, w, h);

        if(!entry) return;

        if(!paramsUnchanged)
        {
            const bctx = entry.ctx;

            bctx.imageSmoothingEnabled = false;
            bctx.setTransform(1, 0, 0, 1, 0, 0);
            bctx.clearRect(0, 0, w, h);

            // Rotation: pre-rotate the source around its centre (AS3 l.55-66).
            const source = rotation !== 0 ? this.rotateBitmap(bmp, rotation) : bmp;
            const srcW = bmp.width;
            const srcH = bmp.height;

            // Unsigned tile size (AS3 l.67-68 take Math.abs of the zoom-scaled size);
            // direction is applied separately via isFlippedX/isFlippedY below, since
            // flip is (zoom sign XOR flipX), not the zoom sign alone.
            const drawW = (stretchedX ? w : srcW) * Math.abs(zoomX);
            const drawH = (stretchedY ? h : srcH) * Math.abs(zoomY);

            if(drawW !== 0 && drawH !== 0)
            {
                // Tile counts (AS3 l.69-70).
                const tilesX = !wrapX ? 1 : Math.floor(w / drawW) + 2;
                const tilesY = !wrapY ? 1 : Math.floor(h / drawH) + 2;

                // Base position from pivot (AS3 l.73-116).
                let baseTx: number;

                switch(pivotPoint)
                {
                    case PivotPoint.TOP_CENTER:
                    case PivotPoint.CENTER:
                    case PivotPoint.BOTTOM_CENTER:
                        baseTx = Math.trunc((w - drawW) / 2);
                        break;
                    case PivotPoint.TOP_RIGHT:
                    case PivotPoint.CENTER_RIGHT:
                    case PivotPoint.BOTTOM_RIGHT:
                        baseTx = isFlippedX ? w : w - drawW;
                        break;
                    default:
                        baseTx = isFlippedX ? -drawW : 0;
                        break;
                }

                let baseTy: number;

                switch(pivotPoint)
                {
                    case PivotPoint.CENTER_LEFT:
                    case PivotPoint.CENTER:
                    case PivotPoint.CENTER_RIGHT:
                        baseTy = Math.trunc((h - drawH) / 2);
                        break;
                    case PivotPoint.BOTTOM_LEFT:
                    case PivotPoint.BOTTOM_CENTER:
                    case PivotPoint.BOTTOM_RIGHT:
                        baseTy = isFlippedY ? h : h - drawH;
                        break;
                    default:
                        baseTy = isFlippedY ? -drawH : 0;
                        break;
                }

                // Wrap start: shift back by one tile until <= 0 (AS3 l.91-94, 113-116).
                while(wrapX && baseTx > 0) baseTx -= drawW;
                while(wrapY && baseTy > 0) baseTy -= drawH;

                const etchAlpha = (etchColor >>> 24) & 0xFF;
                const drawEtch = etchAlpha > 0;
                const silhouette = drawEtch ? this.makeSilhouette(source, srcW, srcH, etchColor) : null;

                // In the non-greyscale branch AS3 applies the colour transform to the
                // MAIN bitmap only (not the etch), so pre-tint the source once.
                const tinted = !greyscale
                    ? this.tintBitmap(source, srcW, srcH, window.color, ds)
                    : null;
                const mainBitmap = tinted ?? source;

                // Scale sign carries the flip (AS3 l.75-76: MATRIX.a/d negated when
                // isFlipped), applied on top of the always-positive drawW/drawH.
                const scaleX = (isFlippedX ? -1 : 1) * drawW / srcW;
                const scaleY = (isFlippedY ? -1 : 1) * drawH / srcH;

                // Tile loop (AS3 l.127-176): etch silhouette first, then the main bitmap.
                for(let ty = 0; ty < tilesY; ty++)
                {
                    for(let tx = 0; tx < tilesX; tx++)
                    {
                        const px = baseTx + (tx * drawW);
                        const py = baseTy + (ty * drawH);

                        if(silhouette)
                        {
                            bctx.save();
                            bctx.globalAlpha = etchAlpha / 255;
                            bctx.setTransform(scaleX, 0, 0, scaleY, px + etchPt.x, py + etchPt.y);
                            bctx.drawImage(silhouette, 0, 0);
                            bctx.restore();
                        }

                        bctx.save();
                        bctx.setTransform(scaleX, 0, 0, scaleY, px, py);
                        bctx.drawImage(mainBitmap, 0, 0);
                        bctx.restore();
                    }
                }

                bctx.setTransform(1, 0, 0, 1, 0, 0);

                // Greyscale converts the WHOLE buffer to luminance, tinted by window.color
                // (AS3 l.133-146 applyFilter over param2.rect).
                if(greyscale)
                {
                    this.applyGreyscale(bctx, w, h, window.color);
                }
            }

            // Snapshot every input this render depended on, so next frame can
            // detect "nothing changed" and skip straight to the blit below.
            entry.bmp = bmp;
            entry.zoomX = zoomX;
            entry.zoomY = zoomY;
            entry.isFlippedX = isFlippedX;
            entry.isFlippedY = isFlippedY;
            entry.stretchedX = stretchedX;
            entry.stretchedY = stretchedY;
            entry.wrapX = wrapX;
            entry.wrapY = wrapY;
            entry.rotation = rotation;
            entry.greyscale = greyscale;
            entry.pivotPoint = pivotPoint;
            entry.etchColor = etchColor;
            entry.w = w;
            entry.h = h;
            entry.color = window.color;
            entry.hasDynamicStyle = ds !== null;
            entry.dsRedMultiplier = ds?.redMultiplier ?? 1;
            entry.dsGreenMultiplier = ds?.greenMultiplier ?? 1;
            entry.dsBlueMultiplier = ds?.blueMultiplier ?? 1;
            entry.dsAlphaMultiplier = ds?.alphaMultiplier ?? 1;
            entry.dsRedOffset = ds?.redOffset ?? 0;
            entry.dsGreenOffset = ds?.greenOffset ?? 0;
            entry.dsBlueOffset = ds?.blueOffset ?? 0;
            entry.dsAlphaOffset = ds?.alphaOffset ?? 0;
        }

        // Blit the (possibly cached, unchanged) buffer to the composite,
        // clipped to window bounds.
        ctx.save();
        ctx.beginPath();
        ctx.rect(absX, absY, w, h);
        ctx.clip();

        if(blend < 1) ctx.globalAlpha = blend;

        ctx.drawImage(entry.canvas, 0, 0, w, h, absX, absY, w, h);
        ctx.restore();
    }

    /**
	 * Gets or creates the persistent per-window canvas backing
	 * `IBitmapWrapperCacheEntry`. Resizing counts as a cache miss (the caller's
	 * `paramsUnchanged` check already covers `w`/`h`), so a fresh, blank entry
	 * is handed back for the caller to populate.
	 */
    private acquireBitmapWrapperCacheEntry(
        window: IWindow,
        cached: IBitmapWrapperCacheEntry | null,
        w: number,
        h: number
    ): IBitmapWrapperCacheEntry | null
    {
        const width = Math.max(1, w);
        const height = Math.max(1, h);

        if(cached && cached.canvas.width === width && cached.canvas.height === height)
        {
            return cached;
        }

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');

        if(!ctx) return null;

        // Sentinel values guarantee the very first comparison in
        // `compositeBitmapWrapper()` treats this entry as "changed".
        const entry: IBitmapWrapperCacheEntry = {
            canvas,
            ctx,
            bmp: null,
            zoomX: NaN,
            zoomY: NaN,
            isFlippedX: false,
            isFlippedY: false,
            stretchedX: false,
            stretchedY: false,
            wrapX: false,
            wrapY: false,
            rotation: NaN,
            greyscale: false,
            pivotPoint: -1,
            etchColor: NaN,
            w: -1,
            h: -1,
            color: NaN,
            hasDynamicStyle: false,
            dsRedMultiplier: NaN,
            dsGreenMultiplier: NaN,
            dsBlueMultiplier: NaN,
            dsAlphaMultiplier: NaN,
            dsRedOffset: NaN,
            dsGreenOffset: NaN,
            dsBlueOffset: NaN,
            dsAlphaOffset: NaN,
        };

        this._bitmapWrapperCache.set(window, entry);

        return entry;
    }

    /**
	 * Rotates a bitmap around its centre into a same-sized canvas (AS3 l.55-66).
	 */
    private rotateBitmap(bmp: ImageBitmap, degrees: number): OffscreenCanvas | ImageBitmap
    {
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const rctx = canvas.getContext('2d');

        if(!rctx) return bmp;

        rctx.imageSmoothingEnabled = false;
        rctx.translate(bmp.width / 2, bmp.height / 2);
        rctx.rotate((degrees / 180) * Math.PI);
        rctx.translate(-bmp.width / 2, -bmp.height / 2);
        rctx.drawImage(bmp, 0, 0);

        return canvas;
    }

    /**
	 * Builds a flat-colour silhouette of the bitmap (its alpha shape filled with
	 * the etch RGB). Mirrors AS3 `const_10` colour transform (RGB multipliers 0,
	 * offsets = etch colour). Drawn later at reduced alpha = etch alpha / 255.
	 */
    private makeSilhouette(
        source: OffscreenCanvas | ImageBitmap,
        srcW: number,
        srcH: number,
        etchColor: number
    ): OffscreenCanvas | null
    {
        const canvas = new OffscreenCanvas(srcW, srcH);
        const sctx = canvas.getContext('2d');

        if(!sctx) return null;

        const r = (etchColor >> 16) & 0xFF;
        const g = (etchColor >> 8) & 0xFF;
        const b = etchColor & 0xFF;

        sctx.imageSmoothingEnabled = false;
        sctx.drawImage(source, 0, 0);
        sctx.globalCompositeOperation = 'source-in';
        sctx.fillStyle = `rgb(${r},${g},${b})`;
        sctx.fillRect(0, 0, srcW, srcH);

        return canvas;
    }

    /**
	 * Applies the non-greyscale colour transform (AS3 `const_7`) to a copy of the
	 * source bitmap: multiply by window.color RGB, then concat the dynamic-style
	 * colour transform. Returns null when the transform is identity so the caller
	 * can draw the untouched source.
	 */
    private tintBitmap(
        source: OffscreenCanvas | ImageBitmap,
        srcW: number,
        srcH: number,
        color: number,
        ds: IWindow['dynamicStyleColor']
    ): OffscreenCanvas | null
    {
        let rMult = ((color >> 16) & 0xFF) / 255;
        let gMult = ((color >> 8) & 0xFF) / 255;
        let bMult = (color & 0xFF) / 255;
        let aMult = 1;
        let rOff = 0;
        let gOff = 0;
        let bOff = 0;
        let aOff = 0;

        // ColorTransform.concat: first has zero offsets, so result.offset = ds.offset
        // and result.mult = firstMult * ds.mult (AS3 l.157-160).
        if(ds)
        {
            rMult *= ds.redMultiplier;
            gMult *= ds.greenMultiplier;
            bMult *= ds.blueMultiplier;
            aMult = ds.alphaMultiplier;
            rOff = ds.redOffset;
            gOff = ds.greenOffset;
            bOff = ds.blueOffset;
            aOff = ds.alphaOffset;
        }

        const isIdentity = rMult === 1 && gMult === 1 && bMult === 1 && aMult === 1
			&& rOff === 0 && gOff === 0 && bOff === 0 && aOff === 0;

        if(isIdentity) return null;

        const canvas = new OffscreenCanvas(srcW, srcH);
        const tctx = canvas.getContext('2d');

        if(!tctx) return null;

        tctx.imageSmoothingEnabled = false;
        tctx.drawImage(source, 0, 0);

        const image = tctx.getImageData(0, 0, srcW, srcH);
        const data = image.data;

        for(let i = 0; i < data.length; i += 4)
        {
            data[i] = this.clampByte(data[i] * rMult + rOff);
            data[i + 1] = this.clampByte(data[i + 1] * gMult + gOff);
            data[i + 2] = this.clampByte(data[i + 2] * bMult + bOff);
            data[i + 3] = this.clampByte(data[i + 3] * aMult + aOff);
        }

        tctx.putImageData(image, 0, 0);

        return canvas;
    }

    /**
	 * Converts the whole scratch buffer to luminance, tinted by window.color
	 * (AS3 greyscale matrix l.135 — Rec.709 weights, per-channel colour multiply).
	 */
    private applyGreyscale(
        ctx: OffscreenCanvasRenderingContext2D,
        w: number,
        h: number,
        color: number
    ): void
    {
        const rMult = ((color >> 16) & 0xFF) / 255;
        const gMult = ((color >> 8) & 0xFF) / 255;
        const bMult = (color & 0xFF) / 255;

        const image = ctx.getImageData(0, 0, w, h);
        const data = image.data;

        for(let i = 0; i < data.length; i += 4)
        {
            const lum = (data[i] * 0.212671) + (data[i + 1] * 0.71516) + (data[i + 2] * 0.072169);

            data[i] = this.clampByte(rMult * lum);
            data[i + 1] = this.clampByte(gMult * lum);
            data[i + 2] = this.clampByte(bMult * lum);
            // Alpha unchanged (matrix alpha row = [0,0,0,1,0]).
        }

        ctx.putImageData(image, 0, 0);
    }

    private clampByte(value: number): number
    {
        if(value < 0) return 0;
        if(value > 255) return 255;

        return value;
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
        let fontStr = '';

        if(isItalic) fontStr += 'italic ';
        if(isBold) fontStr += 'bold ';
        fontStr += `${fontSize}px ${quoteFontFamilyList(fontFace)}`;

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

        this.drawTextLine(ctx, displayText, textX, textY, maxWidth, spacing, clipY, clipHeight);
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

        let dx = 0;
        let dy = 1;

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
