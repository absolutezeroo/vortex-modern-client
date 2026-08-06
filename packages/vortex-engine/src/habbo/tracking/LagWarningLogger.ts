import {
    LagWarningReportMessageComposer
} from '@habbo/communication/messages/outgoing/tracking/LagWarningReportMessageComposer';
import type {HabboTracking} from './HabboTracking';

/**
 * Detects and aggregates chat lag events, reporting them to the server.
 *
 * When chat lag is detected, events are accumulated and periodically
 * reported via LagWarningReportMessageComposer based on a configurable
 * interval.
 *
 * @see source_as_win63/habbo/tracking/LagWarningLogger.as
 */
export class LagWarningLogger
{
    private _lastReportTime: number = 0;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/tracking/LagWarningLogger.as::_warningCount
    private _warningCount: number = 0;
    // AS3: .../src/com/sulake/habbo/tracking/LagWarningLogger.as::_habboTracking
    private _habboTracking: HabboTracking;

    constructor(tracking: HabboTracking)
    {
        this._habboTracking = tracking;
    }

    /**
	 * Whether lag warning logging is enabled
	 */
    // AS3: .../src/com/sulake/habbo/tracking/LagWarningLogger.as::get enabled()
    private get enabled(): boolean
    {
        return this._habboTracking.getBoolean('lagWarningLog.enabled');
    }

    /**
	 * The interval in milliseconds between warning reports
	 */
    // AS3: .../src/com/sulake/habbo/tracking/LagWarningLogger.as::get warningInterval()
    private get warningInterval(): number
    {
        return this._habboTracking.getInteger('lagWarningLog.interval.seconds', 10) * 1000;
    }

    /**
	 * Called when a chat lag event is detected
	 *
	 * @param currentTime The current time, used to throttle the warning report
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/tracking/LagWarningLogger.as::chatLagDetected()
    // The argument is the current time, not the lag: it feeds reportWarningsAsNeeded()'s throttle.
    chatLagDetected(currentTime: number): void
    {
        if(!this.enabled || this.warningInterval <= 0)
        {
            return;
        }

        this._warningCount++;
        this.reportWarningsAsNeeded(currentTime);
    }

    /**
	 * Called each frame to check if accumulated warnings should be reported
	 *
	 * @param currentTime Current time in milliseconds
	 */
    // AS3: .../src/com/sulake/habbo/tracking/LagWarningLogger.as::update()
    update(currentTime: number): void
    {
        this.reportWarningsAsNeeded(currentTime);
    }

    /**
	 * Report accumulated warnings if the interval has elapsed
	 */
    // AS3: .../src/com/sulake/habbo/tracking/LagWarningLogger.as::reportWarningsAsNeeded()
    private reportWarningsAsNeeded(currentTime: number): void
    {
        if(this._warningCount === 0)
        {
            return;
        }

        if(this._lastReportTime === 0 || currentTime - this._lastReportTime > this.warningInterval)
        {
            const composer = new LagWarningReportMessageComposer(this._warningCount);
            this._habboTracking.send(composer);
            this._lastReportTime = currentTime;
            this._warningCount = 0;
        }
    }
}
