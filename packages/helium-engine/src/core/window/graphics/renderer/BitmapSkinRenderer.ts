import type {IWindow} from '../../IWindow';
import {SkinRenderer} from './SkinRenderer';
import {SkinLayoutEntity} from './SkinLayoutEntity';
import type {SkinTemplate} from './SkinTemplate';
import type {SkinTemplateEntity} from './SkinTemplateEntity';
import {HsvLayerColor} from './HsvLayerColor';

/**
 * 9-slice bitmap skin renderer.
 *
 * Port of AS3 BitmapSkinRenderer. Renders window skins using a 9-slice approach:
 * pieces from a spritesheet atlas are placed according to layout rules, with
 * scale modes (FIXED, MOVE, STRETCH, TILED, CENTER) controlling how each piece
 * adapts to the target window size.
 *
 * Equivalent of AS3 BitmapData operations:
 * - `copyPixels()` → `ctx.drawImage()`
 * - `fillRect()` → `ctx.fillRect()`
 * - `colorTransform()` → `ctx.globalCompositeOperation = 'multiply'`
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/core/window/graphics/renderer/BitmapSkinRenderer.as
 */
export class BitmapSkinRenderer extends SkinRenderer
{
    /** Bitmap cache: "entityName@templateName" → OffscreenCanvas crop. */
    private _bitmapCache: Map<string, OffscreenCanvas> = new Map();

    constructor(name: string)
    {
        super(name);
    }

    /**
	 * Draws the skin for the given window state.
	 *
	 * Algorithm (faithful port of AS3 BitmapSkinRenderer.draw):
	 * 1. Resolve state → layout + template (fallback to state 0)
	 * 2. Compute deltaW/deltaH (target size - layout base size)
	 * 3. For each layout entity, apply scale mode and draw from atlas
	 * 4. Colorize if needed
	 *
	 * @param window - The window to render
	 * @param ctx - The canvas context to draw into
	 * @param rect - The target rectangle
	 * @param state - The resolved window state
	 * @param _colorize - Colorization flag (unused, window.color is checked directly)
	 */
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/core/window/graphics/renderer/BitmapSkinRenderer.as::draw()
    public override draw(
        window: IWindow,
        ctx: OffscreenCanvasRenderingContext2D,
        rect: { x: number; y: number; width: number; height: number },
        state: number,
        _colorize: boolean
    ): void
    {
        // Resolve layout and template for this state, fallback to DEFAULT (0)
        let layout = this.getLayoutByState(state);
        let template = this.getTemplateByState(state);

        if(!layout || !template)
        {
            layout = this.getLayoutByState(0);
            template = this.getTemplateByState(0);
        }

        if(!layout || !template)
        {
            return;
        }

        if(!template.atlas)
        {
            return;
        }

        const targetWidth = rect.width;
        const targetHeight = rect.height;

        if(targetWidth < 1 || targetHeight < 1) return;

        // Compute deltas
        const deltaW = targetWidth - layout.width;
        const deltaH = targetHeight - layout.height;

        // Determine colorization
        const color = window.color;
        const doColorize = !window.background && ((color & 0xFFFFFF) < 0xFFFFFF);
        const colorR = doColorize ? ((color >> 16) & 0xFF) / 255 : 1;
        const colorG = doColorize ? ((color >> 8) & 0xFF) / 255 : 1;
        const colorB = doColorize ? (color & 0xFF) / 255 : 1;

        // Render each layout entity
        for(let i = 0; i < layout.numEntities; i++)
        {
            const layoutEntity = layout.getEntityAt(i);
            const templateEntity = template.getEntityByName(layoutEntity.name);

            if(!templateEntity) continue;

            // Get cached bitmap piece
            const piece = this.getBitmapFromCache(template, templateEntity);

            if(!piece) continue;

            const srcW = templateEntity.region.width;
            const srcH = templateEntity.region.height;

            if(srcW < 1 || srcH < 1) continue;

            // Calculate destination from layout region + scale mode
            let destX = rect.x + layoutEntity.region.x;
            let destY = rect.y + layoutEntity.region.y;
            let destW = layoutEntity.region.width;
            let destH = layoutEntity.region.height;

            // Apply horizontal scale mode
            switch(layoutEntity.scaleH)
            {
                case SkinLayoutEntity.SCALE_FIXED:
                    break;
                case SkinLayoutEntity.SCALE_MOVE:
                    destX += deltaW;
                    break;
                case SkinLayoutEntity.SCALE_STRETCH:
                    destW += deltaW;
                    break;
                case SkinLayoutEntity.SCALE_TILED:
                    destW += deltaW;
                    break;
                case SkinLayoutEntity.SCALE_CENTER:
                    destX = rect.width / 2 - destW / 2;
                    break;
            }

            // Apply vertical scale mode
            switch(layoutEntity.scaleV)
            {
                case SkinLayoutEntity.SCALE_FIXED:
                    break;
                case SkinLayoutEntity.SCALE_MOVE:
                    destY += deltaH;
                    break;
                case SkinLayoutEntity.SCALE_STRETCH:
                    destH += deltaH;
                    break;
                case SkinLayoutEntity.SCALE_TILED:
                    destH += deltaH;
                    break;
                case SkinLayoutEntity.SCALE_CENTER:
                    destY = rect.height / 2 - destH / 2;
                    break;
            }

            // Apply colorization if entity supports it. AS3 checks the "hsv_layer"
            // method first (derives a shaded variant of window.color regardless of
            // doColorize - used for 3-tone bevel borders like border_15/border_16),
            // falling back to the regular "multiply" colorize otherwise.
            let drawSource: OffscreenCanvas | ImageBitmap = piece;

            if(!window.background && layoutEntity.colorize && layoutEntity.colorizeMethod === SkinLayoutEntity.COLORIZE_METHOD_HSV_LAYER)
            {
                const derived = HsvLayerColor.deriveColor(color, layoutEntity.shade);
                const r = ((derived >> 16) & 0xFF) / 255;
                const g = ((derived >> 8) & 0xFF) / 255;
                const b = (derived & 0xFF) / 255;

                drawSource = this.colorizeEntity(piece, srcW, srcH, r, g, b);
            }
            else if(doColorize && layoutEntity.colorize)
            {
                drawSource = this.colorizeEntity(piece, srcW, srcH, colorR, colorG, colorB);
            }

            // AS3 only resizes the drawn piece when a scale mode actually calls for
            // it (STRETCH/TILED on either axis, which is what set _loc16_/_loc9_ in
            // BitmapSkinRenderer.as::draw()). FIXED/MOVE/CENTER always blit the piece
            // at its own native size via BitmapData.copyPixels() — never stretched to
            // fill the layout region's authored box — even when that box is a
            // different size than the source crop (e.g. a small icon glyph centered
            // in a bigger padded box). Sizing the draw off `destW === srcW` instead
            // of the scale mode stretched every FIXED-mode entity whose region size
            // didn't happen to match its source crop.
            const tiled = layoutEntity.scaleH === SkinLayoutEntity.SCALE_TILED || layoutEntity.scaleV === SkinLayoutEntity.SCALE_TILED;
            const stretched = layoutEntity.scaleH === SkinLayoutEntity.SCALE_STRETCH || layoutEntity.scaleV === SkinLayoutEntity.SCALE_STRETCH;

            if(tiled)
            {
                if(destW < 1 || destH < 1) continue;

                this.drawTiled(ctx, drawSource, srcW, srcH, destX, destY, destW, destH);
            }
            else if(stretched)
            {
                if(destW < 1 || destH < 1) continue;

                ctx.drawImage(drawSource, 0, 0, srcW, srcH, destX, destY, destW, destH);
            }
            else
            {
                // No scale mode calls for resizing — direct unscaled copy at native size
                ctx.drawImage(drawSource, 0, 0, srcW, srcH, destX, destY, srcW, srcH);
            }
        }
    }

