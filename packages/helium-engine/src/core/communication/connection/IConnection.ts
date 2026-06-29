import type {IDisposable} from '@core/runtime/IDisposable';
import type {IEncryption} from '../encryption/IEncryption';
import type {IMessageComposer} from '../messages/IMessageComposer';
import type {IMessageEvent} from '../messages/IMessageEvent';
import type {IMessageConfiguration} from '../messages/IMessageConfiguration';

/**
 * Interface for network connections
 *
 * Based on AS3: com.sulake.core.communication.connection.IConnection
 */
export interface IConnection extends IDisposable
{
	/**
	 * Whether the connection is currently established
	 */
	readonly connected: boolean;
	/**
	 * Connection timeout in milliseconds
	 */
	timeout: number;

	/**
	 * Initialize and connect to host
	 * @param host Server hostname or IP
	 * @param port Server port (0 for WebSocket default)
	 * @param tcpNoDelay AS3 socket TCP_NODELAY flag; ignored by WebSocket transport
	 * @returns True if connection attempt started
	 */
	init(host: string, port?: number, tcpNoDelay?: boolean): boolean;

	/**
	 * Recreate the underlying socket transport.
	 *
	 * AS3: IConnection.createSocket()
	 */
	createSocket(): void;

	/**
	 * Add a legacy connection event listener.
	 *
	 * AS3: IConnection.addListener()
	 */
	addListener(type: string, listener: (...args: unknown[]) => void): void;

	/**
	 * Send an encrypted message
	 * @param composer The message to send
	 * @returns True if message was sent
	 */
	send(composer: IMessageComposer<unknown[]>): boolean;

	/**
	 * Send an unencrypted message
	 * @param composer The message to send
	 * @returns True if message was sent
	 */
	sendUnencrypted(composer: IMessageComposer<unknown[]>): boolean;

	/**
	 * Set encryption for both directions
	 * @param clientToServer Encryption for outgoing messages
	 * @param serverToClient Encryption for incoming messages
	 */
	setEncryption(clientToServer: IEncryption, serverToClient: IEncryption): void;

	/**
	 * Mark the connection as authenticated.
	 *
	 * AS3: IConnection.isAuthenticated()
	 */
	isAuthenticated(): void;

	/**
	 * Mark the connection as configured and flush queued messages.
	 *
	 * AS3: IConnection.isConfigured()
	 */
	isConfigured(): void;

	/**
	 * Get the server-to-client encryption
	 */
	getServerToClientEncryption(): IEncryption | null;

	/**
	 * Get the client-to-server encryption
	 */
	getClientToServerEncryption(): IEncryption | null;

	/**
	 * Register message classes from configuration
	 */
	registerMessageClasses(config: IMessageConfiguration): void;

	/**
	 * Add a message event handler
	 */
	addMessageEvent(event: IMessageEvent): void;

	/**
	 * Remove a message event handler
	 */
	removeMessageEvent(event: IMessageEvent): void;

	/**
	 * Process received data (call from update loop)
	 */
	processReceivedData(): void;

	/**
	 * Close the connection
	 */
	close(): void;

	/**
	 * Subscribe to messageEvent
	 */
	on(event: 'messageEvent', listener: (event: IMessageEvent) => void): this;

	/**
	 * Unsubscribe from messageEvent
	 */
	off(event: 'messageEvent', listener: (event: IMessageEvent) => void): this;
}
