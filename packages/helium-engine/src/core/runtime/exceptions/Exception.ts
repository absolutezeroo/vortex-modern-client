/**
 * Base Exception class with cause chaining.
 *
 * @see sources/win63_version/core/runtime/exceptions/Exception.as
 */
export class Exception extends Error
{
	constructor(message: string, id: number = 0, cause: Error | null = null)
	{
		super(message);
		this.name = this.constructor.name;
		this._cause = cause;
	}

	private _cause: Error | null;

	/**
	 * The underlying cause of this exception
	 */
	get cause(): Error | null
	{
		return this._cause;
	}

	/**
	 * Build a chained stack trace string from an error chain.
	 */
	static getChainedStackTrace(error: Error | null): string
	{
		let out: string | null = null;

		while (error !== null)
		{
			const stacktrace = error.stack ?? null;

			if (stacktrace !== null)
			{
				if (out === null)
				{
					out = stacktrace;
				}
				else
				{
					out += '\ncaused by ';
					out += stacktrace;
				}
			}

			if (error instanceof Exception)
			{
				error = error.cause;
			}
			else
			{
				error = null;
			}
		}

		return out ?? '';
	}

	override toString(): string
	{
		let msg = `${this.constructor.name}: ${this.message}`;

		if (this._cause !== null)
		{
			msg += ', caused by ';
			msg += this._cause.toString();
		}

		return msg;
	}
}
