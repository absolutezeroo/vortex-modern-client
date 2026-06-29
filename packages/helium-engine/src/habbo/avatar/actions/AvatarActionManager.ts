import {ActionDefinition} from './ActionDefinition';
import type {IActiveActionData} from './IActiveActionData';

/**
 * Manages avatar action definitions, sorting and filtering.
 *
 * @see sources/win63_version/habbo/avatar/actions/AvatarActionManager.as
 */
export class AvatarActionManager
{
	private _actions: Map<string, ActionDefinition>;
	private _defaultAction: ActionDefinition | null = null;

	constructor(data: any)
	{
		this._actions = new Map();
		this.updateActions(data);
	}

	public updateActions(data: any): void
	{
		const actions = data?.actions ?? data?.action;

		if (!actions) return;

		const actionList = Array.isArray(actions) ? actions : [actions];

		for (const actionData of actionList)
		{
			const state = String(actionData.state || '');

			if (state !== '')
			{
				const definition = new ActionDefinition(actionData);

				this._actions.set(state, definition);
			}
		}

		// Parse action offsets (Nitro format: data.actionOffsets)
		if (data.actionOffsets)
		{
			this.parseActionOffsets(data.actionOffsets);
		}
	}

	public getActionDefinition(id: string): ActionDefinition | null
	{
		for (const action of this._actions.values())
		{
			if (action.id === id) return action;
		}

		return null;
	}

	public getActionDefinitionWithState(state: string): ActionDefinition | null
	{
		return this._actions.get(state) || null;
	}

	public getDefaultAction(): ActionDefinition | null
	{
		if (this._defaultAction) return this._defaultAction;

		for (const action of this._actions.values())
		{
			if (action.isDefault)
			{
				this._defaultAction = action;

				return action;
			}
		}

		return null;
	}

	public getCanvasOffsets(actions: IActiveActionData[], scale: string, direction: number): number[] | null
	{
		let offsets: number[] | null = null;

		for (const activeAction of actions)
		{
			const actionDef = this._actions.get(activeAction.actionType);

			if (actionDef)
			{
				const actionOffsets = actionDef.getOffsets(scale, direction);

				if (actionOffsets) offsets = actionOffsets;
			}
		}

		return offsets;
	}

	public sortActions(actions: IActiveActionData[]): IActiveActionData[]
	{
		const filtered = this.filterActions(actions);
		const result: IActiveActionData[] = [];

		for (const action of filtered)
		{
			const definition = this._actions.get(action.actionType);

			if (definition)
			{
				action.definition = definition;
				result.push(action);
			}
		}

		result.sort((a, b) =>
		{
			const precA = a.definition.precedence;
			const precB = b.definition.precedence;

			if (precA < precB) return 1;
			if (precA > precB) return -1;

			return 0;
		});

		return result;
	}

	private parseActionOffsets(offsets: any[]): void
	{
		if (!offsets || offsets.length === 0) return;

		for (const offset of offsets)
		{
			const action = this._actions.get(offset.action);

			if (!action) continue;

			if (!offset.offsets) continue;

			for (const canvasOffset of offset.offsets)
			{
				const size = String(canvasOffset.size || '');
				const direction = canvasOffset.direction;

				if (size === '' || direction === undefined) continue;

				const x = canvasOffset.x || 0;
				const y = canvasOffset.y || 0;
				const z = canvasOffset.z || 0;

				action.setOffsets(size, direction, [x, y, z]);
			}
		}
	}

	private filterActions(actions: IActiveActionData[]): IActiveActionData[]
	{
		const prevents: Set<string> = new Set();

		for (const action of actions)
		{
			const definition = this._actions.get(action.actionType);

			if (definition)
			{
				for (const p of definition.getPrevents(action.actionParameter))
				{
					prevents.add(p);
				}
			}
		}

		const result: IActiveActionData[] = [];

		for (const action of actions)
		{
			let key = action.actionType;

			if (action.actionType === 'fx')
			{
				key += '.' + action.actionParameter;
			}

			if (!prevents.has(key))
			{
				result.push(action);
			}
		}

		return result;
	}
}
