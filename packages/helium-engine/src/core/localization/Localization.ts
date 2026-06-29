import type {ILocalizable} from './ILocalizable';
import type {ILocalization} from './ILocalization';
import type {ICoreLocalizationManager} from './ICoreLocalizationManager';

interface ParameterData
{
	id: string;
	value: string;
}

/**
 * Localization entry that holds a single localized string
 *
 * Based on AS3 com.sulake.core.localization.Localization
 */
export class Localization implements ILocalization
{
	private readonly _manager: ICoreLocalizationManager;
	private readonly _key: string;
	private _parameters: Map<string, ParameterData> | null = null;
	private _listeners: Set<ILocalizable> | null = null;

	constructor(manager: ICoreLocalizationManager, key: string, value: string | null = null)
	{
		this._manager = manager;
		this._key = key;
		this._value = value;
	}

	private _value: string | null;

	get value(): string
	{
		return this.fillParameterValues();
	}

	get isInitialized(): boolean
	{
		return this._value !== null;
	}

	get raw(): string
	{
		return this._value ?? '';
	}

	setValue(value: string): void
	{
		this._value = value;
		this.updateListeners();
	}

	registerListener(listener: ILocalizable): void
	{
		if (!this._listeners)
		{
			this._listeners = new Set();
		}

		this._listeners.add(listener);

		listener.localization = this._manager.interpolate(this.value);
	}

	removeListener(listener: ILocalizable): void
	{
		if (this._listeners)
		{
			this._listeners.delete(listener);
		}
	}

	registerParameter(name: string, value: string, id: string = '%'): void
	{
		if (!this._parameters)
		{
			this._parameters = new Map();
		}

		this._parameters.set(name, {
			id: id,
			value: value,
		});

		this.updateListeners();
	}

	updateListeners(): void
	{
		const interpolatedValue = this._manager.interpolate(this.value);

		if (this._listeners)
		{
			for (const listener of this._listeners)
			{
				listener.localization = interpolatedValue;
			}
		}
	}

	private fillParameterValues(): string
	{
		let result = this._value;

		if (result === null)
		{
			return '';
		}

		// Fill in registered parameters
		if (this._parameters)
		{
			for (const [paramName, paramData] of this._parameters)
			{
				// Simple parameter replacement: %param%
				const pattern = paramData.id + paramName + paramData.id;
				const regex = new RegExp(this.escapeRegex(pattern), 'gim');
				result = result.replace(regex, paramData.value);

				// Check for plural forms: %{param|zero|one|many}
				const lowerResult = result.toLowerCase();
				const pluralPattern = paramData.id + '{' + paramName;

				if (lowerResult.indexOf(pluralPattern) >= 0)
				{
					let pluralIndex: number;
					const numValue = parseInt(paramData.value, 10);

					switch (numValue)
					{
						case 0:
							pluralIndex = 1;
							break;
						case 1:
							pluralIndex = 2;
							break;
						default:
							pluralIndex = 3;
					}

					// Match %{param|zero|one|many}
					const pluralRegex = new RegExp(
						this.escapeRegex(paramData.id) + '\\{' + paramName + '\\|([^|]*)\\|([^|]*)\\|([^}]*)\\}',
						'gim'
					);
					const doubleIdRegex = new RegExp(this.escapeRegex(paramData.id + paramData.id), 'gim');

					result = result.replace(pluralRegex, '$' + pluralIndex);
					result = result.replace(doubleIdRegex, paramData.value);
				}
			}
		}

		// Handle %%%key%%% references to sub-localizations
		const subKeyRegex = /%%%([A-Za-z0-9_])+%%%/g;
		const matches = result.match(subKeyRegex);

		if (matches !== null)
		{
			for (let i = matches.length - 1; i >= 0; i--)
			{
				const match = matches[i];
				const subKey = match.substring(3, match.length - 3);
				const fullKey = this._key + '.' + subKey;
				const subValue = this._manager.getLocalization(fullKey, subKey);
				result = result.replace(match, subValue);
			}
		}

		return result;
	}

	private escapeRegex(str: string): string
	{
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
}
