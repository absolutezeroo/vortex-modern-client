import type {IWindow} from '../IWindow';
import type {IWindowContext} from '../IWindowContext';
import type {IWindowContainer} from '../IWindowContainer';
import {WindowParam} from '../enum/WindowParam';
import {PivotPoint} from '../enum/PivotPoint';
import {WindowType} from '../enum/WindowType';

type DrawBufferResolver = (window: IWindow) => OffscreenCanvas | null;

/**
 * Canvas composition and hit-test adapter for the web runtime.
 *
 * This class is not part of AS3 WindowRenderer itself; it contains the
 * bridge logic needed by the DOM canvas shell.
 */
export class WindowComposite
{
    private _compositeBuffer: OffscreenCanvas | null = null;
    private _compositeCtx: OffscreenCanvasRenderingContext2D | null = null;
    private _bitmapBuffer: OffscreenCanvas | null = null;
    private _bitmapCtx: OffscreenCanvasRenderingContext2D | null = null;
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
        this._bitmapBuffer = null;
        this._bitmapCtx = null;
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
		if (!window.visible) return;

		const absX = offsetX + window.x + window.offsetX;
		const absY = offsetY + window.y + window.offsetY;
		const w = window.width;
		const h = window.height;

		if (w <= 0 || h <= 0) return;

		ctx.save();

		// Clip to window bounds
		if (window.clipping)
		{
			ctx.beginPath();
			ctx.rect(absX, absY, w, h);
			ctx.clip();
		}

		// Apply blend (opacity)
		const blend = window.blend;

		if (blend < 1)
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

		if (ctFilter)
		{
			ctx.filter = ctFilter;
		}

		// Draw background fill if the window has one
		if (window.background)
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
		if (!isBitmapWrapper)
		{
			const buffer = this.getDrawBufferForRenderable(window);

			if (buffer && buffer.width > 0 && buffer.height > 0)
			{
				ctx.drawImage(buffer, absX, absY);
			}
		}

		// Draw bitmapData content (zoom/flip, pivot, stretch, wrap/tiling, rotation,
		// etching silhouette, greyscale, color-multiply). Faithful port of AS3
		// BitmapDataRenderer.draw().
		if (isBitmapWrapper)
		{
			this.compositeBitmapWrapper(ctx, window, absX, absY, w, h, blend);
		}

		// Draw text content for text-type windows
		this.compositeText(ctx, window, absX, absY, w, h);

		// Reset filter before recursing into children so children apply their own
		if (ctFilter)
		{
			ctx.filter = 'none';
		}

		// Recurse into children
		const container = window as unknown as IWindowContainer;

