import type {ICoreErrorLogger} from './ICoreErrorLogger';

/**
 * Core Error Reporter Interface
 *
 * Reports errors from the core runtime to an optional external logger.
 *
 * @see sources/win63_version/core/runtime/ICoreErrorReporter.as
 */
export interface ICoreErrorReporter
{
	/**
	 * Set the external error logger
	 */
	errorLogger: ICoreErrorLogger | null;

	/**
	 * Log an error
	 *
	 * @param message - Error message
	 * @param critical - Whether this error is fatal
	 * @param category - Error category code (see Core error constants)
	 * @param error - The underlying Error object, if any
	 */
	logError(message: string, critical: boolean, category?: number, error?: Error | null): void;
}
