/**
 * FurnitureValRandomizerVisualization
 *
 * @see com.sulake.habbo.room.object.visualization.furniture.FurnitureValRandomizerVisualization
 *
 * Valentine randomizer with directional animation transitions.
 */
import {AnimatedFurnitureVisualization} from './AnimatedFurnitureVisualization';

export class FurnitureValRandomizerVisualization extends AnimatedFurnitureVisualization
{
	private static readonly ANIMATION_ID_OFFSET_SLOW1: number = 20;
	private static readonly ANIMATION_ID_OFFSET_SLOW2: number = 10;
	private static readonly ANIMATION_ID_ROLL: number = 31;
	private static readonly ANIMATION_ID_BOUNCE: number = 32;
	private static readonly ANIMATION_ID_REST: number = 30;

	private _animationQueue: number[] = [];
	private _isRunning: boolean = false;

	constructor()
	{
		super();
		super.setAnimation(FurnitureValRandomizerVisualization.ANIMATION_ID_REST);
	}

	protected override setAnimation(animationId: number): void
	{
		if (animationId === 0)
		{
			if (!this._isRunning)
			{
				this._isRunning = true;
				this._animationQueue = [];
				this._animationQueue.push(FurnitureValRandomizerVisualization.ANIMATION_ID_ROLL);
				this._animationQueue.push(FurnitureValRandomizerVisualization.ANIMATION_ID_BOUNCE);

				return;
			}
		}

		if (animationId > 0 && animationId <= 10)
		{
			if (this._isRunning)
			{
				this._isRunning = false;
				this._animationQueue = [];

				if (this.direction === 2)
				{
					this._animationQueue.push(FurnitureValRandomizerVisualization.ANIMATION_ID_OFFSET_SLOW1 + 5 - animationId);
					this._animationQueue.push(FurnitureValRandomizerVisualization.ANIMATION_ID_OFFSET_SLOW2 + 5 - animationId);
				}
				else
				{
					this._animationQueue.push(FurnitureValRandomizerVisualization.ANIMATION_ID_OFFSET_SLOW1 + animationId);
					this._animationQueue.push(FurnitureValRandomizerVisualization.ANIMATION_ID_OFFSET_SLOW2 + animationId);
				}

				this._animationQueue.push(FurnitureValRandomizerVisualization.ANIMATION_ID_REST);

				return;
			}

			super.setAnimation(FurnitureValRandomizerVisualization.ANIMATION_ID_REST);
		}
	}

	protected override updateAnimation(scale: number): number
	{
		if (super.getLastFramePlayed(11))
		{
			if (this._animationQueue.length > 0)
			{
				super.setAnimation(this._animationQueue.shift()!);
			}
		}

		return super.updateAnimation(scale);
	}
}
