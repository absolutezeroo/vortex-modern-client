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
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/runtime/IDisposable.as::get disposed()
    readonly disposed: boolean;

    /**
	 * Dispose of this object and release all resources
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/runtime/IDisposable.as::dispose()
    dispose(): void;
}
