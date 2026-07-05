/**
 * Core Error Logger Interface
 *
 * Receives error and crash messages for external logging (e.g., analytics, server).
 *
 * @see sources/win63_version/core/runtime/ICoreErrorLogger.as
 */
export interface ICoreErrorLogger
{
    /**
	 * Log a fatal crash
	 */
    logCrash(message: string): void;

    /**
	 * Log a non-fatal error
	 */
    logError(message: string): void;
}
