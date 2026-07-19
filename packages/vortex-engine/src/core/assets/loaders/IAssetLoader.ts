import type {IDisposable} from '@core/runtime';
import type {EventEmitter} from 'eventemitter3';

/**
 * IAssetLoader Interface
 *
 * Based on AS3: com.sulake.core.assets.loaders.class_36
 *
 * Interface for file loaders.
 */
export interface IAssetLoader extends IDisposable
{
    readonly events: EventEmitter;
    readonly url: string;
    readonly content: unknown;
    readonly bytes: ArrayBuffer | null;
    readonly mimeType: string;
    readonly bytesLoaded: number;
    readonly bytesTotal: number;
    readonly errorCode: number;
    readonly id: number;

    load(url: string): void;
}

/**
 * Error codes for asset loaders
 */
export const AssetLoaderErrorCodes = {
    NONE: 0,
    IO_ERROR: 1,
    SECURITY_ERROR: 2,
} as const;
