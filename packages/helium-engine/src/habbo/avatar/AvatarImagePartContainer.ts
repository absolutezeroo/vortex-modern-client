import type {IActionDefinition} from './actions/IActionDefinition';
import type {AnimationFrame} from './structure/animation/AnimationFrame';
import type {IPartColor} from './structure/figure/IPartColor';

/**
 * Container for a single part in an avatar image, holding its rendering data.
 *
 * @see sources/win63_version/habbo/avatar/AvatarImagePartContainer.as
 */
export class AvatarImagePartContainer
{
	private _frames: any[];

	constructor(
		bodyPartId: string,
		partType: string,
		partId: string,
		color: IPartColor | null,
		frames: any[],
		action: IActionDefinition,
		isColorable: boolean,
		paletteMapId: number,
		flippedPartType: string = '',
		isBlendable: boolean = false,
		alpha: number = 1
	)
	{
		this._bodyPartId = bodyPartId;
		this._partType = partType;
		this._partId = partId;
		this._color = color;
		this._frames = frames;
		this._action = action;
		this._isColorable = isColorable;
		this._paletteMapId = paletteMapId;
		this._flippedPartType = flippedPartType;
		this._isBlendable = isBlendable;
		this._blendTransform = {redMultiplier: 1, greenMultiplier: 1, blueMultiplier: 1, alphaMultiplier: alpha};

		if (this._partType === 'ey')
		{
			this._isColorable = false;
		}
	}

	private _bodyPartId: string;

	public get bodyPartId(): string
	{
		return this._bodyPartId;
	}

	private _partType: string;

	public get partType(): string
	{
		return this._partType;
	}

	private _flippedPartType: string;

	public get flippedPartType(): string
	{
		return this._flippedPartType;
	}

	private _partId: string;

	public get partId(): string
	{
		return this._partId;
	}

	private _color: IPartColor | null;

	public get color(): IPartColor | null
	{
		return this._color;
	}

	private _action: IActionDefinition;

	public get action(): IActionDefinition
	{
		return this._action;
	}

	private _isColorable: boolean;

	public get isColorable(): boolean
	{
		return this._isColorable;
	}

	public set isColorable(value: boolean)
	{
		this._isColorable = value;
	}

	private _isBlendable: boolean;

	public get isBlendable(): boolean
	{
		return this._isBlendable;
	}

	private _blendTransform: {
		redMultiplier: number;
		greenMultiplier: number;
		blueMultiplier: number;
		alphaMultiplier: number
	};

	public get blendTransform(): {
		redMultiplier: number;
		greenMultiplier: number;
		blueMultiplier: number;
		alphaMultiplier: number
	}
	{
		return this._blendTransform;
	}

	private _paletteMapId: number;

	public get paletteMapId(): number
	{
		return this._paletteMapId;
	}

	public getFrameIndex(frameCounter: number): number
	{
		if (!this._frames || this._frames.length === 0) return 0;

		const index = frameCounter % this._frames.length;
		const frame = this._frames[index];

		if (frame && typeof frame === 'object' && 'number' in frame)
		{
			return (frame as AnimationFrame).number;
		}

		return index;
	}

	public getFrameDefinition(frameCounter: number): AnimationFrame | null
	{
		const index = frameCounter % this._frames.length;

		if (this._frames && this._frames.length > index)
		{
			const frame = this._frames[index];

			if (frame && typeof frame === 'object' && 'number' in frame)
			{
				return frame as AnimationFrame;
			}
		}

		return null;
	}

	public getCacheableKey(frameCounter: number): string
	{
		const index = frameCounter % this._frames.length;

		if (this._frames && this._frames.length > index)
		{
			const frame = this._frames[index];

			if (frame && typeof frame === 'object' && 'assetPartDefinition' in frame)
			{
				const animFrame = frame as AnimationFrame;

				return this._partId + ':' + animFrame.assetPartDefinition + ':' + animFrame.number;
			}
		}

		return this._partId + ':' + index;
	}

	public toString(): string
	{
		return [this._bodyPartId, this._partType, this._partId].join(':');
	}
}
