import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Report client performance metrics to the server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/tracking/PerformanceLogMessageComposer.as
 */
export class PerformanceLogMessageComposer extends MessageComposer<unknown[]>
{
	private _data: unknown[];

	constructor(
		uptimeSeconds: number,
		userAgent: string,
		flashVersion: string,
		os: string,
		param5: string,
		isDebugger: boolean,
		memoryKB: number,
		param8: number,
		gcCount: number,
		averageUpdateInterval: number,
		slowUpdateCount: number
	)
	{
		super();
		this._data = [
			uptimeSeconds,
			userAgent,
			flashVersion,
			os,
			param5,
			isDebugger,
			memoryKB,
			param8,
			gcCount,
			averageUpdateInterval,
			slowUpdateCount,
		];
	}

	getMessageArray()
	{
		return this._data;
	}
}
