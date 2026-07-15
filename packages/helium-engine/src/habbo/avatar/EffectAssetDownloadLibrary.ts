import EventEmitter from 'eventemitter3';
import type {IAssetLibrary, NitroAsset, AssetLoaderEvent} from '@core/assets';
import { AssetLoaderEventType} from '@core/assets';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('EffectAssetDownloadLibrary');

/**
 * Manages downloading a single avatar effect asset library.
 *
 * Similar to AvatarAssetDownloadLibrary but for effect animations.
 * Also extracts and stores animation data from the loaded resource.
 *
 * In AS3, this extends EventDispatcherWrapper and implements INamed.
 * The animation data is extracted from the loaded SWF resource's animation property.
 *
 * @see sources/win63_version/habbo/avatar/EffectAssetDownloadLibrary.as
 * @see sources/flash_version/com/sulake/habbo/avatar/EffectAssetDownloadLibrary.as
 */
export class EffectAssetDownloadLibrary extends EventEmitter
{
    public static readonly COMPLETE: string = 'EADL_COMPLETE';

    private static readonly STATE_IDLE: number = 0;
    private static readonly STATE_DOWNLOADING: number = 1;
    private static readonly STATE_READY: number = 2;
    private _revision: string;
    private _downloadUrl: string;
    private _assetLibrary: IAssetLibrary;
    private _state: number;

    constructor(name: string, revision: string, downloadUrl: string, assetLibrary: IAssetLibrary)
    {
        super();

        this._name = name;
        this._revision = revision;
        this._downloadUrl = downloadUrl;
        this._assetLibrary = assetLibrary;
        this._state = EffectAssetDownloadLibrary.STATE_IDLE;
        this._animation = null;
    }

    private _name: string;

    /**
	 * The name of this effect library.
	 */
    public get name(): string
    {
        return this._name;
    }

    private _animation: any | null;

    /**
	 * The animation data extracted from the loaded effect library.
	 *
	 * In AS3, this is XML data extracted from the loaded SWF resource's animation property.
	 * In our port, this is JSON animation data from the .nitro bundle.
	 */
    public get animation(): any | null
    {
        return this._animation;
    }

    /**
	 * Whether the library has finished downloading.
	 */
    public get isReady(): boolean
    {
        return this._state === EffectAssetDownloadLibrary.STATE_READY;
    }

    /**
	 * Begins downloading this effect library's assets.
	 *
	 * In AS3 this creates a URLRequest and loads via LibraryLoader.
	 * On completion, extracts animation data from the resource and emits COMPLETE.
	 */
    public startDownloading(): void
    {
        if(this._state !== EffectAssetDownloadLibrary.STATE_IDLE) return;

        this._state = EffectAssetDownloadLibrary.STATE_DOWNLOADING;

        // Check if already loaded in asset library
        if(this._assetLibrary.hasAsset(this._name))
        {
            this.extractAnimation();
            this._state = EffectAssetDownloadLibrary.STATE_READY;
            this.emit(EffectAssetDownloadLibrary.COMPLETE, this);

            return;
        }

        const url = this._downloadUrl
            .replace('%libname%', this._name)
            .replace('%revision%', this._revision);

        if(!url || url === this._downloadUrl)
        {
            log.warn(`No valid download URL for effect: ${this._name}`);
            this._state = EffectAssetDownloadLibrary.STATE_READY;
            this.emit(EffectAssetDownloadLibrary.COMPLETE, this);

            return;
        }

        log.debug(`Downloading effect: ${this._name} from ${url}`);

        try
        {
            const loader = this._assetLibrary.loadAssetFromFile(this._name, url, 'application/x-nitro-bundle');

            if(!loader)
            {
                log.warn(`Failed to start loading effect: ${this._name}`);
                this._state = EffectAssetDownloadLibrary.STATE_READY;
                this.emit(EffectAssetDownloadLibrary.COMPLETE, this);

                return;
            }

            loader.events.on('event', (event: AssetLoaderEvent) =>
            {
                if(event.type === AssetLoaderEventType.COMPLETE)
                {
                    log.debug(`Loaded effect: ${this._name}`);
                    this.extractAnimation();
                    this._state = EffectAssetDownloadLibrary.STATE_READY;
                    this.emit(EffectAssetDownloadLibrary.COMPLETE, this);
                }
                else if(event.type === AssetLoaderEventType.ERROR)
                {
                    log.warn(`Failed to load effect: ${this._name}`);
                    this._state = EffectAssetDownloadLibrary.STATE_READY;
                    this.emit(EffectAssetDownloadLibrary.COMPLETE, this);
                }
            });
        }
        catch (error)
        {
            log.warn(`Error loading effect ${this._name}: ${error}`);
            this._state = EffectAssetDownloadLibrary.STATE_READY;
            this.emit(EffectAssetDownloadLibrary.COMPLETE, this);
        }
    }

    public toString(): string
    {
        return this._name + (this.isReady ? '[x]' : '[ ]');
    }

    /**
	 * Extracts animation data from the loaded .nitro bundle's JSON.
	 *
	 * In AS3, this is extracted from the loaded SWF resource.
	 */
    private extractAnimation(): void
    {
        const asset = this._assetLibrary.getAssetByName(this._name) as NitroAsset | null;

        if(asset)
        {
            const jsonData = (asset as any).jsonData;

            if(jsonData?.animations)
            {
                this._animation = jsonData.animations;
            }
        }
    }
}
