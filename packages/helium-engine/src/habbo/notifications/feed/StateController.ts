import {FeedVisibilityEnum} from '../FeedVisibilityEnum';

/**
 * Visibility state machine for the notification feed.
 * Manages transitions between hidden, minimized, and maximized states.
 *
 * @see source_as_win63/habbo/notifications/feed/StateController.as
 */
export class StateController
{
    private _enabled: boolean = false;
    private _gameMode: boolean = false;
    private _currentState: number = FeedVisibilityEnum.VIEW_STATE_HIDDEN;
    private _requestedState: number = FeedVisibilityEnum.VIEW_STATE_MINIMIZED;

    /**
	 * Set the enabled state of the feed.
	 * Returns the resulting visibility state.
	 *
	 * @param enabled Whether the feed should be enabled
	 * @returns The resulting visibility state
	 */
    setEnabled(enabled: boolean): number
    {
        this._enabled = enabled;

        if(!this.isActive())
        {
            return this.requestState(FeedVisibilityEnum.VIEW_STATE_HIDDEN);
        }

        return this.setVisible();
    }

    /**
	 * Set the game mode state of the feed.
	 * When in game mode, the feed is hidden.
	 *
	 * @param gameMode Whether the client is in game mode
	 * @returns The resulting visibility state
	 */
    setGameMode(gameMode: boolean): number
    {
        this._gameMode = gameMode;

        if(!this.isActive())
        {
            return this.requestState(FeedVisibilityEnum.VIEW_STATE_HIDDEN);
        }

        return this.setVisible();
    }

    /**
	 * Get the current visibility state
	 */
    currentState(): number
    {
        return this._currentState;
    }

    /**
	 * Request a specific visibility state.
	 * If inactive, the request is stored for later.
	 *
	 * @param state The desired visibility state
	 * @returns The resulting visibility state
	 */
    requestState(state: number): number
    {
        if(!this.isActive())
        {
            this._requestedState = state;
            return this._currentState;
        }

        this._currentState = state;
        this._requestedState = state;
        return this._currentState;
    }

    /**
	 * Check if the feed is currently active (enabled and not in game mode)
	 */
    private isActive(): boolean
    {
        return this._enabled && !this._gameMode;
    }

    /**
	 * Restore visibility from the requested state.
	 * If the requested state was hidden, defaults to minimized.
	 */
    private setVisible(): number
    {
        let state = this._requestedState;

        if(state === FeedVisibilityEnum.VIEW_STATE_HIDDEN)
        {
            state = FeedVisibilityEnum.VIEW_STATE_MINIMIZED;
        }

        this._currentState = state;
        this._requestedState = state;
        return state;
    }
}
