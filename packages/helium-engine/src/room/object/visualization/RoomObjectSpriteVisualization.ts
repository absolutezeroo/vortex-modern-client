/**
 * RoomObjectSpriteVisualization
 *
 * Based on AS3: com.sulake.room.object.visualization.RoomObjectSpriteVisualization
 *
 * Base class for sprite-based room object visualizations.
 * Manages a collection of RoomObjectSprite data objects.
 * The canvas (RoomRenderingCanvas) reads sprite data via getSprite(i)
 * and owns the actual display objects (ExtendedSprites).
 */
import {Container, Graphics, Sprite, Texture} from 'pixi.js';
import type {IRoomObject} from '../IRoomObject';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import {ColorConverter} from '@room/utils/ColorConverter';
import type {IRoomObjectSprite} from './IRoomObjectSprite';
import type {IRoomObjectSpriteVisualization} from './IRoomObjectSpriteVisualization';
import type {IRoomObjectVisualizationData} from './IRoomObjectVisualizationData';
import type {IGraphicAssetCollection} from './utils/IGraphicAssetCollection';
import {RoomObjectSprite} from './RoomObjectSprite';
import {Helium} from '../../../Helium';

let visualizationInstanceCounter = 0;

export class RoomObjectSpriteVisualization implements IRoomObjectSpriteVisualization
{
    protected static readonly LAYER_SEPARATOR: string = '_';
    protected static readonly ICON_LAYER_ID: string = '_icon_';
    protected _scale: number = -1;
    protected _updateModelCounter: number = -1;
    protected _direction: number = -1;
    private _sprites: RoomObjectSprite[] = [];
    private _instanceId: number;
    private _updateId: number = 0;
    private _boundsDirty: boolean = true;
    private _cachedBounds: { x: number; y: number; width: number; height: number } = {x: 0, y: 0, width: 0, height: 0};

    constructor()
    {
        this._instanceId = visualizationInstanceCounter++;
    }

    private _assetCollection: IGraphicAssetCollection | null = null;

    get assetCollection(): IGraphicAssetCollection | null
    {
        return this._assetCollection;
    }

    set assetCollection(value: IGraphicAssetCollection | null)
    {
        this._assetCollection = value;
    }

    private _object: IRoomObject | null = null;

    get object(): IRoomObject | null
    {
        return this._object;
    }

    set object(value: IRoomObject | null)
    {
        this._object = value;
    }

    get spriteCount(): number
    {
        return this._sprites.length;
    }

