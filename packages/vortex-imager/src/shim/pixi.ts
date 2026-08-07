/**
 * The `pixi.js` surface the engine's avatar pipeline actually touches, reimplemented on
 * `@napi-rs/canvas`.
 *
 * `tools/build.mjs` aliases every `pixi.js` import in the engine's transitive graph to this
 * file. That graph — 130 files rooted at `AvatarRenderManager` — imports exactly three
 * symbols: `Texture`, `Spritesheet` and `Assets`. Nothing else from PixiJS is reachable, so
 * nothing else is implemented here; anything new the engine starts importing will fail at
 * bundle time rather than silently at runtime.
 *
 * A `Texture` here is a rectangle (`frame`) inside a drawable (`source.resource`), which is
 * all the compositing code ever asks for: it reads `source.resource` + `frame` and hands both
 * to `ctx.drawImage()`.
 */
import type {Canvas, Image} from '@napi-rs/canvas';
import { loadImage} from '@napi-rs/canvas';

/** Anything `ctx.drawImage()` accepts as a source. */
export type TextureResource = Canvas | Image;

export interface IRectangleLike
{
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * PixiJS splits a texture into the GPU-side source and the frame within it. The split is
 * kept because the engine reads `texture.source.resource` directly.
 */
export class TextureSource
{
    private _resource: TextureResource | null;

    constructor(resource: TextureResource)
    {
        this._resource = resource;
    }

    /**
	 * Deliberately `unknown`: the engine's compositing code casts this to the DOM's
	 * `CanvasImageSource` before handing it to `drawImage()`, and a cast out of `unknown` is
	 * legal where a cast between two unrelated concrete types would not compile. The runtime
	 * value is always a `Canvas` or an `Image`, both of which `@napi-rs/canvas` draws.
	 */
    get resource(): unknown
    {
        return this._resource;
    }

    get width(): number
    {
        return this._resource?.width ?? 0;
    }

    get height(): number
    {
        return this._resource?.height ?? 0;
    }

    destroy(): void
    {
        this._resource = null;
    }
}

/** What `Texture.from()` accepts: a bare drawable, or PixiJS's options object. */
export type TextureFromSource =
    | TextureResource
    | TextureSource
    | { resource: TextureResource; alphaMode?: string };

export class Texture
{
    private _source: TextureSource;
    private _frame: IRectangleLike;

    constructor(options: { source: TextureSource; frame?: IRectangleLike | null })
    {
        this._source = options.source;
        this._frame = options.frame ?? {
            x: 0,
            y: 0,
            width: options.source.width,
            height: options.source.height
        };
    }

    /**
	 * Mirrors PixiJS's overload set: the engine calls this both with a raw drawable
	 * (`Texture.from(bitmap)`) and with an options object (`Texture.from({resource, alphaMode})`).
	 * `alphaMode` is a GPU upload hint with no meaning on a 2D canvas, so it is ignored.
	 */
    static from(source: TextureFromSource): Texture
    {
        if(source instanceof TextureSource)
        {
            return new Texture({source});
        }

        if(typeof source === 'object' && source !== null && 'resource' in source)
        {
            return new Texture({source: new TextureSource(source.resource)});
        }

        return new Texture({source: new TextureSource(source as TextureResource)});
    }

    get source(): TextureSource
    {
        return this._source;
    }

    get frame(): IRectangleLike
    {
        return this._frame;
    }

    get width(): number
    {
        return this._frame.width;
    }

    get height(): number
    {
        return this._frame.height;
    }

    /**
	 * `destroySource` is PixiJS's flag for tearing down the GPU resource too. Here the source
	 * is a plain canvas the garbage collector owns, so both paths just drop the reference.
	 */
    destroy(destroySource: boolean = false): void
    {
        if(destroySource) this._source.destroy();
    }
}

/** The TexturePacker-style frame block inside a .nitro bundle's JSON. */
export interface ISpritesheetFrameData
{
    frame: { x: number; y: number; w: number; h: number };
}

export interface ISpritesheetData
{
    frames?: Record<string, ISpritesheetFrameData>;
    meta?: Record<string, unknown>;
}

/**
 * Slices one atlas into a `Texture` per frame.
 *
 * PixiJS's own Spritesheet also handles rotation, trimming and multi-pack sheets; the
 * .nitro bundles this service reads use none of those, so `frame` is the whole story.
 */
export class Spritesheet
{
    private _baseTexture: Texture;
    private _data: ISpritesheetData;
    private _textures: Record<string, Texture> = {};

    constructor(baseTexture: Texture, data: ISpritesheetData)
    {
        this._baseTexture = baseTexture;
        this._data = data;
    }

    get textures(): Record<string, Texture>
    {
        return this._textures;
    }

    async parse(): Promise<Record<string, Texture>>
    {
        const frames = this._data.frames ?? {};

        for(const [name, frameData] of Object.entries(frames))
        {
            const rect = frameData?.frame;

            if(!rect) continue;

            this._textures[name] = new Texture({
                source: this._baseTexture.source,
                frame: {x: rect.x, y: rect.y, width: rect.w, height: rect.h}
            });
        }

        return this._textures;
    }

    destroy(destroyBase: boolean = false): void
    {
        this._textures = {};

        if(destroyBase) this._baseTexture.destroy(true);
    }
}

/**
 * PixiJS's global asset cache. Only `BitmapFileLoader` reaches for it, and only to fetch a
 * standalone image; there is no cache to keep coherent here, so `unload` is a no-op.
 */
export const Assets = {
    async load<T = Texture>(url: string): Promise<T>
    {
        const image = await loadImage(url);

        return Texture.from(image) as T;
    },

    async unload(_url: string): Promise<void>
    {
        // No cache to evict — `load()` returns a fresh texture every time.
    }
};
