import type {HabboTracking} from './HabboTracking';

/**
 * Tracks average framerate using exponential moving average.
 *
 * Periodically reports the average framerate to the tracking system
 * via trackGoogle. The report interval and maximum number of events
 * are configurable.
 *
 * @see source_as_win63/habbo/tracking/FramerateTracker.as
 */
export class FramerateTracker
{
	private _lastReportTime: number = 0;
	private _updateCount: number = 0;
	private _averageInterval: number = 0;
	private _reportCount: number = 0;
	private _habboTracking: HabboTracking;

	constructor(tracking: HabboTracking)
	{
		this._habboTracking = tracking;
	}

	/**
	 * Get the current average framerate
	 */
	get frameRate(): number
	{
		return Math.round(1000 / this._averageInterval);
	}

	/**
	 * Called each frame to update the running average and report periodically
	 *
	 * @param deltaTime Time since last update in milliseconds
	 * @param currentTime Current time in milliseconds
	 */
	trackUpdate(deltaTime: number, currentTime: number): void
	{
		this._updateCount++;

		if (this._updateCount === 1)
		{
			this._averageInterval = deltaTime;
			this._lastReportTime = currentTime;
		}
		else
		{
			// Exponential moving average
			const n = this._updateCount;
			this._averageInterval = this._averageInterval * (n - 1) / n + deltaTime / n;
		}

		const reportIntervalMs = this._habboTracking.getInteger(
			'tracking.framerate.reportInterval.seconds', 300
		) * 1000;

		if (currentTime - this._lastReportTime >= reportIntervalMs)
		{
			this._updateCount = 0;

			const maxEvents = this._habboTracking.getInteger(
				'tracking.framerate.maximumEvents', 5
			);

			if (this._reportCount < maxEvents)
			{
				this._habboTracking.trackGoogle('performance', 'averageFramerate', this.frameRate);
				this._reportCount++;
				this._lastReportTime = currentTime;
			}
		}
	}
}
