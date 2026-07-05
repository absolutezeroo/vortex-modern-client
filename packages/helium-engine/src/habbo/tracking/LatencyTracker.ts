import {Logger} from '@core/utils/Logger';
import type {
    LatencyPingResponseMessageParser
} from '@habbo/communication/messages/parser/tracking/LatencyPingResponseMessageParser';
import {
    LatencyPingRequestMessageComposer
} from '@habbo/communication/messages/outgoing/tracking/LatencyPingRequestMessageComposer';
import {
    LatencyPingReportMessageComposer
} from '@habbo/communication/messages/outgoing/tracking/LatencyPingReportMessageComposer';
import type {HabboTracking} from './HabboTracking';

const log = Logger.getLogger('LatencyTracker');

/**
 * Tracks round-trip latency to the server.
 *
 * Sends periodic ping requests and measures the time until the response
 * is received. After collecting enough samples, it calculates an average
 * and reports it to the server.
 *
 * @see source_as_win63/habbo/tracking/LatencyTracker.as
 */
export class LatencyTracker
{
    private _isTracking: boolean = false;
    private _currentTestId: number = 0;
    private _interval: number = 0;
    private _reportIndex: number = 0;
    private _reportDelta: number = 0;
    private _lastTestTime: number = 0;
    private _lastAverageLatency: number = 0;
    private _latencies: number[] = [];
    private _latencyMap: Map<number, number> = new Map();
    private _habboTracking: HabboTracking | null;

    constructor(tracking: HabboTracking)
    {
        this._habboTracking = tracking;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._habboTracking === null;
    }

    /**
	 * Initialize the latency tracker with configuration values
	 */
    init(): void
    {
        if(!this._habboTracking) return;

        this._interval = this._habboTracking.getInteger('latencytest.interval', 20000);
        this._reportIndex = this._habboTracking.getInteger('latencytest.report.index', 100);
        this._reportDelta = this._habboTracking.getInteger('latencytest.report.delta', 3);

        if(this._interval < 1)
        {
            return;
        }

        this._latencyMap = new Map();
        this._latencies.length = 0;
        this._isTracking = true;
    }

    /**
	 * Called each frame to check if a new ping test should be sent
	 *
	 * @param deltaTime Time since last update in milliseconds
	 * @param currentTime Current time in milliseconds
	 */
    update(deltaTime: number, currentTime: number): void
    {
        if(!this._isTracking)
        {
            return;
        }

        if(currentTime - this._lastTestTime > this._interval)
        {
            this.testLatency();
        }
    }

    /**
	 * Handle a ping response from the server
	 *
	 * @param parser The parsed ping response data
	 */
    onPingResponse(parser: LatencyPingResponseMessageParser): void
    {
        if(!this._latencyMap || !this._latencies)
        {
            return;
        }

        const requestTime = this._latencyMap.get(parser.requestId);

        if(requestTime === undefined)
        {
            return;
        }

        this._latencyMap.delete(parser.requestId);

        const latency = performance.now() - requestTime;
        this._latencies.push(latency);

        if(this._latencies.length === this._reportIndex && this._reportIndex > 0)
        {
            this.calculateAndReportLatencies();
        }
    }

    /**
	 * Dispose of the latency tracker
	 */
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._isTracking = false;

        this._latencyMap.clear();
        this._latencies.length = 0;
        this._habboTracking = null;
        this._disposed = true;
    }

    /**
	 * Send a latency ping request
	 */
    private testLatency(): void
    {
        this._lastTestTime = performance.now();
        this._latencyMap.set(this._currentTestId, this._lastTestTime);

        if(this._habboTracking)
        {
            this._habboTracking.send(new LatencyPingRequestMessageComposer(this._currentTestId));
        }

        this._currentTestId++;
    }

    /**
	 * Calculate average latency from collected samples and report to server
	 */
    private calculateAndReportLatencies(): void
    {
        let totalLatency = 0;

        for(const latency of this._latencies)
        {
            totalLatency += latency;
        }

        const averageLatency = Math.floor(totalLatency / this._latencies.length);

        // Second pass: exclude outliers (> 2x average)
        totalLatency = 0;
        let validLatencies = 0;

        for(const latency of this._latencies)
        {
            if(latency < averageLatency * 2)
            {
                totalLatency += latency;
                validLatencies++;
            }
        }

        if(validLatencies === 0)
        {
            this._latencies.length = 0;
            return;
        }

        const adjustedAverage = Math.floor(totalLatency / validLatencies);

        if(Math.abs(averageLatency - this._lastAverageLatency) > this._reportDelta || this._lastAverageLatency === 0)
        {
            this._lastAverageLatency = averageLatency;

            const report = new LatencyPingReportMessageComposer(
                averageLatency,
                adjustedAverage,
                this._latencies.length
            );

            if(this._habboTracking)
            {
                this._habboTracking.send(report);
            }
        }

        this._latencies.length = 0;
    }
}
