/**
 * GameClickTarget
 *
 * Avatar addition that provides an invisible click target area for game
 * interactions. Renders a transparent bitmap that captures mouse events.
 *
 * @see sources/flash_version/com/sulake/habbo/room/object/visualization/avatar/additions/GameClickTarget.as
 */
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IAvatarAddition} from './IAvatarAddition';
import {AlphaTolerance} from '@room/object/enum/AlphaTolerance';

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
	animate(sprite: IRoomObjectSprite | null): boolean
	{
		return false;
	}

	/**
	 * Updates the game click target sprite with position and hit-test settings.
	 *
	 * @param sprite - The sprite to update
	 * @param scale - The current visualization scale
	 */
	update(sprite: IRoomObjectSprite | null, scale: number): void
	{
		if (!sprite)
		{
			return;
		}

		sprite.visible = true;
		sprite.offsetX = OFFSET_X;
		sprite.offsetY = OFFSET_Y;
		sprite.alphaTolerance = AlphaTolerance.MATCH_ALL_PIXELS;
	}

	/**
	 * Disposes of this addition.
	 */
	dispose(): void
	{
		if (!this._disposed)
		{
			this._disposed = true;
		}
	}
}
