import type {NavigatorSearchResultSet} from '../../communication/messages/incoming/newnavigator';
import {NavigatorCacheEntry} from './NavigatorCacheEntry';

/**
 * Cache for navigator search results with automatic expiration
 *
 */
export class NavigatorCache
{
	private static readonly EXPIRATION_TIME: number = 4000;

	private _entriesByKey: Map<string, NavigatorCacheEntry> = new Map();

	constructor()
	{
	}

	put(key: string, payload: NavigatorSearchResultSet): void
	{
		this.removeExpiredEntries();
		const currentTime = performance.now();
		this._entriesByKey.set(key, new NavigatorCacheEntry(key, payload, currentTime, this.expiresAt(currentTime)));
	}

	getEntry(key: string): NavigatorSearchResultSet | null
	{
		const entry = this._entriesByKey.get(key);

		if (entry)
		{
			if (entry.hasExpired(performance.now()))
			{
				this._entriesByKey.delete(key);
				return null;
			}
			return entry.payload;
		}

		return null;
	}

	removeEntry(key: string): void
	{
		this._entriesByKey.delete(key);
	}

	private removeExpiredEntries(): void
	{
		const currentTime = performance.now();

		for (const [key, entry] of this._entriesByKey)
		{
			if (entry === null || entry.hasExpired(currentTime))
			{
				this._entriesByKey.delete(key);
			}
		}
	}

	private expiresAt(currentTime: number): number
	{
		return currentTime + NavigatorCache.EXPIRATION_TIME;
	}
}
