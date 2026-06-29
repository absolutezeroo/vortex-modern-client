import type {IAvatarDataContainer} from './IAvatarDataContainer';

/**
 * Container for avatar color and ink data used in effect animations.
 *
 * @see sources/win63_version/habbo/avatar/animation/AvatarDataContainer.as
 */
export class AvatarDataContainer implements IAvatarDataContainer
{
	constructor(data: any)
	{
		this._ink = parseInt(data.ink) || 0;

		let foreground = String(data.foreground || '').replace('#', '');
		let background = String(data.background || '').replace('#', '');

		const fgColor = parseInt(foreground, 16) || 0;
		const bgColor = parseInt(background, 16) || 0;

		const r = (fgColor >> 16) & 0xFF;
		const g = (fgColor >> 8) & 0xFF;
		const b = fgColor & 0xFF;

		const redMultiplier = r / 255;
		const greenMultiplier = g / 255;
		const blueMultiplier = b / 255;
		let alphaMultiplier = 1;

		if (this._ink === 37)
		{
			alphaMultiplier = 0.5;
			this._paletteIsGrayscale = false;
		}

		this._colorTransform = {redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier};

		const palette = this.generatePaletteMapForGrayscale(bgColor, fgColor);

		this._reds = palette.reds;
		this._greens = palette.greens;
		this._blues = palette.blues;
		this._alphas = palette.alphas;
	}

	private _ink: number;

	public get ink(): number
	{
		return this._ink;
	}

	private _colorTransform: {
		redMultiplier: number;
		greenMultiplier: number;
		blueMultiplier: number;
		alphaMultiplier: number
	};

	public get colorTransform(): {
		redMultiplier: number;
		greenMultiplier: number;
		blueMultiplier: number;
		alphaMultiplier: number
	}
	{
		return this._colorTransform;
	}

	private _paletteIsGrayscale: boolean = true;

	public get paletteIsGrayscale(): boolean
	{
		return this._paletteIsGrayscale;
	}

	private _reds: number[];

	public get reds(): number[]
	{
		return this._reds;
	}

	private _greens: number[];

	public get greens(): number[]
	{
		return this._greens;
	}

	private _blues: number[];

	public get blues(): number[]
	{
		return this._blues;
	}

	private _alphas: number[];

	public get alphas(): number[]
	{
		return this._alphas;
	}

	private generatePaletteMapForGrayscale(bgColor: number, fgColor: number): {
		reds: number[];
		greens: number[];
		blues: number[];
		alphas: number[]
	}
	{
		const bgR = (bgColor >> 16) & 0xFF;
		const bgG = (bgColor >> 8) & 0xFF;
		const bgB = bgColor & 0xFF;

		const fgR = (fgColor >> 16) & 0xFF;
		const fgG = (fgColor >> 8) & 0xFF;
		const fgB = fgColor & 0xFF;

		const rStep = (fgR - bgR) / 255;
		const gStep = (fgG - bgG) / 255;
		const bStep = (fgB - bgB) / 255;

		const reds: number[] = [];
		const greens: number[] = [];
		const blues: number[] = [];
		const alphas: number[] = [];

		let curR = bgR;
		let curG = bgG;
		let curB = bgB;

		for (let i = 0; i < 256; i++)
		{
			curR += rStep;
			curG += gStep;
			curB += bStep;

			const value = ((curR & 0xFF) << 16) | ((curG & 0xFF) << 8) | (curB & 0xFF);

			reds.push(value);
			greens.push(value);
			blues.push(value);
			alphas.push(value);
		}

		return {reds, greens, blues, alphas};
	}
}
