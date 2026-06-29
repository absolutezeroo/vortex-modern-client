import {SearchContext} from './SearchContext';

/**
 * Manages search context history for back/forward navigation
 *
 */
export class SearchContextHistoryManager
{
	private readonly _navigator: unknown | null;
	private _history: SearchContext[] = [];
	private _browsingOffset: number = -1;

	constructor(navigator: unknown | null = null)
	{
		this._navigator = navigator;
		void this._navigator;
	}

	get hasNext(): boolean
	{
		return this._browsingOffset + 1 < this._history.length;
	}

	get hasPrevious(): boolean
	{
		return this._browsingOffset > 0 && this._history.length > 0;
	}

	addSearchContextAtCurrentOffset(context: SearchContext): number
	{
		if (this._history.length > this._browsingOffset + 1)
		{
			this._history.splice(this._browsingOffset + 1, this._history.length - this._browsingOffset);
		}
		this._history.push(context);
		return ++this._browsingOffset;
	}

	getPreviousSearchContextAndGoBack(): SearchContext | null
	{
		if (this.hasPrevious)
		{
			return this._history[--this._browsingOffset];
		}
		return null;
	}

	getNextSearchContextAndMoveForward(): SearchContext | null
	{
		if (this.hasNext)
		{
			return this._history[++this._browsingOffset];
		}
		return null;
	}

	toString(): string
	{
		let result = 'history: [';
		for (let i = 0; i < this._history.length; i++)
		{
			result += this._history[i].toString();
			if (i < this._history.length - 1)
			{
				result += ',';
			}
		}
		return result + '] browsing offset: ' + this._browsingOffset;
	}
}
