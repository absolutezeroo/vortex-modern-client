import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Report latency test results to the server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/tracking/LatencyPingReportMessageComposer.as
 */
export class LatencyPingReportMessageComposer extends MessageComposer<ConstructorParameters<typeof LatencyPingReportMessageComposer>>
{
	private _data: ConstructorParameters<typeof LatencyPingReportMessageComposer>;

	constructor(averageLatency: number, adjustedAverage: number, sampleCount: number)
	{
		super();
		this._data = [averageLatency, adjustedAverage, sampleCount];
	}

	getMessageArray()
	{
		return this._data;
	}
}
