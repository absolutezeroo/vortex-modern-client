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
import type {IRoomObject} from '../IRoomObject';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectSprite} from './IRoomObjectSprite';
import type {IRoomObjectSpriteVisualization} from './IRoomObjectSpriteVisualization';
import type {IRoomObjectVisualizationData} from './IRoomObjectVisualizationData';
import type {IGraphicAssetCollection} from './utils/IGraphicAssetCollection';
import {RoomObjectSprite} from './RoomObjectSprite';

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

    update(geometry: IRoomGeometry, time: number, update: boolean, skipUpdate: boolean): void
    {
        // Override in subclasses
    }

    getSpriteList(): IRoomObjectSprite[] | null
    {
        return null;
    }

    initialize(data: IRoomObjectVisualizationData): boolean
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
