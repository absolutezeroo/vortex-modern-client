import type {IActionDefinition} from './IActionDefinition';
import {ActionType} from './ActionType';

/**
 * Defines an avatar action with its configuration, parameters, types, and offsets.
 * Parsed from JSON action data.
 *
 * @see sources/win63_version/habbo/avatar/actions/ActionDefinition.as
 */
export class ActionDefinition implements IActionDefinition
{
	private _prevents: string[];
	private _preventHeadTurn: boolean;
	private _offsets: Map<string, Map<number, number[]>> | null = null;
	private _types: Map<string, ActionType>;
	private _defaultParam: string = '';

	constructor(data: any)
	{
		this._prevents = [];
		this._types = new Map();
		this._params = new Map();

		this._id = String(data.id ?? '');
		this._state = String(data.state ?? '');
		this._precedence = parseInt(data.precedence) || 0;
		// Nitro: activePartSet, XML-JSON: activepartset
		this._activePartSet = String(data.activePartSet ?? data.activepartset ?? '');
		// Nitro: assetPartDefinition, XML-JSON: assetpartdefinition
		this._assetPartDefinition = String(data.assetPartDefinition ?? data.assetpartdefinition ?? '');
		this._lay = String(data.lay ?? '');
		// Nitro: geometryType, XML-JSON: geometrytype
		this._geometryType = String(data.geometryType ?? data.geometrytype ?? '');
		// Nitro: data.main (boolean), XML-JSON: data.main (string "1"/"0")
		this._isMain = Boolean(typeof data.main === 'boolean' ? data.main : parseInt(data.main));
		// Nitro: data.isDefault (boolean), XML-JSON: data.isdefault (string "1"/"0")
		this._isDefault = Boolean(data.isDefault ?? (data.isdefault !== undefined ? parseInt(data.isdefault) : false));
		// Nitro: data.animation (boolean), XML-JSON: data.animation (string "1"/"0")
		this._isAnimation = Boolean(typeof data.animation === 'boolean' ? data.animation : parseInt(data.animation));
		// Nitro: data.startFromFrameZero (boolean), XML-JSON: data.startfromframezero (string "true")
		this._startFromFrameZero = Boolean(data.startFromFrameZero ?? (String(data.startfromframezero) === 'true'));
		// Nitro: data.preventHeadTurn (boolean), XML-JSON: data.preventheadturn (string "true")
		this._preventHeadTurn = Boolean(data.preventHeadTurn ?? (String(data.preventheadturn) === 'true'));

		// Nitro: data.prevents is already an array, XML-JSON: comma-separated string
		if (Array.isArray(data.prevents))
		{
			this._prevents = data.prevents;
		}
		else
		{
			const prevents: string = String(data.prevents ?? '');

			if (prevents !== '')
			{
				this._prevents = prevents.split(',');
			}
		}

		if (data.params)
		{
			const params: any[] = Array.isArray(data.params) ? data.params : [data.params];

			for (const param of params)
			{
				const paramId = String(param.id ?? '');
				const paramValue = String(param.value ?? '');

				if (paramId === 'default')
				{
					this._defaultParam = paramValue;
				}
				else
				{
					this._params.set(paramId, paramValue);
				}
			}
		}

		if (data.types)
		{
			const types: any[] = Array.isArray(data.types) ? data.types : [data.types];

			for (const typeData of types)
			{
				const typeId = String(typeData.id ?? '');
				this._types.set(typeId, new ActionType(typeData));
			}
		}
	}

	private _id: string;

	public get id(): string
	{
		return this._id;
	}

	private _state: string;

	public get state(): string
	{
		return this._state;
	}

	private _precedence: number;

	public get precedence(): number
	{
		return this._precedence;
	}

	private _activePartSet: string;

	public get activePartSet(): string
	{
		return this._activePartSet;
	}

	private _assetPartDefinition: string;

	public get assetPartDefinition(): string
	{
		return this._assetPartDefinition;
	}

	private _lay: string;

	public get lay(): string
	{
		return this._lay;
	}

	private _geometryType: string;

	public get geometryType(): string
	{
		return this._geometryType;
	}

