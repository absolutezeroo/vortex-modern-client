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

    // AS3: .../src/com/sulake/habbo/navigator/cache/NavigatorCacheEntry.as::_key
    private _key: string;

    // AS3: .../src/com/sulake/habbo/navigator/cache/NavigatorCacheEntry.as::get key()
    get key(): string
    {
        return this._key;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/cache/NavigatorCacheEntry.as::_payload
    private _payload: NavigatorSearchResultSet;

    // AS3: .../src/com/sulake/habbo/navigator/cache/NavigatorCacheEntry.as::get payload()
    get payload(): NavigatorSearchResultSet
    {
        return this._payload;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/navigator/cache/NavigatorCacheEntry.as::_createdAt
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

    // AS3: .../src/com/sulake/habbo/navigator/cache/NavigatorCacheEntry.as::hasExpired()
    hasExpired(currentTime: number): boolean
    {
        return currentTime >= this._expiresAt;
    }
}
