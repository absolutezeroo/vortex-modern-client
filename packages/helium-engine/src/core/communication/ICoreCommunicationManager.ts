import type {IDisposable} from '@core/runtime/IDisposable';
import type {IConnection} from './connection/IConnection';
import type {IConnectionCallback} from './connection/IConnectionCallback';

/**
 * Interface for the core communication manager
 *
 * Based on AS3: com.sulake.core.communication.CoreCommunicationManager
 */
export interface ICoreCommunicationManager extends IDisposable
{
	/**
	 * Get all active connections
	 */
	readonly connections: IConnection[];

	/**
	 * Create a new connection
	 * @param callback Optional callback for connection events
	 * @returns The created connection
	 */
	createConnection(callback?: IConnectionCallback): IConnection;

	/**
	 * Update all connections (process received data)
	 * Call this from the main update loop
	 */
	update(deltaTime: number): void;
}
