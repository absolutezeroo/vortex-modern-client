import {Logger} from '@core/utils/Logger';
import {normalizeLocalAssetUrl} from '@core/utils/urlUtils';
import type {IResourceManager} from '@core/window/IResourceManager';
import type {IAssetReceiver} from '@core/window/IAssetReceiver';
import type {IHabboWindowManager} from './IHabboWindowManager';

const log = Logger.getLogger('ResourceManager');

const LOCAL_ASSET_HTTP_ORIGIN = 'http://vortex-assets.local';
const LOCAL_ASSET_HTTPS_ORIGIN = 'https://vortex-assets.local';

/**
 * Manages asset retrieval for the window system.
 *
 * Supports two registration modes:
 * 1. `registerAsset(name, bitmap)` — immediate: stores a decoded ImageBitmap
 * 2. `registerAssetUrl(name, url)` — lazy: stores a URL, decodes on first request
 *
 * When `retrieveAsset()` is called:
 * - If bitmap is cached → delivers immediately
 * - If a URL is registered → fetches, decodes, caches, then delivers
 * - Otherwise → queues the receiver for later delivery
 *
 * @see sources/win63_version/habbo/window/ResourceManager.as
 */
export class ResourceManager implements IResourceManager
{
    // AS3: sources/win63_version/habbo/window/ResourceManager.as::_windowManager
    private _windowManager: IHabboWindowManager;
    // TS-only: web-side bitmap cache (replaces Flash asset system)
    private _assets: Map<string, ImageBitmap> = new Map();
    // TS-only: lazy-loaded URL registry
    private _assetUrls: Map<string, string> = new Map();
    // TS-only: replaces AS3 _assetReceivers Dictionary
    private _pendingReceivers: Map<string, IAssetReceiver[]> = new Map();
    // TS-only: tracks in-progress fetches
    private _loading: Set<string> = new Set();

    // AS3: sources/win63_version/habbo/window/ResourceManager.as::ResourceManager()
    constructor(windowManager: IHabboWindowManager)
    {
        this._windowManager = windowManager;
    }

    // AS3: sources/win63_version/habbo/window/ResourceManager.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/win63_version/habbo/window/ResourceManager.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // TS-only
    public registerAsset(name: string, bitmap: ImageBitmap): void
    {
        const resolvedName = this.resolveAssetName(name);

        this._assets.set(resolvedName, bitmap);
        this._assetUrls.delete(resolvedName);

        this.deliverToReceivers(resolvedName, bitmap);
    }

    // TS-only
    public registerAssetUrl(name: string, url: string): void
    {
        const resolvedName = this.resolveAssetName(name);

        if(this._assets.has(resolvedName)) return;

        this._assetUrls.set(resolvedName, url);

        if(this._pendingReceivers.has(resolvedName) && !this._loading.has(resolvedName))
        {
            this._loading.add(resolvedName);
            this.loadFromUrl(resolvedName, url);
        }
    }

    // AS3: sources/win63_version/habbo/window/ResourceManager.as::retrieveAsset()
    public retrieveAsset(uri: string, receiver: IAssetReceiver): void
    {
        if(!uri || !receiver) return;

        const resolvedName = this.resolveAssetName(uri);

        if(!resolvedName) return;

        const cached = this._assets.get(resolvedName);

        if(cached)
        {
            receiver.receiveAsset(cached, resolvedName);

            return;
        }

        let receivers = this._pendingReceivers.get(resolvedName);
        const isFirstRequest = !receivers;

        if(!receivers)
        {
            receivers = [];
            this._pendingReceivers.set(resolvedName, receivers);
        }

        receivers.push(receiver);

        const url = this._assetUrls.get(resolvedName);

        if(url && !this._loading.has(resolvedName))
        {
            this._loading.add(resolvedName);
            this.loadFromUrl(resolvedName, url);

            return;
        }

        // AS3 ResourceManager.retrieveAsset (l.57-61): when the asset is not a
        // known bundle asset and the resolved name is itself a fetchable URL
        // (http/https), load it directly from that URL. Without this, URL-based
        // assetUri (e.g. room thumbnails) stay queued forever and never render.
        if(!url && this.isFetchableUrl(resolvedName))
        {
            if(!this._loading.has(resolvedName))
            {
                this._loading.add(resolvedName);
                this.loadFromUrl(resolvedName, resolvedName);
            }

            return;
        }

        // TS-only diagnostic: nothing above can ever resolve this name (no cached
        // bitmap, no registered asset URL, not itself a fetchable URL) - the receiver
        // stays queued forever and the image silently never renders, unlike
        // HabboWindowManager's "Widget layout not found" warning for a missing layout.
        // Warn once per name (guarded by isFirstRequest) so a missing image is just as
        // visible in the console as a missing layout already is.
        if(!url && isFirstRequest)
        {
            log.warn(`Asset not found: ${resolvedName}`);
        }
    }

