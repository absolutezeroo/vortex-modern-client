import {AnimationFrame} from './AnimationFrame';

/**
 * Represents the frames for a single body part within an animation action.
 * Frames with repeats are expanded into the frame array.
 *
 * @see sources/win63_version/habbo/avatar/structure/animation/AnimationActionPart.as
 */
export class AnimationActionPart
{
	constructor(data: any)
	{
		this._frames = [];

		// Nitro: frames (camelCase), XML-JSON: frame
		const rawFrames = data.frames || data.frame;

		if (rawFrames)
		{
			const frames: any[] = Array.isArray(rawFrames) ? rawFrames : [rawFrames];

			for (const frameData of frames)
			{
				const frame = new AnimationFrame(frameData);
				this._frames.push(frame);

				let repeats: number = parseInt(frameData.repeats) || 0;

				if (repeats > 1)
				{
					while (--repeats > 0)
					{
						this._frames.push(this._frames[this._frames.length - 1]);
					}
				}
			}
		}
	}

	private _frames: AnimationFrame[];

	public get frames(): AnimationFrame[]
	{
		return this._frames;
	}
}
