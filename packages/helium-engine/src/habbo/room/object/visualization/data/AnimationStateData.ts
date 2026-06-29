/**
 * AnimationStateData
 *
 * @see com.sulake.habbo.room.object.visualization.data.AnimationStateData
 *
 * Runtime animation state: animationId, frameCounter, frames/played/lastFramePlayed per layer.
 * Recycles AnimationFrame instances back to the pool.
 */
import {AnimationFrame} from './AnimationFrame';

export class AnimationStateData
{
	private _frames: (AnimationFrame | null)[] = [];
	private _lastFramePlayed: boolean[] = [];
	private _animationPlayed: boolean[] = [];
	private _layerCount: number = 0;

	private _animationId: number = -1;

	get animationId(): number
	{
		return this._animationId;
	}

	set animationId(value: number)
	{
		if (value !== this._animationId)
		{
			this._animationId = value;
			this.resetAnimationFrames(false);
		}
	}

	private _animationAfterTransitionId: number = 0;

	get animationAfterTransitionId(): number
	{
		return this._animationAfterTransitionId;
	}

	set animationAfterTransitionId(value: number)
	{
		this._animationAfterTransitionId = value;
	}

	private _animationOver: boolean = false;

	get animationOver(): boolean
	{
		return this._animationOver;
	}

	set animationOver(value: boolean)
	{
		this._animationOver = value;
	}

	private _frameCounter: number = 0;

	get frameCounter(): number
	{
		return this._frameCounter;
	}

	set frameCounter(value: number)
	{
		this._frameCounter = value;
	}

	setLayerCount(count: number): void
	{
		this._layerCount = count;
		this.resetAnimationFrames();
	}

	resetAnimationFrames(recycleAll: boolean = true): void
	{
		if (recycleAll || this._frames === null)
		{
			this.recycleFrames();
			this._frames = [];
		}

		this._lastFramePlayed = [];
		this._animationPlayed = [];
		this._animationOver = false;
		this._frameCounter = 0;

		for (let i = 0; i < this._layerCount; i++)
		{
			if (recycleAll || this._frames.length <= i)
			{
				this._frames[i] = null;
			}
			else
			{
				const frame = this._frames[i];

				if (frame !== null)
				{
					frame.recycle();
					this._frames[i] = AnimationFrame.allocate(
						frame.id, frame.x, frame.y,
						frame.repeats, 0, frame.isLastFrame
					);
				}
			}

			this._lastFramePlayed[i] = false;
			this._animationPlayed[i] = false;
		}
	}

	getFrame(layerIndex: number): AnimationFrame | null
	{
		if (layerIndex >= 0 && layerIndex < this._layerCount)
		{
			return this._frames[layerIndex];
		}

		return null;
	}

	setFrame(layerIndex: number, frame: AnimationFrame): void
	{
		if (layerIndex >= 0 && layerIndex < this._layerCount)
		{
			const existing = this._frames[layerIndex];

			if (existing !== null)
			{
				existing.recycle();
			}

			this._frames[layerIndex] = frame;
		}
	}

	getAnimationPlayed(layerIndex: number): boolean
	{
		if (layerIndex >= 0 && layerIndex < this._layerCount)
		{
			return this._animationPlayed[layerIndex];
		}

		return true;
	}

	setAnimationPlayed(layerIndex: number, value: boolean): void
	{
		if (layerIndex >= 0 && layerIndex < this._layerCount)
		{
			this._animationPlayed[layerIndex] = value;
		}
	}

	getLastFramePlayed(layerIndex: number): boolean
	{
		if (layerIndex >= 0 && layerIndex < this._layerCount)
		{
			return this._lastFramePlayed[layerIndex];
		}

		return true;
	}

	setLastFramePlayed(layerIndex: number, value: boolean): void
	{
		if (layerIndex >= 0 && layerIndex < this._layerCount)
		{
			this._lastFramePlayed[layerIndex] = value;
		}
	}

	dispose(): void
	{
		this.recycleFrames();
		this._frames = [];
		this._lastFramePlayed = [];
		this._animationPlayed = [];
	}

	private recycleFrames(): void
	{
		if (this._frames !== null)
		{
			for (const frame of this._frames)
			{
				if (frame !== null)
				{
					frame.recycle();
				}
			}
		}
	}
}
