/**
 * Turns a rendered texture into PNG bytes, resizing it on the way out.
 *
 * Resizing happens here rather than through `AvatarImage.getImage(…, scale)` because that path
 * always resizes with `imageSmoothingEnabled = true`. Smoothing is right when shrinking and
 * wrong when enlarging: it is what turns a 2x avatar into a blurred one instead of clean
 * pixel art. So compositing always runs at 1x, and the factor below picks its own filter —
 * nearest-neighbour up, smooth down.
 */
import {createCanvas} from '@napi-rs/canvas';
import type {Canvas} from '@napi-rs/canvas';
import type {Texture} from '../shim/pixi';

export async function textureToPng(texture: Texture, zoom: number = 1): Promise<Buffer>
{
    return textureToCanvas(texture, zoom).encode('png');
}

export async function canvasToPng(canvas: Canvas, zoom: number = 1): Promise<Buffer>
{
    return resizeCanvas(canvas, zoom).encode('png');
}

function resizeCanvas(source: Canvas, zoom: number): Canvas
{
    const factor = zoom > 0 ? zoom : 1;

    if(factor === 1) return source;

    const width = Math.max(1, Math.round(source.width * factor));
    const height = Math.max(1, Math.round(source.height * factor));
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    context.imageSmoothingEnabled = factor < 1;
    context.drawImage(source, 0, 0, source.width, source.height, 0, 0, width, height);

    return canvas;
}

export function textureToCanvas(texture: Texture, zoom: number = 1): Canvas
{
    const source = texture.source.resource;

    if(!source)
    {
        throw new Error('Texture has no drawable source');
    }

    const frame = texture.frame;
    const factor = zoom > 0 ? zoom : 1;
    const width = Math.max(1, Math.round(frame.width * factor));
    const height = Math.max(1, Math.round(frame.height * factor));

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    context.imageSmoothingEnabled = factor < 1;

    context.drawImage(
        source as Parameters<typeof context.drawImage>[0],
        frame.x, frame.y, frame.width, frame.height,
        0, 0, width, height
    );

    return canvas;
}
