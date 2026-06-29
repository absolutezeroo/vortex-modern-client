import type {NavigatorSearchResultSet} from '../../communication/messages/incoming/newnavigator';

/**
 * Cache entry for navigator search results
 *
 */
export class NavigatorCacheEntry
{
	constructor(key: string, payload: NavigatorSearchResultSet, createdAt: number, expiresAt: number)
	{
		this._key = key;
		this._payload = payload;
		this._createdAt = createdAt;
		this._expiresAt = expiresAt;
	}

	private _key: string;

	get key(): string
	{
		return this._key;
	}

	private _payload: NavigatorSearchResultSet;

	get payload(): NavigatorSearchResultSet
	{
		return this._payload;
	}

	private _createdAt: number;

	get createdAt(): number
	{
		return this._createdAt;
	}

	private _expiresAt: number;

	get expiresAt(): number
	{
		return this._expiresAt;
	}

	hasExpired(currentTime: number): boolean
	{
		return currentTime >= this._expiresAt;
	}
}
