/**
 * AnimatedFurnitureVisualizationData
 *
 * @see com.sulake.habbo.room.object.visualization.furniture.AnimatedFurnitureVisualizationData
 *
 * Extends FurnitureVisualizationData. Overrides createSizeData to use AnimationSizeData.
 * Adds animation access methods.
 */
import type {AnimationFrame} from '../data/AnimationFrame';
import {AnimationSizeData} from '../data/AnimationSizeData';
import type {SizeData} from '../data/SizeData';
import {FurnitureVisualizationData} from './FurnitureVisualizationData';

export class AnimatedFurnitureVisualizationData extends FurnitureVisualizationData
{
	hasAnimation(scale: number, animationId: number): boolean
	{
		const sizeData = this.getSizeData(scale) as AnimationSizeData;

		if (sizeData !== null)
		{
			return sizeData.hasAnimation(animationId);
		}

		return false;
	}

	getAnimationCount(scale: number): number
	{
		const sizeData = this.getSizeData(scale) as AnimationSizeData;

		if (sizeData !== null)
		{
			return sizeData.getAnimationCount();
		}

		return 0;
	}

	getAnimationId(scale: number, index: number): number
	{
		const sizeData = this.getSizeData(scale) as AnimationSizeData;

		if (sizeData !== null)
		{
			return sizeData.getAnimationId(index);
		}

		return 0;
	}

	isImmediateChange(scale: number, animationId: number, fromAnimationId: number): boolean
	{
		const sizeData = this.getSizeData(scale) as AnimationSizeData;

		if (sizeData !== null)
		{
			return sizeData.isImmediateChange(animationId, fromAnimationId);
		}

		return false;
	}

	getStartFrame(scale: number, animationId: number, direction: number): number
	{
		const sizeData = this.getSizeData(scale) as AnimationSizeData;

		if (sizeData !== null)
		{
			return sizeData.getStartFrame(animationId, direction);
		}

		return 0;
	}

	getFrame(
		scale: number,
		animationId: number,
		direction: number,
		layerId: number,
		frameCounter: number
	): AnimationFrame | null
	{
		const sizeData = this.getSizeData(scale) as AnimationSizeData;

		if (sizeData !== null)
		{
			return sizeData.getFrame(animationId, direction, layerId, frameCounter);
		}

		return null;
	}

	getFrameFromSequence(
		scale: number,
		animationId: number,
		direction: number,
		layerId: number,
		sequenceIndex: number,
		frameIndex: number,
		frameCounter: number
	): AnimationFrame | null
	{
		const sizeData = this.getSizeData(scale) as AnimationSizeData;

		if (sizeData !== null)
		{
			return sizeData.getFrameFromSequence(animationId, direction, layerId, sequenceIndex, frameIndex, frameCounter);
		}

		return null;
	}

	protected override createSizeData(_size: number, layerCount: number, angle: number): SizeData
	{
		return new AnimationSizeData(layerCount, angle);
	}

	protected override processVisualizationElement(sizeData: SizeData, elementName: string, elementData: Record<string, unknown>): boolean
	{
		if (sizeData === null)
		{
			return false;
		}

		if (elementName === 'animations')
		{
			const animSizeData = sizeData as AnimationSizeData;

			if (animSizeData !== null)
			{
				if (!animSizeData.defineAnimations(elementData))
				{
					return false;
				}
			}

			return true;
		}

		return super.processVisualizationElement(sizeData, elementName, elementData);
	}
}