    public override dispose(): void
    {
        if(this._disposed) return;

        this._bitmapCache.clear();

        super.dispose();
    }

    /**
	 * Gets or creates a cached bitmap piece for a template entity.
	 *
	 * Key format: "entityName@templateName"
	 *
	 * @param template - The skin template
	 * @param entity - The template entity
	 * @returns The cropped OffscreenCanvas piece, or null
	 */
    private getBitmapFromCache(template: SkinTemplate, entity: SkinTemplateEntity): OffscreenCanvas | null
    {
        const key = `${entity.name}@${template.name}`;

        let cached = this._bitmapCache.get(key);

        if(cached) return cached;

        const atlas = template.atlas;

        if(!atlas) return null;

        const region = entity.region;

        if(region.width < 1 || region.height < 1) return null;

        cached = new OffscreenCanvas(region.width, region.height);

        const ctx = cached.getContext('2d');

        if(!ctx) return null;

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(atlas, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height);

        this._bitmapCache.set(key, cached);

        return cached;
    }

    /**
	 * Creates a colorized copy of a bitmap piece.
	 *
	 * Uses canvas composite 'multiply' to apply the color,
	 * then 'destination-in' to restore the alpha channel.
	 *
	 * @param piece - The source piece
	 * @param width - The piece width
	 * @param height - The piece height
	 * @param r - Red multiplier (0-1)
	 * @param g - Green multiplier (0-1)
	 * @param b - Blue multiplier (0-1)
	 * @returns The colorized piece
	 */
    private colorizeEntity(
        piece: OffscreenCanvas,
        width: number,
        height: number,
        r: number,
        g: number,
        b: number
    ): OffscreenCanvas
    {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');

        if(!ctx) return piece;

        ctx.imageSmoothingEnabled = false;

        // Draw original
        ctx.drawImage(piece, 0, 0);

        // Multiply by color
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
        ctx.fillRect(0, 0, width, height);

        // Restore alpha from original
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(piece, 0, 0);

        return canvas;
    }

    /**
	 * Draws a source tiled across the destination area.
	 *
	 * @param ctx - The target context
	 * @param source - The source bitmap
	 * @param srcW - Source width
	 * @param srcH - Source height
	 * @param destX - Destination X
	 * @param destY - Destination Y
	 * @param destW - Destination width
	 * @param destH - Destination height
	 */
    private drawTiled(
        ctx: OffscreenCanvasRenderingContext2D,
        source: OffscreenCanvas | ImageBitmap,
        srcW: number,
        srcH: number,
        destX: number,
        destY: number,
        destW: number,
        destH: number
    ): void
    {
        ctx.save();
        ctx.beginPath();
        ctx.rect(destX, destY, destW, destH);
        ctx.clip();

        for(let ty = 0; ty < destH; ty += srcH)
        {
            for(let tx = 0; tx < destW; tx += srcW)
            {
                const drawW = Math.min(srcW, destW - tx);
                const drawH = Math.min(srcH, destH - ty);

                ctx.drawImage(source, 0, 0, drawW, drawH, destX + tx, destY + ty, drawW, drawH);
            }
        }

        ctx.restore();
    }
}
