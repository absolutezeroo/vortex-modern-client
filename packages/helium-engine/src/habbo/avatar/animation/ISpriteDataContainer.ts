import type {IAnimation} from './IAnimation';

/**
 * Interface for sprite data used in avatar animations.
 *
 * @see sources/win63_version/habbo/avatar/animation/ISpriteDataContainer.as
 */
export interface ISpriteDataContainer
{
	readonly animation: IAnimation;
	readonly id: string;
	readonly ink: number;
	readonly member: string;
	readonly hasDirections: boolean;
	readonly hasStaticY: boolean;

	getDirectionOffsetX(direction: number): number;

	getDirectionOffsetY(direction: number): number;

	getDirectionOffsetZ(direction: number): number;
}