		if (typeof container.numChildren === 'number')
		{
			for (let i = 0; i < container.numChildren; i++)
			{
				const child = container.getChildAt(i);

				if (child)
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

		if (!bmp) return;

		const zoomX = bdc.zoomX ?? 1;
		const zoomY = bdc.zoomY ?? 1;
		const stretchedX = bdc.stretchedX ?? false;
		const stretchedY = bdc.stretchedY ?? false;
		const wrapX = bdc.wrapX ?? false;
		const wrapY = bdc.wrapY ?? false;
		const rotation = bdc.rotation ?? 0;
		const greyscale = bdc.greyscale ?? false;
		const pivotPoint = bdc.pivotPoint ?? PivotPoint.TOP_LEFT;
		const etchColor = bdc.etchingColor ?? 0;
		const etchPt = window.etchingPoint;

		// Per-window scratch buffer = AS3 `param2` BitmapData.
		const buffer = this.acquireBitmapBuffer(w, h);
		const bctx = this._bitmapCtx;

		if (!buffer || !bctx) return;

		bctx.imageSmoothingEnabled = false;
		bctx.setTransform(1, 0, 0, 1, 0, 0);
		bctx.clearRect(0, 0, w, h);

		// Rotation: pre-rotate the source around its centre (AS3 l.55-66).
		const source = rotation !== 0 ? this.rotateBitmap(bmp, rotation) : bmp;
		const srcW = bmp.width;
		const srcH = bmp.height;

		// Signed tile size — a negative zoom flips the bitmap (AS3 l.67-68).
		const drawW = (stretchedX ? w : srcW) * zoomX;
		const drawH = (stretchedY ? h : srcH) * zoomY;

		if (drawW === 0 || drawH === 0) return;

		// Tile counts (AS3 l.69-70). Mirrors the signed division.
		const tilesX = !wrapX ? 1 : Math.floor(w / drawW) + 2;
		const tilesY = !wrapY ? 1 : Math.floor(h / drawH) + 2;

		// Base position from pivot (AS3 l.73-116).
		let baseTx: number;

		switch (pivotPoint)
		{
			case PivotPoint.TOP_CENTER:
			case PivotPoint.CENTER:
			case PivotPoint.BOTTOM_CENTER:
				baseTx = Math.trunc((w - drawW) / 2);
				break;
			case PivotPoint.TOP_RIGHT:
			case PivotPoint.CENTER_RIGHT:
			case PivotPoint.BOTTOM_RIGHT:
				baseTx = zoomX < 0 ? w : w - drawW;
				break;
			default:
				baseTx = zoomX < 0 ? -drawW : 0;
				break;
		}

		let baseTy: number;

		switch (pivotPoint)
		{
			case PivotPoint.CENTER_LEFT:
			case PivotPoint.CENTER:
			case PivotPoint.CENTER_RIGHT:
				baseTy = Math.trunc((h - drawH) / 2);
				break;
			case PivotPoint.BOTTOM_LEFT:
			case PivotPoint.BOTTOM_CENTER:
			case PivotPoint.BOTTOM_RIGHT:
				baseTy = zoomY < 0 ? h : h - drawH;
				break;
			default:
				baseTy = zoomY < 0 ? -drawH : 0;
				break;
		}

		// Wrap start: shift back by one tile until <= 0 (AS3 l.91-94, 113-116).
		while (wrapX && baseTx > 0) baseTx -= drawW;
		while (wrapY && baseTy > 0) baseTy -= drawH;

		const etchAlpha = (etchColor >>> 24) & 0xFF;
		const drawEtch = etchAlpha > 0;
		const silhouette = drawEtch ? this.makeSilhouette(source, srcW, srcH, etchColor) : null;

		// In the non-greyscale branch AS3 applies the colour transform to the
		// MAIN bitmap only (not the etch), so pre-tint the source once.
		const tinted = !greyscale
			? this.tintBitmap(source, srcW, srcH, window.color, window.dynamicStyleColor)
			: null;
		const mainBitmap = tinted ?? source;

		// Tile loop (AS3 l.127-176): etch silhouette first, then the main bitmap.
		for (let ty = 0; ty < tilesY; ty++)
		{
			for (let tx = 0; tx < tilesX; tx++)
			{
				const px = baseTx + (tx * drawW);
				const py = baseTy + (ty * drawH);

				if (silhouette)
				{
					bctx.save();
					bctx.globalAlpha = etchAlpha / 255;
					bctx.setTransform(drawW / srcW, 0, 0, drawH / srcH, px + etchPt.x, py + etchPt.y);
					bctx.drawImage(silhouette, 0, 0);
					bctx.restore();
				}

				bctx.save();
				bctx.setTransform(drawW / srcW, 0, 0, drawH / srcH, px, py);
				bctx.drawImage(mainBitmap, 0, 0);
				bctx.restore();
			}
		}

		bctx.setTransform(1, 0, 0, 1, 0, 0);

		// Greyscale converts the WHOLE buffer to luminance, tinted by window.color
		// (AS3 l.133-146 applyFilter over param2.rect).
		if (greyscale)
		{
			this.applyGreyscale(bctx, w, h, window.color);
		}

		// Blit the finished buffer to the composite, clipped to window bounds.
		ctx.save();
		ctx.beginPath();
		ctx.rect(absX, absY, w, h);
		ctx.clip();

		if (blend < 1) ctx.globalAlpha = blend;

		ctx.drawImage(buffer, 0, 0, w, h, absX, absY, w, h);
		ctx.restore();
	}

	/**
	 * Acquires the shared scratch buffer for bitmap-wrapper rendering, resizing
	 * it when the requested dimensions change. Reused synchronously: each window
	 * is fully composited and blitted before the next one touches the buffer.
	 */
	private acquireBitmapBuffer(w: number, h: number): OffscreenCanvas | null
	{
		if (!this._bitmapBuffer || this._bitmapBuffer.width !== w || this._bitmapBuffer.height !== h)
		{
			this._bitmapBuffer = new OffscreenCanvas(Math.max(1, w), Math.max(1, h));
			this._bitmapCtx = this._bitmapBuffer.getContext('2d');
		}

		return this._bitmapBuffer;
	}

	/**
	 * Rotates a bitmap around its centre into a same-sized canvas (AS3 l.55-66).
	 */
	private rotateBitmap(bmp: ImageBitmap, degrees: number): OffscreenCanvas | ImageBitmap
	{
		const canvas = new OffscreenCanvas(bmp.width, bmp.height);
		const rctx = canvas.getContext('2d');

		if (!rctx) return bmp;

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

		if (!sctx) return null;

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
		if (ds)
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

		if (isIdentity) return null;

		const canvas = new OffscreenCanvas(srcW, srcH);
		const tctx = canvas.getContext('2d');

		if (!tctx) return null;

		tctx.imageSmoothingEnabled = false;
		tctx.drawImage(source, 0, 0);

		const image = tctx.getImageData(0, 0, srcW, srcH);
		const data = image.data;

		for (let i = 0; i < data.length; i += 4)
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

		for (let i = 0; i < data.length; i += 4)
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
		if (value < 0) return 0;
		if (value > 255) return 255;

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
		if (!ct) return '';

		const { redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier,
			redOffset, greenOffset, blueOffset } = ct;

		const isIdentity =
			redMultiplier === 1 && greenMultiplier === 1 && blueMultiplier === 1
			&& alphaMultiplier === 1 && redOffset === 0 && greenOffset === 0 && blueOffset === 0;

		if (isIdentity) return '';

		const parts: string[] = [];

		// Average RGB multipliers → brightness
		const brightness = (redMultiplier + greenMultiplier + blueMultiplier) / 3;

		if (Math.abs(brightness - 1) > 0.005)
		{
			parts.push(`brightness(${(brightness * 100).toFixed(1)}%)`);
		}

		// Uniform RGB offset → additional brightness boost (offset 77 ≈ +30%)
		const offsetMag = (Math.abs(redOffset) + Math.abs(greenOffset) + Math.abs(blueOffset)) / 3;

		if (offsetMag > 0)
		{
			const boost = 1 + offsetMag / 255;
			parts.push(`brightness(${(boost * 100).toFixed(1)}%)`);
		}

		if (alphaMultiplier !== 1)
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

		if (type !== WindowType.TEXT && type !== WindowType.LABEL
			&& type !== WindowType.LINK && type !== WindowType.FORMATTED_TEXT
			&& type !== WindowType.TEXTFIELD && type !== WindowType.PASSWORD
			&& type !== WindowType.HTML)
		{
			return;
		}

		const typedWindow = window as unknown as { text?: string };
		const text = typedWindow.text ?? window.caption;

		if (!text) return;

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

		if (isItalic) fontStr += 'italic ';
		if (isBold) fontStr += 'bold ';
		fontStr += `${fontSize}px ${fontFace}`;

		ctx.font = fontStr;
		ctx.fillStyle = `rgb(${r},${g},${b})`;
		ctx.textBaseline = 'top';

		// Margins from TextController
		const marginL = tw.marginLeft ?? tw._marginLeft ?? 2;
		const marginT = tw.marginTop ?? tw._marginTop ?? 2;
		const marginR = tw.marginRight ?? tw._marginRight ?? 2;
		const marginB = tw.marginBottom ?? tw._marginBottom ?? 2;
		const autoSize = (tw.autoSize ?? tw._autoSize ?? 'none').toLowerCase();
		const spacing = tw.spacing ?? tw._spacing ?? 0;
		const leading = tw.leading ?? tw._leading ?? 0;
		const maxWidth = w - marginL - marginR;

		if (maxWidth <= 0) return;

		// Determine display text
		let displayText = text;

		if (type === WindowType.PASSWORD)
		{
			displayText = '\u2022'.repeat(text.length);
		}

		// Etching (shadow text) support for il_* styles
		const etchColor = tw.etchingColor ?? 0;
		const hasEtching = etchColor !== 0 && ((etchColor >>> 24) & 0xFF) > 0;

		// Underline support for link windows
		if (type === WindowType.LINK || tw.underline)
		{
			ctx.save();

			const measuredWidth = this.measureTextWidth(ctx, displayText, spacing);
			const textW = Math.min(measuredWidth, maxWidth);
			const textX = this.resolveAlignedTextX(absX + marginL, maxWidth, measuredWidth, autoSize);
			const textY = absY + marginT;

			if (hasEtching)
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
		if ((tw.multiline || tw.wordWrap) && (type === WindowType.TEXT || type === WindowType.FORMATTED_TEXT || type === WindowType.HTML))
		{
			this.compositeTextMultiline(
				ctx,
				displayText,
				absX + marginL,
				absY + marginT,
				maxWidth,
				h - marginT - marginB,
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
		const textY = absY + marginT;

		if (hasEtching)
		{
			this.drawEtching(ctx, displayText, textX, textY, maxWidth, etchColor, tw.etchingPosition, spacing);
		}

		this.drawTextLine(ctx, displayText, textX, textY, maxWidth, spacing);
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

		for (const line of lines)
		{
			if (currentY + lineHeight > y + maxHeight)
			{
				break;
			}

			if (wordWrap && this.measureTextWidth(ctx, line, spacing) > maxWidth)
			{
				for (const wrappedLine of this.wrapLine(ctx, line, maxWidth, spacing))
				{
					if (currentY + lineHeight > y + maxHeight)
					{
						break;
					}

					const measuredWidth = this.measureTextWidth(ctx, wrappedLine, spacing);
					const drawX = this.resolveAlignedTextX(x, maxWidth, measuredWidth, autoSize);

					if (hasEtching)
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

				if (hasEtching)
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
		if (autoSize === 'center')
		{
			return baseX + Math.max(0, Math.floor((maxWidth - textWidth) / 2));
		}

		if (autoSize === 'right')
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
		if (!text)
		{
			return 0;
		}

		const width = ctx.measureText(text).width;

		if (spacing === 0 || text.length <= 1)
		{
			return width;
		}

		return width + ((text.length - 1) * spacing);
	}

	private drawTextLine(
		ctx: OffscreenCanvasRenderingContext2D,
		text: string,
		x: number,
		y: number,
		maxWidth: number,
		spacing: number
	): void
	{
		if (!text)
		{
			return;
		}

		if (spacing === 0)
		{
			ctx.save();
			ctx.beginPath();
			ctx.rect(x, y - 2, maxWidth, 4096);
			ctx.clip();
			ctx.fillText(text, x, y);
			ctx.restore();

			return;
		}

		let drawX = x;
		const maxX = x + maxWidth;

		for (let i = 0; i < text.length; i++)
		{
			const char = text.charAt(i);
			const charWidth = ctx.measureText(char).width;

			if (drawX + charWidth > maxX)
			{
				break;
			}

			ctx.fillText(char, drawX, y);
			drawX += charWidth + spacing;
		}
	}

	private wrapLine(
		ctx: OffscreenCanvasRenderingContext2D,
		line: string,
		maxWidth: number,
		spacing: number
	): string[]
	{
		if (!line)
		{
			return [''];
		}

		const words = line.split(' ');
		const out: string[] = [];
		let current = '';

		for (const word of words)
		{
			const candidate = current ? `${current} ${word}` : word;

			if (this.measureTextWidth(ctx, candidate, spacing) <= maxWidth || !current)
			{
				current = candidate;
			}
			else
			{
				out.push(current);
				current = word;
			}

			if (this.measureTextWidth(ctx, current, spacing) > maxWidth)
			{
				const broken = this.wrapLongWord(ctx, current, maxWidth, spacing);

				if (broken.length > 0)
				{
					out.push(...broken.slice(0, broken.length - 1));
					current = broken[broken.length - 1];
				}
			}
		}

		if (current)
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

		for (let i = 0; i < word.length; i++)
		{
			const next = current + word.charAt(i);

			if (this.measureTextWidth(ctx, next, spacing) <= maxWidth || !current)
			{
				current = next;
			}
			else
			{
				out.push(current);
				current = word.charAt(i);
			}
		}

		if (current)
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
		spacing: number = 0
	): void
	{
		const a = ((color >>> 24) & 0xFF) / 255;
		const er = (color >> 16) & 0xFF;
		const eg = (color >> 8) & 0xFF;
		const eb = color & 0xFF;

		let dx = 0;
		let dy = 1;

		switch (position)
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
		this.drawTextLine(ctx, text, x + dx, y + dy, maxWidth, spacing);
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
		if (!window.visible) return null;

		// FLAG 9 = INTERNAL_EVENT_HANDLING → ignore mouse events
		if (window.testParamFlag(9))
		{
			return null;
		}

		const absX = offsetX + window.x;
		const absY = offsetY + window.y;
		const w = window.width;
		const h = window.height;

		// AABB bounds test
		if (globalX < absX || globalX >= absX + w || globalY < absY || globalY >= absY + h)
		{
			return null;
		}

		// Test children in reverse (topmost first)
		const container = window as unknown as IWindowContainer;

		if (typeof container.numChildren === 'number')
		{
			for (let i = container.numChildren - 1; i >= 0; i--)
			{
				const child = container.getChildAt(i);

				if (!child) continue;

				const hit = this.hitTestRecursive(child, globalX, globalY, absX, absY);

				if (hit) return hit;
			}
		}

		// Only return this window as a hit target if it is an INPUT_EVENT_PROCESSOR
		if (window.testParamFlag(1))
		{
			return window;
		}

		return null;
	}


}
