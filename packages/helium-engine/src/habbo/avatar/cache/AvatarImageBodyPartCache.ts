import type {IActiveActionData} from '../actions/IActiveActionData';
import {AvatarImageActionCache} from './AvatarImageActionCache';

/**
 * Cache layer for a single body part, mapping action IDs to AvatarImageActionCache instances.
 * Tracks the current action and direction for this body part.
 *
 * The cache key for actions uses either the overridingAction string (if present)
 * or the action id, matching the AS3 logic exactly.
 *
 * @see sources/win63_version/habbo/avatar/cache/AvatarImageBodyPartCache.as
 */
export class AvatarImageBodyPartCache
{
	private _cache: Map<string, AvatarImageActionCache>;
	private _currentAction: IActiveActionData | null;
	private _currentDirection: number;
	private _disposed: boolean;

	constructor()
	{
		this._cache = new Map();
		this._currentAction = null;
		this._currentDirection = 0;
		this._disposed = false;
	}

	/**
	 * Sets the current action for this body part cache.
	 * Updates last access time on the previous action's cache before switching.
	 *
	 * @param action - The active action data
	 * @param frameCount - The current frame count (used as access timestamp)
	 */
	public setAction(action: IActiveActionData, frameCount: number): void
	{
		if (!this._currentAction)
		{
			this._currentAction = action;
		}

		const cache = this.getActionCache(this._currentAction);

		if (cache)
		{
			cache.setLastAccessTime(frameCount);
		}

		this._currentAction = action;
	}

	/**
	 * Gets the current action for this body part.
	 */
	public getAction(): IActiveActionData | null
	{
		return this._currentAction;
	}

	/**
	 * Sets the current direction for this body part.
	 *
	 * @param direction - The avatar direction (0-7)
	 */
	public setDirection(direction: number): void
	{
		this._currentDirection = direction;
	}

	/**
	 * Gets the current direction for this body part.
	 */
	public getDirection(): number
	{
		return this._currentDirection;
	}

	/**
	 * Gets the action cache for the given action, using overridingAction or id as key.
	 * If no action is provided, uses the current action.
	 *
	 * @param action - The action to look up, or null for current action
	 * @returns The action cache, or null if not found
	 */
	public getActionCache(action: IActiveActionData | null = null): AvatarImageActionCache | null
	{
		if (!this._currentAction) return null;

		if (!action) action = this._currentAction;

		if (action.overridingAction)
		{
			return this._cache.get(action.overridingAction) || null;
		}

		return this._cache.get(action.id) || null;
	}

	/**
	 * Stores an action cache using the action's overridingAction or id as key.
	 *
	 * @param action - The action data
	 * @param cache - The action cache to store
	 */
	public updateActionCache(action: IActiveActionData, cache: AvatarImageActionCache): void
	{
		if (action.overridingAction)
		{
			this._cache.set(action.overridingAction, cache);
		}
		else
		{
			this._cache.set(action.id, cache);
		}
	}

	/**
	 * Disposes action caches that have been idle longer than the threshold.
	 * Matches AS3: if (param2 - lastAccessTime >= param1) dispose.
	 *
	 * @param maxIdleTime - Maximum idle time in ms before eviction
	 * @param currentTime - The current timestamp in ms
	 */
	public disposeActions(maxIdleTime: number, currentTime: number): void
	{
		if (!this._cache || this._disposed) return;

		const keysToRemove: string[] = [];

		for (const [key, cache] of this._cache)
		{
			if (cache)
			{
				const lastAccess = cache.getLastAccessTime();

				if ((currentTime - lastAccess) >= maxIdleTime)
				{
					cache.dispose();
					keysToRemove.push(key);
				}
			}
		}

		for (const key of keysToRemove)
		{
			this._cache.delete(key);
		}
	}

	/**
	 * Disposes all action caches and clears state.
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		if (!this._cache) return;

		this.disposeActions(0, Number.MAX_SAFE_INTEGER);

		this._cache.clear();
		this._cache = null!;
		this._currentAction = null;
		this._disposed = true;
	}
}
