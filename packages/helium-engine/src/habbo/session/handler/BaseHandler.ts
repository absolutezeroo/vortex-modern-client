import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomHandlerListener} from '../IRoomHandlerListener';

/**
 * Base handler class
 *
 * Based on AS3: com.sulake.habbo.session.handler.BaseHandler
 *
 * Base class for all session handlers. Handlers listen to messages
 * and communicate state changes back to the RoomSessionManager via IRoomHandlerListener.
 */
export class BaseHandler
{
	/**
	 * The current room ID being handled.
	 * Updated by RoomSessionManager.updateHandlers()
	 */
	public roomId: number = 0;

	constructor(connection: IConnection | null, listener: IRoomHandlerListener)
	{
		this._connection = connection;
		this._listener = listener;
	}

	private _connection: IConnection | null;

	get connection(): IConnection | null
	{
		return this._connection;
	}

	private _listener: IRoomHandlerListener;

	get listener(): IRoomHandlerListener
	{
		return this._listener;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	dispose(): void
	{
		if(this._disposed) return;

		this._disposed = true;

		this._connection = null;
		// @ts-expect-error - Nullifying for disposal
		this._listener = null;
	}
}