    /**
	 * Get the bounding rectangle of all visible sprites
	 */
    get boundingRectangle(): { x: number; y: number; width: number; height: number }
    {
        if(!this._boundsDirty)
        {
            return this._cachedBounds;
        }

        let left = 0;
        let top = 0;
        let right = 0;
        let bottom = 0;
        let first = true;

        for(let i = 0; i < this._sprites.length; i++)
        {
            const sprite = this._sprites[i];

            if(sprite !== null && sprite.visible && sprite.texture !== null)
            {
                const x = sprite.offsetX;
                const y = sprite.offsetY;

                if(first)
                {
                    left = x;
                    top = y;
                    right = x + sprite.width;
                    bottom = y + sprite.height;
                    first = false;
                }
                else
                {
                    if(x < left) left = x;
                    if(y < top) top = y;
                    if(x + sprite.width > right) right = x + sprite.width;
                    if(y + sprite.height > bottom) bottom = y + sprite.height;
                }
            }
        }

        this._cachedBounds.x = left;
        this._cachedBounds.y = top;
        this._cachedBounds.width = right - left;
        this._cachedBounds.height = bottom - top;
        this._boundsDirty = false;

        return this._cachedBounds;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/object/visualization/RoomObjectSpriteVisualization.as::get image()
    get image(): HTMLCanvasElement | null
    {
        return this.getImage(0, -1);
    }

    private static normalizeColourComponent(value: number): number
    {
        return Math.max(0, Math.min(255, value)) / 255;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/object/visualization/RoomObjectSpriteVisualization.as::getImage()
    // TS deviation: AS3 composites via BitmapData.draw() (a software rasterizer with no
    // renderer dependency). PixiJS needs a live Renderer to rasterize, so this builds a
    // throwaway Container of plain Sprites (position/tint/alpha/blendMode/flip mirroring
    // AS3's Matrix+ColorTransform math exactly) and reads it back via
    // Helium.instance.application.renderer.extract.canvas() - the same synchronous
    // texture-to-canvas mechanism RoomEngine.pixiTextureToCanvas() already uses.
    getImage(backgroundColor: number, _originalId: number): HTMLCanvasElement | null
    {
        const bounds = this.boundingRectangle;

        // also backs every furniture icon, so an unfiltered log here floods the console.
        if(bounds.width * bounds.height === 0) return null;

        const visible: RoomObjectSprite[] = [];

        for(let i = 0; i < this._sprites.length; i++)
        {
            const sprite = this._sprites[i];

            if(sprite !== null && sprite.visible && sprite.texture !== null) visible.push(sprite);
        }

        if(visible.length > 1) visible.sort((a, b) => b.relativeDepth - a.relativeDepth);

        const container = new Container();

        const bgAlpha = (backgroundColor >>> 24) & 0xFF;

        if(bgAlpha > 0)
        {
            const fill = new Graphics()
                .rect(0, 0, bounds.width, bounds.height)
                .fill({color: backgroundColor & 0xFFFFFF, alpha: RoomObjectSpriteVisualization.normalizeColourComponent(bgAlpha)});

            container.addChild(fill);
        }

        for(const sprite of visible)
        {
            const displaySprite = this.buildCompositeSprite(sprite, bounds, backgroundColor);

            if(displaySprite !== null) container.addChild(displaySprite);
        }

        const canvas = this.extractContainerToCanvas(container);

        container.destroy({children: true});

        return canvas;
    }

    private extractContainerToCanvas(container: Container): HTMLCanvasElement | null
    {
        try
        {
            return Helium.instance.application.renderer.extract.canvas(container) as HTMLCanvasElement;
        }
        catch
        {
            return null;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/object/visualization/RoomObjectSpriteVisualization.as::getImage()
    // (inlined per-sprite compositing loop body)
    private buildCompositeSprite(
        sprite: RoomObjectSprite,
        bounds: { x: number; y: number; width: number; height: number },
        backgroundColor: number
    ): Sprite | null
    {
        let texture = sprite.texture;

        if(texture === null) return null;

        if(backgroundColor === 0 && sprite.blendMode === 'add')
        {
            texture = this.extractDarknessToAlpha(texture);

            if(texture === null) return null;
        }

        const displaySprite = new Sprite(texture);

        displaySprite.tint = sprite.color;
        displaySprite.alpha = RoomObjectSpriteVisualization.normalizeColourComponent(sprite.alpha);
        displaySprite.blendMode = sprite.blendMode as Sprite['blendMode'];
        displaySprite.scale.x = sprite.flipH ? -1 : 1;
        displaySprite.scale.y = sprite.flipV ? -1 : 1;
        displaySprite.x = sprite.offsetX - bounds.x + (sprite.flipH ? sprite.width : 0);
        displaySprite.y = sprite.offsetY - bounds.y + (sprite.flipV ? sprite.height : 0);

        return displaySprite;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/object/visualization/RoomObjectSpriteVisualization.as::extractDarknessToAlpha()
    // Encodes a sprite's darkness as transparency (used for "add"-blend glow sprites composited
    // onto a fully transparent background, where additive blending against nothing would
    // otherwise just vanish). Ported as a synchronous 2D-canvas pixel pass, matching AS3's
    // per-pixel BitmapData.getVector()/setVector() loop exactly (same HSL math via the
    // already-ported ColorConverter).
    private extractDarknessToAlpha(texture: Texture): Texture | null
    {
        try
        {
            const source = Helium.instance.application.renderer.extract.canvas(texture) as HTMLCanvasElement;
            const width = source.width;
            const height = source.height;

            if(width < 1 || height < 1) return null;

            const context = source.getContext('2d');

            if(context === null) return null;

            const imageData = context.getImageData(0, 0, width, height);
            const data = imageData.data;

            for(let i = 0; i < data.length; i += 4)
            {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                const hsl = ColorConverter.rgbToHSL((r << 16) | (g << 8) | b);
                let lightness = hsl & 0xFF;

                if(lightness <= 128)
                {
                    const hue = (hsl >> 16) & 0xFF;
                    const saturation = (hsl >> 8) & 0xFF;
                    const newAlpha = a * (lightness / 128);

                    lightness = 128;

                    const rgb = ColorConverter.hslToRGB((hue << 16) + (saturation << 8) + lightness);

                    data[i] = (rgb >> 16) & 0xFF;
                    data[i + 1] = (rgb >> 8) & 0xFF;
                    data[i + 2] = rgb & 0xFF;
                    data[i + 3] = newAlpha;
                }
            }

            context.putImageData(imageData, 0, 0);

            return Texture.from(source);
        }
        catch
        {
            return null;
        }
    }

    dispose(): void
    {
        if(this._sprites !== null)
        {
            while(this._sprites.length > 0)
            {
                const sprite = this._sprites[0];

                if(sprite !== null)
                {
                    sprite.dispose();
                }

                this._sprites.pop();
            }

            this._sprites = [];
        }

        this._object = null;
    }

    getUpdateID(): number
    {
        return this._updateId;
    }

    getInstanceId(): number
    {
        return this._instanceId;
    }

    addSprite(): IRoomObjectSprite
    {
        return this.addSpriteAt(this._sprites.length);
    }

    addSpriteAt(index: number): IRoomObjectSprite
    {
        const sprite = new RoomObjectSprite();

        if(index >= this._sprites.length)
        {
            this._sprites.push(sprite);
        }
        else
        {
            this._sprites.splice(index, 0, sprite);
        }

        return sprite;
    }

    removeSprite(sprite: IRoomObjectSprite): void
    {
        const index = this._sprites.indexOf(sprite as RoomObjectSprite);

        if(index === -1)
        {
            throw new Error('Trying to remove non-existing sprite!');
        }

        this._sprites.splice(index, 1);
        (sprite as RoomObjectSprite).dispose();
    }

    getSprite(index: number): IRoomObjectSprite | null
    {
        if(index >= 0 && index < this._sprites.length)
        {
            return this._sprites[index];
        }

        return null;
    }

    update(_geometry: IRoomGeometry, _time: number, _update: boolean, _skipUpdate: boolean): void
    {
        // Override in subclasses
    }

    getSpriteList(): IRoomObjectSprite[] | null
    {
        return null;
    }

    initialize(_data: IRoomObjectVisualizationData): boolean
    {
        return false;
    }

    protected createSprites(count: number): void
    {
        // Remove excess sprites
        while(this._sprites.length > count)
        {
            const sprite = this._sprites[this._sprites.length - 1];

            if(sprite !== null)
            {
                sprite.dispose();
            }

            this._sprites.pop();
        }

        // Add missing sprites
        while(this._sprites.length < count)
        {
            const sprite = new RoomObjectSprite();
            this._sprites.push(sprite);
        }
    }

    protected increaseUpdateId(): void
    {
        this._updateId++;
        this._boundsDirty = true;
    }

    protected reset(): void
    {
        this._scale = 0xFFFFFFFF;
        this._updateModelCounter = 0xFFFFFFFF;
        this._direction = -1;
    }
}
