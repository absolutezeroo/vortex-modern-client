import type {IActionDefinition} from '../actions/IActionDefinition';
import type {IStructureData} from './IStructureData';
import {AnimationAction} from './animation/AnimationAction';

/**
 * Manages avatar animation action data parsed from configuration.
 *
 * @see sources/win63_version/habbo/avatar/structure/AnimationData.as
 */
export class AnimationData implements IStructureData
{
	private _actions: Map<string, AnimationAction>;

	constructor()
	{
		this._actions = new Map();
	}

	public parse(data: any): boolean
	{
		if (!data) return false;

		const actions = data.actions ?? data.action;

		if (actions)
		{
			const actionList = Array.isArray(actions) ? actions : [actions];

			for (const actionData of actionList)
			{
				this._actions.set(String(actionData.id), new AnimationAction(actionData));
			}
		}

		return true;
	}

	public appendJSON(data: any): boolean
	{
		if (!data) return false;

		const actions = data.actions ?? data.action;

		if (actions)
		{
			const actionList = Array.isArray(actions) ? actions : [actions];

			for (const actionData of actionList)
			{
				this._actions.set(String(actionData.id), new AnimationAction(actionData));
			}
		}

		return true;
	}

	public getAction(action: IActionDefinition): AnimationAction | null
	{
		return this._actions.get(action.id) || null;
	}

	public getFrameCount(action: IActionDefinition): number
	{
		const animAction = this.getAction(action);

		if (!animAction) return 0;

		return animAction.frameCount;
	}
}
