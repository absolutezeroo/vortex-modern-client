import {EventEmitter} from 'eventemitter3';
import type {IDisposable} from '@core/runtime';
import type {IAssetLoader} from './loaders/IAssetLoader';

/**
 * AssetLoaderStruct
 *
 * Based on AS3: com.sulake.core.assets.AssetLoaderStruct
 *
 * Wrapper structure that associates an asset name with its loader.
 * Used to track pending asset loads and dispatch events when complete.
 */
export class AssetLoaderStruct implements IDisposable
{
    private readonly _events: EventEmitter = new EventEmitter();
    // AS3: .../src/com/sulake/core/assets/AssetLoaderStruct.as::_assetName
    private readonly _assetName: string;

    constructor(assetName: string, assetLoader: IAssetLoader)
    {
        this._assetName = assetName;
        this._assetLoader = assetLoader;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/core/assets/AssetLoaderStruct.as::_assetLoader
    private _assetLoader: IAssetLoader | null;

    /**
	 * The loader for this asset
	 */
    // AS3: .../src/com/sulake/core/assets/AssetLoaderStruct.as::get assetLoader()
    get assetLoader(): IAssetLoader | null
    {
        return this._assetLoader;
    }

    private _disposed: boolean = false;

    /**
	 * Whether this struct has been disposed
	 */
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * The name of the asset being loaded
	 */
    // AS3: .../src/com/sulake/core/assets/AssetLoaderStruct.as::get assetName()
    get assetName(): string
    {
        return this._assetName;
    }

    /**
	 * Event emitter for this struct
	 */
    get events(): EventEmitter
    {
        return this._events;
    }

    /**
	 * Dispose of this struct and its loader
	 */
    // AS3: .../src/com/sulake/core/assets/AssetLoaderStruct.as::dispose()
    dispose(): void
    {
        if(!this._disposed)
        {
            if(this._assetLoader && !this._assetLoader.disposed)
            {
                this._assetLoader.dispose();
                this._assetLoader = null;
            }

            this._events.removeAllListeners();
            this._disposed = true;
        }
    }

    /**
	 * Dispatch an event
	 */
    dispatchEvent(event: unknown): void
    {
        if(!this._disposed)
        {
            this._events.emit('event', event);
        }
    }

    /**
	 * Add an event listener
	 */
    addEventListener(type: string, callback: (...args: unknown[]) => void): void
    {
        this._events.on(type, callback);
    }

    /**
	 * Remove an event listener
	 */
    removeEventListener(type: string, callback: (...args: unknown[]) => void): void
    {
        this._events.off(type, callback);
    }
}
