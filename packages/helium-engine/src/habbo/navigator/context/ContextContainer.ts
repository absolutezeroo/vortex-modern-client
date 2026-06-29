import type {NavigatorSavedSearch} from '../../communication/messages/incoming/newnavigator';
import type {NavigatorMetaDataMessageParser} from '../../communication/messages/parser/newnavigator';

/**
 * Container for navigator contexts and saved searches
 *
 */
export class ContextContainer
{
	private readonly _navigator: unknown | null;
	private _topLevelContexts: Map<string, NavigatorSavedSearch[]> | null = null;

	constructor(navigator: unknown | null = null)
	{
		this._navigator = navigator;
		void this._navigator;
	}

	private _savedSearches: NavigatorSavedSearch[] = [];

	get savedSearches(): NavigatorSavedSearch[]
	{
		return this._savedSearches;
	}

	set savedSearches(value: NavigatorSavedSearch[])
	{
		this._savedSearches = value;
	}

	hasContextFor(searchCode: string): boolean
	{
		return this._topLevelContexts !== null && this._topLevelContexts.has(searchCode);
	}

	initialize(parser: NavigatorMetaDataMessageParser): void
	{
		this._topLevelContexts = new Map();

		for (const context of parser.topLevelContexts)
		{
			this._topLevelContexts.set(context.searchCode, context.quickLinks);
		}
	}

	getTopLevelSearches(): string[]
	{
		if (this._topLevelContexts === null)
		{
			return [];
		}

		return Array.from(this._topLevelContexts.keys());
	}

	isReady(): boolean
	{
		return this._topLevelContexts !== null;
	}
}
