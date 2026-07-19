/**
 * GameClickTarget
 *
 * Avatar addition that provides an invisible click target area for game
 * interactions. Renders a transparent bitmap that captures mouse events.
 *
 * @see sources/PRODUCTION-201601012205-226667486/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as
 */
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IAvatarAddition} from './IAvatarAddition';
import {AlphaTolerance} from '@room/object/enum/AlphaTolerance';
import {Texture} from 'pixi.js';

const WIDTH: number = 46;
const HEIGHT: number = 60;
const OFFSET_X: number = -23;
const OFFSET_Y: number = -48;

export class GameClickTarget implements IAvatarAddition
{
    constructor(id: number)
    {
        this._id = id;
    }

    private _id: number = -1;

    get id(): number
    {
        return this._id;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::update() lazily
    // creates `new BitmapData(WIDTH, HEIGHT, true, 0)` - a fully transparent WIDTHxHEIGHT bitmap
    // used purely to size the sprite's hit-test bounds (alphaTolerance is MATCH_ALL_PIXELS, so
    // pixel content never matters, only the bitmap's dimensions).
    private _texture: Texture | null = null;

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Animates the game click target (no-op).
     *
     * @param sprite - The sprite to animate
     * @returns Always false (no dynamic animation)
     */
    animate(_sprite: IRoomObjectSprite | null): boolean
    {
        return false;
    }

    /**
     * Updates the game click target sprite with position and hit-test settings.
     *
     * @param sprite - The sprite to update
     * @param _scale - The current visualization scale (unused, matches AS3)
     */
    update(sprite: IRoomObjectSprite | null, _scale: number): void
    {
        if(!sprite)
        {
            return;
        }

        if(!this._texture)
        {
            this._texture = Texture.from(new OffscreenCanvas(WIDTH, HEIGHT).transferToImageBitmap());
        }

        sprite.visible = true;
        sprite.texture = this._texture;
        sprite.offsetX = OFFSET_X;
        sprite.offsetY = OFFSET_Y;
        sprite.alphaTolerance = AlphaTolerance.MATCH_ALL_PIXELS;
    }

    /**
     * Disposes of this addition.
     */
    dispose(): void
    {
        if(!this._disposed)
        {
            this._texture = null;
            this._disposed = true;
        }
    }
}
