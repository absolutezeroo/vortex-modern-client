import {Logger} from '@core/utils/Logger';
import {
    PerformanceLogMessageComposer
} from '@habbo/communication/messages/outgoing/tracking/PerformanceLogMessageComposer';
import type {HabboTracking} from './HabboTracking';

const log = Logger.getLogger('PerformanceTracker');

/**
 * Tracks client performance (frame intervals, memory usage, slow updates)
 * and periodically reports metrics to the server via PerformanceLogMessageComposer.
 *
 * Adapted from Flash to web:
 * - System.totalMemory → performance.memory?.usedJSHeapSize (Chrome only)
 * - Capabilities.version/os → navigator.userAgent / navigator.platform
 * - GC monitoring → skipped (no web equivalent)
 *
 * @see source_as_win63/habbo/tracking/PerformanceTracker.as
 */
export class PerformanceTracker
{
    private _updateCount: number = 0;
    private _averageInterval: number = 0;
    private _userAgent: string = '';
    private _slowUpdateCount: number = 0;
    private _timer: number = 0;
    private _reportCount: number = 0;
    private _lastAverageInterval: number = 0;
    private _habboTracking: HabboTracking;

    constructor(tracking: HabboTracking)
    {
        this._habboTracking = tracking;

        try
        {
            this._userAgent = navigator.userAgent ?? 'unknown';
        }
        catch
        {
            this._userAgent = 'unknown';
        }

        this._timer = performance.now();
    }

    /**
	 * Get the current average update interval
	 */
    get averageUpdateInterval(): number
    {
        return this._averageInterval;
    }

    private get slowUpdateLimit(): number
    {
        return this._habboTracking.getInteger('performancetest.slowupdatelimit', 1000);
    }

    private get reportInterval(): number
    {
        return this._habboTracking.getInteger('performancetest.interval', 60);
    }

    private get reportLimit(): number
    {
        return this._habboTracking.getInteger('performancetest.reportlimit', 10);
    }

    private get meanDevianceLimit(): number
    {
        return this._habboTracking.propertyExists('performancetest.distribution.deviancelimit.percent')
            ? Number(this._habboTracking.getProperty('performancetest.distribution.deviancelimit.percent'))
            : 10;
    }

    private get useDistribution(): boolean
    {
        return this._habboTracking.getBoolean('performancetest.distribution.enabled');
    }

    /**
	 * Calculate difference between two values as a percentage.
	 */
    private static differenceInPercents(a: number, b: number): number
    {
        if(a === b)
        {
            return 0;
        }

        let larger = a;
        let smaller = b;

        if(b > a)
        {
            larger = b;
            smaller = a;
        }

        return 100 * (1 - smaller / larger);
    }

    /**
	 * Called each frame to update the running average and report periodically.
	 *
	 * @param deltaTime Time since last update in milliseconds
	 * @param currentTime Current time in milliseconds
	 */
    update(deltaTime: number, currentTime: number): void
    {
        if(deltaTime > this.slowUpdateLimit)
        {
            this._slowUpdateCount++;
        }
        else
        {
            this._updateCount++;

            if(this._updateCount <= 1)
            {
                this._averageInterval = deltaTime;
            }
            else
            {
                const n = this._updateCount;
                this._averageInterval = this._averageInterval * (n - 1) / n + deltaTime / n;
            }
        }

        if(currentTime - this._timer > this.reportInterval * 1000 && this._reportCount < this.reportLimit)
        {
            log.debug(`*** Performance tracker: average frame rate ${1000 / this._averageInterval}/s`);

            let shouldReport = true;

            if(this.useDistribution && this._reportCount > 0)
            {
                const deviance = PerformanceTracker.differenceInPercents(this._lastAverageInterval, this._averageInterval);

                if(deviance < this.meanDevianceLimit)
                {
                    shouldReport = false;
                }
            }

            this._timer = currentTime;

            if(shouldReport)
            {
                this._lastAverageInterval = this._averageInterval;
                this.sendReport(currentTime);
                this._reportCount++;
            }
        }
    }

    /**
	 * Send a performance report to the server.
	 */
    private sendReport(currentTime: number): void
    {
        const uptimeSeconds = Math.floor(currentTime / 1000);
        const memoryKB = this.getMemoryKB();

        this._habboTracking.send(new PerformanceLogMessageComposer(
            uptimeSeconds,
            this._userAgent,
            'web',
            navigator.platform ?? 'unknown',
            '',
            false,
            memoryKB,
            -1,
            0,
            this._averageInterval,
            this._slowUpdateCount
        ));

        this._averageInterval = 0;
        this._updateCount = 0;
        this._slowUpdateCount = 0;
    }

    /**
	 * Get current memory usage in KB (Chrome only, returns -1 otherwise).
	 */
    private getMemoryKB(): number
    {
        const perf = performance as any;

        if(perf.memory?.usedJSHeapSize)
        {
            return Math.floor(perf.memory.usedJSHeapSize / 1024);
        }

        return -1;
    }
}
