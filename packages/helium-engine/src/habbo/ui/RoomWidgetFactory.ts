/**
 * RoomWidgetFactory
 *
 * @see sources/source_as_win63/habbo/ui/widget/RoomWidgetFactory.as
 *
 * Stub factory that returns null for all widget types.
 * Full widget creation will be implemented when individual widgets are ported.
 */
import {Logger} from '@core/utils/Logger';
import type {IRoomWidgetFactory} from './IRoomWidgetFactory';
import type {IRoomWidgetHandler} from './IRoomWidgetHandler';
import type {RoomUI} from './RoomUI';

const log = Logger.getLogger('RoomWidgetFactory');

export class RoomWidgetFactory implements IRoomWidgetFactory
{
	private _roomUI: RoomUI;
	private _disposed: boolean = false;

	constructor(roomUI: RoomUI)
	{
		this._roomUI = roomUI;
	}

	public createWidget(type: string, handler: IRoomWidgetHandler): unknown | null
	{
		log.debug(`Widget creation requested: ${type} (stub — returning null)`);

		return null;
	}

	public get disposed(): boolean
	{
		return this._disposed;
	}

	public dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;
		this._roomUI = null!;
	}
}
