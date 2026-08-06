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
    // AS3: .../src/com/sulake/habbo/tracking/ToolbarClickTracker.as::_tracking
    private _tracking: HabboTracking;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/tracking/ToolbarClickTracker.as::_eventCount
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
    // AS3: .../src/com/sulake/habbo/tracking/ToolbarClickTracker.as::track()
    track(buttonName: string): void
    {
        if(!this._tracking.getBoolean('toolbar.tracking.enabled'))
        {
            return;
        }

        this._eventCount++;

        if(this._eventCount <= this._tracking.getInteger('toolbar.tracking.max.events', 100))
        {
            this._tracking.trackGoogle('toolbar', buttonName);
        }
    }
}
