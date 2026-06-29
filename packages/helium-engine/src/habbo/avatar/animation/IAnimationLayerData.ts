import type {IActiveActionData} from '../actions/IActiveActionData';

/**
 * Interface for animation layer data containing frame offsets and action reference.
 *
 * @see sources/win63_version/habbo/avatar/animation/class_3526.as (IAnimationLayerData)
 */
export interface IAnimationLayerData
{
	readonly id: string;
	readonly action: IActiveActionData;
	readonly animationFrame: number;
	readonly dx: number;
	readonly dy: number;
	readonly dz: number;
	readonly dd: number;
}
