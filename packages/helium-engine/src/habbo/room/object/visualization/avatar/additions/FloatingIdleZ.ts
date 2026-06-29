/**
 * FloatingIdleZ
 *
 * Avatar addition that shows a floating "Z" animation when the avatar is
 * idle/sleeping. Alternates between two animation frames with a delay.
 *
 * @see sources/flash_version/com/sulake/habbo/room/object/visualization/avatar/additions/FloatingIdleZ.as
 */
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';
import type {IAvatarAddition} from './IAvatarAddition';
import type {AvatarVisualization} from '../AvatarVisualization';

const DELAY_BEFORE_ANIMATION: number = 2000;
const DELAY_PER_FRAME: number = 2000;
const STATE_DELAY: number = 0;
const STATE_FRAME_A: number = 1;
const STATE_FRAME_B: number = 2;

export class FloatingIdleZ implements IAvatarAddition
{
	protected _visualization: AvatarVisualization;
	private _assetName: string | null = null;
	private _startTime: number;
	private _offsetY: number = 0;
	private _scale: number = 0;
	private _state: number = -1;

	constructor(id: number, visualization: AvatarVisualization)
	{
		this._id = id;
		this._visualization = visualization;
		this._startTime = performance.now();
		this._state = STATE_DELAY;
	}

	protected _id: number;

	get id(): number
	{
		return this._id;
	}

	get disposed(): boolean
	{
		return this._visualization == null;
	}

	/**
	 * Animates the floating Z between frames with timing delays.
	 *
	 * @param sprite - The sprite to animate
	 * @returns True if a visual change occurred
	 */
	animate(sprite: IRoomObjectSprite | null): boolean
	{
		if (!sprite)
		{
			return false;
		}

		const now = performance.now();

		if (this._state === STATE_DELAY)
		{
			if ((now - this._startTime) >= DELAY_BEFORE_ANIMATION)
			{
				this._state = STATE_FRAME_A;
				this._startTime = now;
				this._assetName = this.getAssetNameForFrame(1);
			}
		}

		if (this._state === STATE_FRAME_A)
		{
			if ((now - this._startTime) >= DELAY_PER_FRAME)
			{
				this._state = STATE_FRAME_B;
				this._startTime = now;
				this._assetName = this.getAssetNameForFrame(2);
			}
		}

		if (this._state === STATE_FRAME_B)
		{
			if ((now - this._startTime) >= DELAY_PER_FRAME)
			{
				this._state = STATE_FRAME_A;
				this._startTime = now;
				this._assetName = this.getAssetNameForFrame(1);
			}
		}

		if (this._assetName)
		{
			sprite.assetName = this._assetName;
			sprite.alpha = 255;
			sprite.visible = true;
		}
		else
		{
			sprite.visible = false;
		}

		return false;
	}

	/**
	 * Updates the sprite position and scale for the idle Z addition.
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

		let offsetX = 0;

		this._scale = scale;
		this._assetName = this.getAssetNameForFrame((this._state === STATE_FRAME_A) ? 1 : 2);

		let fullSize = 64;

		if (scale < 48)
		{
			if (this._visualization.angle === 135 || this._visualization.angle === 180 ||
				this._visualization.angle === 225 || this._visualization.angle === 270)
			{
				offsetX = 10;
			}
			else
			{
				offsetX = -16;
			}

			this._offsetY = -38;
			fullSize = 32;
		}
		else
		{
			if (this._visualization.angle === 135 || this._visualization.angle === 180 ||
				this._visualization.angle === 225 || this._visualization.angle === 270)
			{
				offsetX = 22;
			}
			else
			{
				offsetX = -30;
			}

			this._offsetY = -70;
		}

		if (this._visualization.posture === 'sit')
		{
			this._offsetY = this._offsetY + (fullSize / 2);
		}
		else if (this._visualization.posture === 'lay')
		{
			this._offsetY = this._offsetY + (fullSize - (0.3 * fullSize));
		}

		if (this._assetName != null)
		{
			sprite.assetName = this._assetName;
			sprite.offsetX = offsetX;
			sprite.offsetY = this._offsetY;
			sprite.relativeDepth = -0.02;
			sprite.alpha = 0;
		}
	}

	/**
	 * Disposes of this addition and releases references.
	 */
	dispose(): void
	{
		this._visualization = null!;
		this._assetName = null;
	}

	/**
	 * Builds the asset name for the given animation frame.
	 *
	 * @param frame - The frame number (1 or 2)
	 * @returns The asset name string
	 */
	protected getAssetNameForFrame(frame: number): string
	{
		let direction = 'left';

		if (this._visualization.angle === 135 || this._visualization.angle === 180 ||
			this._visualization.angle === 225 || this._visualization.angle === 270)
		{
			direction = 'right';
		}

		return `user_idle_${direction}_${frame}${(this._scale < 48) ? '_small' : ''}_png`;
	}
}
