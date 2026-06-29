import type {HabboTracking} from './HabboTracking';

/**
 * Tracks toolbar button click events.
 *
 * Sends click events to Google Analytics tracking up to a configurable
 * maximum number of events per session.
 *
 * @see source_as_win63/habbo/tracking/ToolbarClickTracker.as
 */
export class ToolbarClickTracker
{
	private _tracking: HabboTracking;
	private _eventCount: number = 0;

	constructor(tracking: HabboTracking)
	{
		this._tracking = tracking;
	}

	/**
	 * Track a toolbar button click
	 *
	 * @param buttonName The name of the clicked toolbar button
	 */
	track(buttonName: string): void
	{
		if (!this._tracking.getBoolean('toolbar.tracking.enabled'))
		{
			return;
		}

		this._eventCount++;

		if (this._eventCount <= this._tracking.getInteger('toolbar.tracking.max.events', 100))
		{
			this._tracking.trackGoogle('toolbar', buttonName);
		}
	}
}
