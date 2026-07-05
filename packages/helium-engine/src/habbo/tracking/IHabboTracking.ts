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
	 * Track an event via Google Analytics
	 *
	 * @param category The event category
	 * @param action The event action
	 * @param label Optional numeric label
	 */
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
    logError(message: string): void;

    /**
	 * Report a detected chat lag event
	 *
	 * @param lagAmount The amount of lag detected in milliseconds
	 */
    chatLagDetected(lagAmount: number): void;

    /**
	 * Track an event log to the server via EventLogMessageComposer
	 *
	 * @param type The event type
	 * @param value The event value
	 * @param unit The event unit
	 * @param extra Optional extra string data
	 * @param roomId Optional room ID
	 */
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
    trackTalentTrackOpen(talentType: string, talentId: string): void;
}