    // TS-only: mirrors AS3 check `substr(0,7) == "http://" || substr(0,8) == "https://"`
    private isFetchableUrl(name: string): boolean
    {
        return name.startsWith('http://') || name.startsWith('https://') || (name.length > 1 && name.startsWith('/'));
    }

    // AS3: sources/win63_version/habbo/window/ResourceManager.as::isSameAsset()
    public isSameAsset(uri1: string, uri2: string): boolean
    {
        return this.resolveAssetName(uri1) === this.resolveAssetName(uri2);
    }

    // AS3: sources/win63_version/habbo/window/ResourceManager.as::createAsset()
    public createAsset(name: string, _assetClass: new (...args: unknown[]) => unknown, content: unknown): void
    {
        if(content instanceof ImageBitmap)
        {
            this.registerAsset(name, content);
        }
    }

    // AS3: sources/win63_version/habbo/window/ResourceManager.as::removeAsset()
    public removeAsset(name: string): void
    {
        const resolvedName = this.resolveAssetName(name);

        this._assets.delete(resolvedName);
        this._assetUrls.delete(resolvedName);
        this._pendingReceivers.delete(resolvedName);
        this._loading.delete(resolvedName);
    }

    // AS3: sources/win63_version/habbo/window/ResourceManager.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._assets.clear();
        this._assetUrls.clear();
        this._pendingReceivers.clear();
        this._loading.clear();
    }

    // AS3: sources/win63_version/habbo/window/ResourceManager.as::resolveAssetName()
    private resolveAssetName(uri: string): string
    {
        const interpolatingManager = this._windowManager as unknown as {
            interpolate?: (value: string) => string
        };

        const resolved = interpolatingManager.interpolate?.(uri) ?? uri;

        return normalizeLocalAssetUrl(resolved);
    }

    // TS-only: replaces AS3 passAssetToCallback() event callback
    private loadFromUrl(name: string, url: string): void
    {
        fetch(normalizeLocalAssetUrl(url))
            .then(response => response.blob())
            .then(blob => createImageBitmap(blob))
            .then(bitmap =>
            {
                if(this._disposed) return;

                this._loading.delete(name);
                this._assetUrls.delete(name);
                this._assets.set(name, bitmap);

                this.deliverToReceivers(name, bitmap);
            })
            .catch(() =>
            {
                this._loading.delete(name);
            });
    }

    // TS-only: replaces AS3 passAssetToCallback() delivery loop
    private deliverToReceivers(name: string, bitmap: ImageBitmap): void
    {
        const receivers = this._pendingReceivers.get(name);

        if(!receivers) return;

        this._pendingReceivers.delete(name);

        for(const receiver of receivers)
        {
            if(!receiver.disposed)
            {
                try
                {
                    receiver.receiveAsset(bitmap, name);
                }
                catch (e: unknown)
                {
                    log.warn(`Error delivering asset "${name}" to receiver:`, e);
                }
            }
        }
    }
}
