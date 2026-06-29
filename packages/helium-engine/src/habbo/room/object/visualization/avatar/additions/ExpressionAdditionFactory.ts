/**
 * ExpressionAdditionFactory
 *
 * Factory class for creating expression-based avatar additions by type.
 * Maps expression type IDs to their corresponding addition implementations.
 *
 * @see sources/flash_version/com/sulake/habbo/room/object/visualization/avatar/additions/ExpressionAdditionFactory.as
 */
import type {IExpressionAddition} from './IExpressionAddition';
import type {AvatarVisualization} from '../AvatarVisualization';
import {ExpressionAddition} from './ExpressionAddition';
import {FloatingHeart} from './FloatingHeart';

export class ExpressionAdditionFactory
{
	public static readonly WAVE: number = 1;
	public static readonly BLOW: number = 2;
	public static readonly LAUGH: number = 3;
	public static readonly CRY: number = 4;
	public static readonly IDLE: number = 5;

	/**
	 * Creates the appropriate expression addition for the given type.
	 *
	 * @param id - The addition identifier
	 * @param type - The expression type
	 * @param visualization - The parent avatar visualization
	 * @returns The created expression addition, or null if type is unknown
	 */
	public static make(id: number, type: number, visualization: AvatarVisualization): IExpressionAddition | null
	{
		switch (type)
		{
			case ExpressionAdditionFactory.BLOW:
				return new FloatingHeart(id, ExpressionAdditionFactory.BLOW, visualization);
			default:
				return new ExpressionAddition(id, type, visualization);
		}
	}
}
