/**
 * Disposable Interface
 *
 * Based on AS3: com.sulake.core.runtime.IDisposable
 */
export interface IDisposable
{
	/**
	 * Whether this object has been disposed
	 */
	readonly disposed: boolean;

	/**
	 * Dispose of this object and release all resources
	 */
	dispose(): void;
}
