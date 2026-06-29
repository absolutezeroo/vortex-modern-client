/**
 * AnimationData
 *
 * @see com.sulake.habbo.room.object.visualization.data.AnimationData
 *
 * Collection of AnimationLayerData for a single animation.
 * Manages transition IDs (TO_OFFSET=1000000, FROM_OFFSET=2000000),
 * immediateChanges, and randomStart.
 */
import type {AnimationFrame} from './AnimationFrame';
import {AnimationFrameSequenceData} from './AnimationFrameSequenceData';
import {AnimationLayerData} from './AnimationLayerData';
import {DirectionalOffsetData} from './DirectionalOffsetData';

export class AnimationData
{
	public static readonly DEFAULT_FRAME_NUMBER: number = 0;

	private static readonly TRANSITION_TO_ANIMATION_OFFSET: number = 1000000;
	private static readonly TRANSITION_FROM_ANIMATION_OFFSET: number = 2000000;
	private _layers: Map<number, AnimationLayerData> = new Map();
	private _maxFrameCount: number = -1;
	private _randomStart: boolean = false;
	private _immediateChanges: number[] | null = null;

	static getTransitionToAnimationId(animationId: number): number
	{
		return AnimationData.TRANSITION_TO_ANIMATION_OFFSET + animationId;
	}

	static getTransitionFromAnimationId(animationId: number): number
	{
		return AnimationData.TRANSITION_FROM_ANIMATION_OFFSET + animationId;
	}

	static isTransitionToAnimation(animationId: number): boolean
	{
		return animationId >= AnimationData.TRANSITION_TO_ANIMATION_OFFSET &&
			animationId < AnimationData.TRANSITION_FROM_ANIMATION_OFFSET;
	}

	static isTransitionFromAnimation(animationId: number): boolean
	{
		return animationId >= AnimationData.TRANSITION_FROM_ANIMATION_OFFSET;
	}

	setImmediateChanges(changes: number[]): void
	{
		this._immediateChanges = changes;
	}

	isImmediateChange(fromAnimationId: number): boolean
	{
		if (this._immediateChanges !== null && this._immediateChanges.indexOf(fromAnimationId) >= 0)
		{
			return true;
		}

		return false;
	}

	getStartFrame(layerIndex: number): number
	{
		if (!this._randomStart)
		{
			return 0;
		}

		return Math.floor(Math.random() * this._maxFrameCount);
	}

	/**
	 * Initialize from Nitro JSON data.
	 *
	 * JSON format:
	 * ```json
	 * {
	 *   "randomStart": 1,
	 *   "layers": {
	 *     "0": { "loopCount": 1, "frameRepeat": 2, "random": 0,
	 *       "frameSequences": { "0": { "loopCount": 1, "random": 0,
	 *         "frames": { "0": { "id": 0, "x": 0, "y": 0 }, ... }
	 *       } }
	 *     }
	 *   }
	 * }
	 * ```
	 */
	initialize(data: Record<string, unknown>): boolean
	{
		this._randomStart = ((data['randomStart'] as number) || 0) !== 0;

		const layers = (data['layers'] ?? null) as Record<string, Record<string, unknown>> | null;

		if (!layers)
		{
			// AS3 uses 'animationLayer' in XML, Nitro JSON uses 'layers'
			return true;
		}

		for (const layerIdStr in layers)
		{
			const layerId = parseInt(layerIdStr);

			if (isNaN(layerId))
			{
				continue;
			}

			const layerDef = layers[layerIdStr];
			const loopCount = (layerDef['loopCount'] as number) || 1;
			const frameRepeat = (layerDef['frameRepeat'] as number) || 1;
			const isRandom = ((layerDef['random'] as number) || 0) !== 0;

			if (!this.addLayer(layerId, loopCount, frameRepeat, isRandom, layerDef))
			{
				return false;
			}
		}

		return true;
	}

	getFrame(direction: number, layerId: number, frameCounter: number): AnimationFrame | null
	{
		const layerData = this._layers.get(layerId);

		if (layerData !== undefined)
		{
			return layerData.getFrame(direction, frameCounter);
		}

		return null;
	}

	getFrameFromSequence(direction: number, layerId: number, sequenceIndex: number, frameIndex: number, frameCounter: number): AnimationFrame | null
	{
		const layerData = this._layers.get(layerId);

		if (layerData !== undefined)
		{
			return layerData.getFrameFromSequence(direction, sequenceIndex, frameIndex, frameCounter);
		}

		return null;
	}

	dispose(): void
	{
		for (const layer of this._layers.values())
		{
			if (layer !== null)
			{
				layer.dispose();
			}
		}

		this._layers.clear();
		this._immediateChanges = null;
	}

	private addLayer(
		layerId: number,
		loopCount: number,
		frameRepeat: number,
		isRandom: boolean,
		layerDef: Record<string, unknown>
	): boolean
	{
		const layerData = new AnimationLayerData(loopCount, frameRepeat, isRandom);

		const frameSequences = (layerDef['frameSequences'] ?? null) as Record<string, Record<string, unknown>> | null;

		if (frameSequences)
		{
			for (const seqIdStr in frameSequences)
			{
				const seqDef = frameSequences[seqIdStr];
				const seqLoopCount = (seqDef['loopCount'] as number) || 1;
				const seqRandom = ((seqDef['random'] as number) || 0) !== 0;

				const sequence: AnimationFrameSequenceData = layerData.addFrameSequence(seqLoopCount, seqRandom);

				const frames = (seqDef['frames'] ?? null) as Record<string, Record<string, unknown>> | null;

				if (frames)
				{
					// Sort frame keys numerically to preserve order
					const frameKeys = Object.keys(frames).sort((a, b) => parseInt(a) - parseInt(b));

					for (const frameKey of frameKeys)
					{
						const frameDef = frames[frameKey];
						const id = (frameDef['id'] as number) || 0;
						const x = (frameDef['x'] as number) || 0;
						const y = (frameDef['y'] as number) || 0;
						const randomX = (frameDef['randomX'] as number) || 0;
						const randomY = (frameDef['randomY'] as number) || 0;

						const offsets = this.readDirectionalOffsets(frameDef);
						sequence.addFrame(id, x, y, randomX, randomY, offsets);
					}
				}

				sequence.initialize();
			}
		}

		layerData.calculateLength();
		this._layers.set(layerId, layerData);

		const frameCount = layerData.frameCount;

		if (frameCount > this._maxFrameCount)
		{
			this._maxFrameCount = frameCount;
		}

		return true;
	}

	private readDirectionalOffsets(frameDef: Record<string, unknown>): DirectionalOffsetData | null
	{
		const offsets = (frameDef['offsets'] ?? null) as Record<string, Record<string, unknown>> | null;

		if (!offsets)
		{
			return null;
		}

		let offsetData: DirectionalOffsetData | null = null;

		for (const offsetKey in offsets)
		{
			const offsetDef = offsets[offsetKey];
			const direction = (offsetDef['direction'] ?? null) as number | null;

			if (direction === null)
			{
				continue;
			}

			const x = (offsetDef['x'] as number) || 0;
			const y = (offsetDef['y'] as number) || 0;

			if (offsetData === null)
			{
				offsetData = new DirectionalOffsetData();
			}

			offsetData.setOffset(direction, x, y);
		}

		return offsetData;
	}
}
