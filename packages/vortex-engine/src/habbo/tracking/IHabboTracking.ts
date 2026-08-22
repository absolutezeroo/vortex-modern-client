/**
 * Interface for the Habbo tracking system.
 *
 * Provides methods for tracking user actions, performance metrics,
 * and error reporting.
 *
 * @see source_as_win63/habbo/tracking/IHabboTracking.as
 */
export interface IHabboTracking
{
    /**
	 * The last round trip measured against the server, in milliseconds.
	 *
	 * -1 when no latency tracker is running — the value `:ping` and the room-session chat event
	 * both report in that case.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/tracking/_SafeCls_72.as::get latencyPingMs()
    readonly latencyPingMs: number;

    /**
	 * Track an event via Google Analytics
	 *
	 * @param category The event category
	 * @param action The event action
	 * @param label Optional numeric label
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/tracking/IHabboTracking.as::trackGoogle()
    trackGoogle(category: string, action: string, label?: number): void;

    /**
	 * Legacy Google Analytics tracking with array of labels
	 *
	 * @param category The event category
	 * @param action The event action
	 * @param labels Optional array of label values
	 */
    legacyTrackGoogle(category: string, action: string, labels?: unknown[]): void;

    /**
	 * Log an error message
	 *
	 * @param message The error message to log
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/tracking/IHabboTracking.as::logError()
    logError(message: string): void;

    /**
	 * Report a detected chat lag event
	 *
	 * @param currentTime The current time, used to throttle the warning report
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/tracking/IHabboTracking.as::chatLagDetected()
    chatLagDetected(currentTime: number): void;

    /**
	 * Track an event log to the server via EventLogMessageComposer
	 *
	 * @param type The event type
	 * @param value The event value
	 * @param unit The event unit
	 * @param extra Optional extra string data
	 * @param roomId Optional room ID
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/tracking/IHabboTracking.as::trackEventLog()
    trackEventLog(type: string, value: string, unit: string, extra?: string, roomId?: number): void;

    /**
	 * Track an event log only once per session (subsequent calls with same key are ignored)
	 *
	 * @param type The event type
	 * @param value The event value
	 * @param unit The event unit
	 * @param extra Optional extra string data
	 * @param roomId Optional room ID
	 */
    trackEventLogOncePerSession(type: string, value: string, unit: string, extra?: string, roomId?: number): void;

    /**
	 * Track a talent track open event
	 *
	 * @param talentType The talent type
	 * @param talentId The talent identifier
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/tracking/IHabboTracking.as::trackTalentTrackOpen()
    trackTalentTrackOpen(talentType: string, talentId: string): void;
}
