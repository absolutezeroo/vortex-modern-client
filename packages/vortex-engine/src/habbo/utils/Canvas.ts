import type {Texture} from 'pixi.js';

/**
 * `averageColor()`, the one member of AS3's `Canvas` this port needs.
 *
 * The room-photo payload cannot carry pixels, so for the sprites whose appearance is a *downloaded
 * image* — a wall photo, a group badge, a skewed thumbnail — it carries the average colour of that
 * image instead, and the renderer on the other side fills a rectangle with it. Without this those
 * sprites serialise as whatever tint the sprite carries, which for an untinted photo is white.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/Canvas.as
 */
export class Canvas
{
    /** AS3's return when there is nothing to average: opaque white. */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/Canvas.as::averageColor()
    private static readonly NO_PIXELS: number = 0xFFFFFF;

    /**
     * The mean RGB of every pixel with a non-zero alpha.
     *
     * Fully transparent pixels are skipped rather than averaged as black — that is what stops a
     * badge on a large transparent canvas from coming back nearly black.
     *
     * DEVIATION: AS3 reads a `BitmapData` with `getPixel32()` per pixel. A PixiJS `Texture` is on
     *   the GPU and has no such accessor; the pixels are read back by drawing the texture's own
     *   source into a scratch 2D canvas once and taking its `ImageData`, which is the same walk
     *   with one upload instead of `width * height` calls. A source that is not drawable — a
     *   compressed or render texture — cannot be read this way and returns the same white AS3
     *   returns for a null bitmap.
     *
     * @param texture - The sprite's texture, or null
     * @returns `0xRRGGBB`, or white when there is nothing to measure
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/Canvas.as::averageColor()
    public static averageColor(texture: Texture | null): number
    {
        const pixels = Canvas.readPixels(texture);

        if(pixels === null) return Canvas.NO_PIXELS;

        let red = 0;
        let green = 0;
        let blue = 0;
        let counted = 0;

        for(let i = 0; i < pixels.length; i += 4)
        {
            if(pixels[i + 3] === 0) continue;

            red += pixels[i];
            green += pixels[i + 1];
            blue += pixels[i + 2];
            counted++;
        }

        if(counted === 0) return Canvas.NO_PIXELS;

        return ((red / counted) << 16) | ((green / counted) << 8) | (blue / counted);
    }

    /**
     * The texture's pixels, or null when its source cannot be drawn into a 2D context.
     *
     * Only the texture's own frame is read: an atlas page would otherwise average every sprite on
     * it.
     */
    // TS-only: AS3 reads the BitmapData directly; a GPU texture has to be drawn to be read.
    private static readPixels(texture: Texture | null): Uint8ClampedArray | null
    {
        if(texture === null) return null;

        const source = (texture.source?.resource ?? null) as CanvasImageSource | null;

        if(source === null) return null;

        const frame = texture.frame;
        const width = Math.max(1, Math.round(frame.width));
        const height = Math.max(1, Math.round(frame.height));

        try
        {
            const scratch = new OffscreenCanvas(width, height);
            const context = scratch.getContext('2d', {willReadFrequently: true});

            if(context === null) return null;

            context.drawImage(source, frame.x, frame.y, width, height, 0, 0, width, height);

            return context.getImageData(0, 0, width, height).data;
        }
        catch
        {
            // A source `drawImage` refuses — a compressed texture, or one whose resource is a
            // WebGL handle rather than an image — is AS3's null bitmap case.
            return null;
        }
    }
}
