import type {IActionDefinition} from './IActionDefinition';

/**
 * Interface for active avatar action data.
 *
 * @see sources/win63_version/habbo/avatar/actions/class_3544.as (IActiveActionData)
 */
export interface IActiveActionData
{
	readonly id: string;
	readonly actionType: string;
	actionParameter: string;
	readonly startFrame: number;
	definition: IActionDefinition;
	overridingAction: string;
}
