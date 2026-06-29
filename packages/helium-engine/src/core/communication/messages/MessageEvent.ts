import type {IConnection} from '../connection/IConnection';
import type {IMessageEvent, MessageEventCallback, ParserClass} from './IMessageEvent';
import type {IMessageParser} from './IMessageParser';

/**
 * Base implementation of message event
 * Extend this class to create handlers for specific message types
 */
export class MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback, parserClass: ParserClass)
	{
		this._callback = callback;
		this._parserClass = parserClass;
	}

	protected _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	protected _callback: MessageEventCallback;

	get callback(): MessageEventCallback
	{
		return this._callback;
	}

	protected _connection: IConnection | null = null;

	get connection(): IConnection | null
	{
		return this._connection;
	}

	set connection(value: IConnection | null)
	{
		this._connection = value;
	}

	protected _parserClass: ParserClass;

	get parserClass(): ParserClass
	{
		return this._parserClass;
	}

	protected _parser: IMessageParser | null = null;

	get parser(): IMessageParser | null
	{
		return this._parser;
	}

	set parser(value: IMessageParser | null)
	{
		this._parser = value;
	}

	/**
	 * Get the parser cast to a specific type
	 */
	getParser<T extends IMessageParser>(): T
	{
		return this._parser as T;
	}

	dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		this._callback = null!;
		this._parserClass = null!;
		this._connection = null;
		this._parser = null;
	}
}