	private _isMain: boolean = false;

	public get isMain(): boolean
	{
		return this._isMain;
	}

	private _isDefault: boolean = false;

	public get isDefault(): boolean
	{
		return this._isDefault;
	}

	private _isAnimation: boolean = false;

	public get isAnimation(): boolean
	{
		return this._isAnimation;
	}

	private _startFromFrameZero: boolean = false;

	public get startFromFrameZero(): boolean
	{
		return this._startFromFrameZero;
	}

	private _params: Map<string, string>;

	public get params(): Map<string, string>
	{
		return this._params;
	}

	/**
	 * Sets canvas offsets for a specific set type and direction.
	 *
	 * @param setType - The set type identifier
	 * @param direction - The direction index
	 * @param offsets - The offset values
	 */
	public setOffsets(setType: string, direction: number, offsets: number[]): void
	{
		if (!this._offsets)
		{
			this._offsets = new Map();
		}

		if (!this._offsets.has(setType))
		{
			this._offsets.set(setType, new Map());
		}

		const directionMap = this._offsets.get(setType)!;
		directionMap.set(direction, offsets);
	}

	/**
	 * Gets canvas offsets for a specific set type and direction.
	 *
	 * @param setType - The set type identifier
	 * @param direction - The direction index
	 * @returns The offset values, or null if not found
	 */
	public getOffsets(setType: string, direction: number): number[] | null
	{
		if (!this._offsets) return null;

		const directionMap = this._offsets.get(setType);

		if (!directionMap) return null;

		return directionMap.get(direction) ?? null;
	}

	/**
	 * Gets the parameter value for the given key, falling back to the default parameter.
	 *
	 * @param key - The parameter key
	 * @returns The parameter value, or the default value if key not found
	 */
	public getParameterValue(key: string): string
	{
		if (key === '') return '';

		const value = this._params.get(key);

		if (value === undefined)
		{
			return this._defaultParam;
		}

		return value;
	}

	/**
	 * Gets the list of actions prevented by this definition and its type-specific prevents.
	 *
	 * @param id - Optional type identifier for type-specific prevents
	 * @returns Combined array of prevented action identifiers
	 */
	public getPrevents(id: string = ''): string[]
	{
		const typePrevents = this._getTypePrevents(id);

		if (typePrevents.length === 0) return this._prevents;

		if (this._prevents.length === 0) return typePrevents;

		const result = [...this._prevents];
		result.push(...typePrevents);

		return result;
	}

	/**
	 * Checks if head turning is prevented for this action or a specific type.
	 *
	 * @param id - Optional type identifier
	 * @returns True if head turning is prevented
	 */
	public getPreventHeadTurn(id: string = ''): boolean
	{
		if (id === '')
		{
			return this._preventHeadTurn;
		}

		const actionType = this._types.get(id);

		if (actionType)
		{
			return actionType.preventHeadTurn;
		}

		return this._preventHeadTurn;
	}

	/**
	 * Checks if the action is animated for a specific type.
	 *
	 * @param part - The type identifier
	 * @returns True if the action is animated
	 */
	public isAnimated(part: string): boolean
	{
		if (part === '') return true;

		const actionType = this._types.get(part);

		if (actionType)
		{
			return actionType.isAnimated;
		}

		return true;
	}

	public toString(): string
	{
		return '[ActionDefinition]\n'
			+ 'id:           ' + this._id + '\n'
			+ 'state:        ' + this._state + '\n'
			+ 'main:         ' + this._isMain + '\n'
			+ 'default:      ' + this._isDefault + '\n'
			+ 'geometry:     ' + this._state + '\n'
			+ 'precedence:   ' + this._precedence + '\n'
			+ 'activepartset:' + this._activePartSet + '\n'
			+ 'activepartdef:' + this._assetPartDefinition;
	}

	/**
	 * Gets prevents from a specific action type.
	 *
	 * @param id - The type identifier
	 * @returns Array of prevented actions for this type
	 */
	private _getTypePrevents(id: string): string[]
	{
		if (id === '') return [];

		const actionType = this._types.get(id);

		if (actionType)
		{
			return actionType.prevents;
		}

		return [];
	}
}
