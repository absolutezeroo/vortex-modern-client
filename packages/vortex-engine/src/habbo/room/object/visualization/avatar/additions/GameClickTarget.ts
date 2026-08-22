/**
 * GameClickTarget
 *
 * Avatar addition that provides an invisible click target area for game
 * interactions. Renders a transparent bitmap that captures mouse events.
 *
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as
 */
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IAvatarAddition} from './IAvatarAddition';
import {AlphaTolerance} from '@room/object/enum/AlphaTolerance';
import {Texture} from 'pixi.js';

export class GameClickTarget implements IAvatarAddition
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::WIDTH
    private static readonly WIDTH: number = 46;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::HEIGHT
    private static readonly HEIGHT: number = 60;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::OFFSET_X
    private static readonly OFFSET_X: number = -23;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::OFFSET_Y
    private static readonly OFFSET_Y: number = -48;

    constructor(id: number)
    {
        this._id = id;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::_id
    private _id: number = -1;

    // AS3: .../src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::update() lazily
    // creates `new BitmapData(WIDTH, HEIGHT, true, 0)` - a fully transparent WIDTHxHEIGHT bitmap
    // used purely to size the sprite's hit-test bounds (alphaTolerance is MATCH_ALL_PIXELS, so
    // pixel content never matters, only the bitmap's dimensions).
    private _texture: Texture | null = null;

    // AS3: .../src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::get disposed()
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
    // AS3: .../src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::animate()
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
    // AS3: .../src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::update()
    update(sprite: IRoomObjectSprite | null, _scale: number): void
    {
        if(!sprite)
        {
            return;
        }

        if(!this._texture)
        {
            this._texture = Texture.from(new OffscreenCanvas(GameClickTarget.WIDTH, GameClickTarget.HEIGHT).transferToImageBitmap());
        }

        sprite.visible = true;
        sprite.texture = this._texture;
        sprite.offsetX = GameClickTarget.OFFSET_X;
        sprite.offsetY = GameClickTarget.OFFSET_Y;
        sprite.alphaTolerance = AlphaTolerance.MATCH_ALL_PIXELS;
    }

    /**
     * Disposes of this addition.
     */
    // AS3: .../src/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as::dispose()
    dispose(): void
    {
        if(!this._disposed)
        {
            this._texture = null;
            this._disposed = true;
        }
    }
}
