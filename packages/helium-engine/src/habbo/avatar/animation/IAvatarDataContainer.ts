/**
 * Interface for avatar data container with color transform information.
 *
 * @see sources/win63_version/habbo/avatar/animation/class_3581.as (IAvatarDataContainer)
 */
export interface IAvatarDataContainer
{
	readonly ink: number;
	readonly colorTransform: {
		redMultiplier: number;
		greenMultiplier: number;
		blueMultiplier: number;
		alphaMultiplier: number
	};
	readonly paletteIsGrayscale: boolean;
	readonly reds: number[];
	readonly greens: number[];
	readonly blues: number[];
	readonly alphas: number[];
}
