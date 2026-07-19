import type {ICoreErrorReporter} from './ICoreErrorReporter';
import type {ICoreErrorLogger} from './ICoreErrorLogger';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('CoreErrorReporter');

/**
 * Default error reporter implementation.
 *
 * Logs errors via the Logger system. Equivalent to AS3 class_516.
 *
 * @see sources/win63_version/core/runtime/class_516.as
 */
export class DefaultErrorReporter implements ICoreErrorReporter
{
    private _errorLogger: ICoreErrorLogger | null = null;

    get errorLogger(): ICoreErrorLogger | null
    {
        return this._errorLogger;
    }

    set errorLogger(value: ICoreErrorLogger | null)
    {
        this._errorLogger = value;
    }

    logError(message: string, critical: boolean, _category: number = -1, error: Error | null = null): void
    {
        log.error(message, error?.stack ?? '');

        if(this._errorLogger)
        {
            if(critical)
            {
                this._errorLogger.logCrash(message);
            }
            else
            {
                this._errorLogger.logError(message);
            }
        }
    }
}
