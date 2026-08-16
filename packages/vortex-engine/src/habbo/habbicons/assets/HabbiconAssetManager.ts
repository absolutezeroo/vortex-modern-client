import {EventEmitter} from 'eventemitter3';

import {Logger} from '@core/utils/Logger';
import type {ICoreConfiguration} from '@core/runtime/ICoreConfiguration';
import {BitmapDataUtils} from '@habbo/utils/BitmapDataUtils';

import {
    HabbiconDefinition,
    type IHabbiconAnimationStep,
    type IHabbiconFrameDefinition,
    type IHabbiconFrameRect,
    type IHabbiconRuntimeAsset,
    type IHabbiconRuntimeFrame
} from './HabbiconDefinition';

const log = Logger.getLogger('habbo.habbicons.assets.HabbiconAssetManager');

/**
 * The habbicon artwork: one metadata file and two spritesheets, fetched from a configured root and
 * sliced on demand.
 *
 * **It is a static singleton with a lazy instance**, which is why every public method routes through
 * `getInstance()` — the controller never constructs it, it just calls `configure()` then `preload()`.
 *
 * **Loading is fire-and-forget and never retried.** `ensureLoaded()` returns immediately if a load is
 * already running, already finished, or has already failed — that last flag is the one that matters,
 * because a failed load is permanent for the session. Only a change of asset root clears it.
 *
 * **The collection-icon sheet is allowed to fail.** Its three handlers all set `_collectionSheetLoaded`
 * and carry on, where the habbicon sheet's mark the whole load failed. The hub is usable without
 * collection icons; it is not usable without habbicons.
 *
 * **Frame rectangles are tried bottom-up first, then top-down.** `createValidRectForSheet()` computes
 * `height - y - h` and only falls back to a plain `y` if that lands outside the sheet — the metadata
 * is authored against a bottom-left origin, and the fallback covers sheets that are not.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/habbicons/assets/HabbiconAssetManager.as
 */
export class HabbiconAssetManager
{
    // AS3: HabbiconAssetManager.as::_SafeStr_10538 (name derived from its value)
    private static readonly HABBICONS_ASSET_ROOT: string = 'habbicons.asset.root';

    // AS3: HabbiconAssetManager.as::HABBICONS_ASSET_HASH
    private static readonly HABBICONS_ASSET_HASH: string = 'habbicons.asset.hash';

    // AS3: HabbiconAssetManager.as::_SafeStr_11096 (name derived from its value)
    private static readonly HABBICONS_METADATA_FILE: string = 'habbicons.json';

    // AS3: HabbiconAssetManager.as::_SafeStr_10916 (name derived from its value)
    private static readonly HABBICONS_SPRITESHEET_FILE: string = 'habbicons_spritesheet.png';

    // AS3: HabbiconAssetManager.as::COLLECTION_ICONS_SPRITESHEET_FILE
    private static readonly COLLECTION_ICONS_SPRITESHEET_FILE: string = 'collection_icons_spritesheet.png';

    // AS3: HabbiconAssetManager.as::HABBICONS_ANIMATION_PATH
    private static readonly HABBICONS_ANIMATION_PATH: string = 'animation/';

    // AS3: HabbiconAssetManager.as::DEFAULT_FRAME_SIZE
    private static readonly DEFAULT_FRAME_SIZE: number = 40;

    // AS3: HabbiconAssetManager.as::DEFAULT_COLLECTION_ICON_SIZE
    private static readonly DEFAULT_COLLECTION_ICON_SIZE: number = 18;

    // AS3: HabbiconAssetManager.as::COLLECTION_ICON_OUTLINE_SIZE
    private static readonly COLLECTION_ICON_OUTLINE_SIZE: number = 2;

    // AS3: HabbiconAssetManager.as::COLLECTION_ICON_OUTLINE_COLOR
    private static readonly COLLECTION_ICON_OUTLINE_COLOR: number = 0xFFFFFFFF;

    // AS3: HabbiconAssetManager.as::ASSETS_LOADED
    static readonly ASSETS_LOADED: string = 'habbicon_assets_loaded';

    // AS3: HabbiconAssetManager.as::_SafeStr_4847 (name derived: the lazy singleton)
    private static _instance: HabbiconAssetManager | null = null;

    // AS3: HabbiconAssetManager.as::_SafeStr_5128 (name derived: the configuration manager)
    private static _configuration: ICoreConfiguration | null = null;

    // AS3: HabbiconAssetManager.as::_SafeStr_4546 (name derived: the static dispatcher)
    private static _events: EventEmitter = new EventEmitter();

    // AS3: HabbiconAssetManager.as::_SafeStr_5835 (name derived: a load is in flight)
    private _loading: boolean = false;

    // AS3: HabbiconAssetManager.as::_jsonLoaded
    private _jsonLoaded: boolean = false;

    // AS3: HabbiconAssetManager.as::_sheetLoaded
    private _sheetLoaded: boolean = false;

    // AS3: HabbiconAssetManager.as::_collectionSheetLoaded
    private _collectionSheetLoaded: boolean = false;

    // AS3: HabbiconAssetManager.as::_SafeStr_7989 (name derived: the load failed, permanently)
    private _loadFailed: boolean = false;

    // AS3: HabbiconAssetManager.as::_SafeStr_7399 (name derived: preview rects by habbicon id)
    private _previewRects: Map<number, IHabbiconFrameRect> = new Map();

    // AS3: HabbiconAssetManager.as::_SafeStr_7325 (name derived: collection-icon rects)
    private _collectionIconRects: Map<number, IHabbiconFrameRect> = new Map();

    // AS3: HabbiconAssetManager.as::_SafeStr_7187 (name derived: full-size preview cache)
    private _previewBitmaps: Map<number, ImageBitmap> = new Map();

    // AS3: HabbiconAssetManager.as::_previewBitmapsSmall
    private _previewBitmapsSmall: Map<number, ImageBitmap> = new Map();

    // AS3: HabbiconAssetManager.as::_SafeStr_7057 (name derived: collection-icon cache)
    private _collectionIconBitmaps: Map<number, ImageBitmap> = new Map();

    // AS3: HabbiconAssetManager.as::_SafeStr_7492 (name derived: outlined collection-icon cache)
    private _outlinedCollectionIconBitmaps: Map<number, ImageBitmap> = new Map();

    // AS3: HabbiconAssetManager.as::_SafeStr_7333 (name derived: localization key by habbicon id)
    private _nameKeys: Map<number, string> = new Map();

    // AS3: HabbiconAssetManager.as::_SafeStr_6289 (name derived: definitions by habbicon id)
    private _definitions: Map<number, HabbiconDefinition> = new Map();

    // AS3: HabbiconAssetManager.as::_SafeStr_7364 (name derived: single-frame fallback assets)
    private _fallbackRuntimeAssets: Map<number, IHabbiconRuntimeAsset> = new Map();

    // AS3: HabbiconAssetManager.as::_SafeStr_6866 (name derived: decoded animated assets)
    private _runtimeAssets: Map<number, IHabbiconRuntimeAsset> = new Map();

    // AS3: HabbiconAssetManager.as::_SafeStr_6122 (name derived: animation sheets in flight)
    private _pendingRuntimeSheets: Set<number> = new Set();

    // AS3: HabbiconAssetManager.as::_SafeStr_6842 (name derived: the habbicon spritesheet)
    private _spritesheet: ImageBitmap | null = null;

    // AS3: HabbiconAssetManager.as::_SafeStr_7078 (name derived: the collection-icon spritesheet)
    private _collectionSpritesheet: ImageBitmap | null = null;

    // AS3: HabbiconAssetManager.as::_SafeStr_7506 (name derived: the resolved asset root)
    private _assetRoot: string = '';

    // AS3: HabbiconAssetManager.as::getPreviewBitmap()
    static getPreviewBitmap(habbiconId: number, small: boolean): ImageBitmap | null
    {
        return HabbiconAssetManager.getInstance().resolvePreviewBitmap(habbiconId, small);
    }

    // AS3: HabbiconAssetManager.as::getHabbiconNameKey()
    static getHabbiconNameKey(habbiconId: number): string | null
    {
        return HabbiconAssetManager.getInstance().resolveNameLocalizationKey(habbiconId);
    }

    // AS3: HabbiconAssetManager.as::getCollectionIconBitmap()
    static getCollectionIconBitmap(collectionId: number): ImageBitmap | null
    {
        return HabbiconAssetManager.getInstance().resolveCollectionIconBitmap(collectionId);
    }

    // AS3: HabbiconAssetManager.as::getOutlinedCollectionIconBitmap()
    static getOutlinedCollectionIconBitmap(collectionId: number): ImageBitmap | null
    {
        return HabbiconAssetManager.getInstance().resolveOutlinedCollectionIconBitmap(collectionId);
    }

    // AS3: HabbiconAssetManager.as::getRuntimeAsset()
    static getRuntimeAsset(habbiconId: number): IHabbiconRuntimeAsset | null
    {
        return HabbiconAssetManager.getInstance().resolveRuntimeAsset(habbiconId);
    }

    // AS3: HabbiconAssetManager.as::getDirection()
    static getDirection(habbiconId: number): number
    {
        return HabbiconAssetManager.getInstance().resolveDirection(habbiconId);
    }

    // AS3: HabbiconAssetManager.as::configure()
    static configure(configuration: ICoreConfiguration | null): void
    {
        HabbiconAssetManager._configuration = configuration;
        HabbiconAssetManager.getInstance().refreshAssetRoot();
    }

    // AS3: HabbiconAssetManager.as::preload()
    static preload(): void
    {
        HabbiconAssetManager.getInstance().ensureLoaded();
    }

    // AS3: HabbiconAssetManager.as::addEventListener()
    static addEventListener(type: string, listener: () => void): void
    {
        HabbiconAssetManager._events.on(type, listener);
    }

    // AS3: HabbiconAssetManager.as::removeEventListener()
    static removeEventListener(type: string, listener: () => void): void
    {
        HabbiconAssetManager._events.off(type, listener);
    }

    // AS3: HabbiconAssetManager.as::getInstance()
    private static getInstance(): HabbiconAssetManager
    {
        if(HabbiconAssetManager._instance === null)
        {
            HabbiconAssetManager._instance = new HabbiconAssetManager();
        }

        return HabbiconAssetManager._instance;
    }

    /**
	 * A silhouette of the source in the outline colour, stamped at every offset in a square around
	 * the centre, with the source drawn on top. AS3 builds the silhouette with `copyChannel(ALPHA →
	 * ALPHA)` onto a solid fill; `source-in` compositing is the canvas equivalent.
	 */
    // AS3: HabbiconAssetManager.as::createOutlinedBitmap()
    private static createOutlinedBitmap(source: ImageBitmap, size: number, color: number): ImageBitmap
    {
        const silhouetteCanvas = new OffscreenCanvas(source.width, source.height);
        const silhouetteContext = silhouetteCanvas.getContext('2d');

        if(silhouetteContext === null) return source;

        silhouetteContext.drawImage(source, 0, 0);
        silhouetteContext.globalCompositeOperation = 'source-in';
        silhouetteContext.fillStyle = HabbiconAssetManager.toCssColor(color);
        silhouetteContext.fillRect(0, 0, source.width, source.height);

        const silhouette = silhouetteCanvas.transferToImageBitmap();
        const canvas = new OffscreenCanvas(source.width + size * 2, source.height + size * 2);
        const context = canvas.getContext('2d');

        if(context === null) return source;

        for(let x = -size; x <= size; x++)
        {
            for(let y = -size; y <= size; y++)
            {
                if(x === 0 && y === 0) continue;

                context.drawImage(silhouette, size + x, size + y);
            }
        }

        context.drawImage(source, size, size);
        silhouette.close();

        return canvas.transferToImageBitmap();
    }

    // TS-only: AS3 passes a 0xAARRGGBB uint straight to BitmapData; a canvas needs a CSS colour.
    private static toCssColor(color: number): string
    {
        const alpha = ((color >>> 24) & 0xFF) / 255;
        const red = (color >>> 16) & 0xFF;
        const green = (color >>> 8) & 0xFF;
        const blue = color & 0xFF;

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    /**
	 * The hash is either substituted into a `{hash}`/`%hash%` placeholder or appended as a path
	 * segment — but only if the root does not already end with it, which is what lets a fully-resolved
	 * root be configured directly.
	 *
	 * Changing the root throws away everything already loaded, including the failure flag. That is the
	 * only way a failed load is ever retried.
	 */
    // AS3: HabbiconAssetManager.as::refreshAssetRoot()
    private refreshAssetRoot(): string
    {
        if(HabbiconAssetManager._configuration === null) return this._assetRoot;

        let root = HabbiconAssetManager._configuration.getProperty(HabbiconAssetManager.HABBICONS_ASSET_ROOT);
        const hash = HabbiconAssetManager._configuration.getProperty(HabbiconAssetManager.HABBICONS_ASSET_HASH);

        if(!root) return this._assetRoot;

        root = HabbiconAssetManager.stripTrailingSlash(root);

        if(hash && (root.indexOf('{hash}') > -1 || root.indexOf('%hash%') > -1))
        {
            root = root.split('{hash}').join(hash);
            root = root.split('%hash%').join(hash);
        }
        else if(hash && !HabbiconAssetManager.endsWithPathSegment(root, hash))
        {
            root += `/${hash}`;
        }

        root += '/';

        if(this._assetRoot !== root)
        {
            this.resetLoadedAssets();
            this._assetRoot = root;
        }

        return this._assetRoot;
    }

    // AS3: HabbiconAssetManager.as::resetLoadedAssets()
    private resetLoadedAssets(): void
    {
        this._loading = false;
        this._jsonLoaded = false;
        this._sheetLoaded = false;
        this._collectionSheetLoaded = false;
        this._loadFailed = false;
        this._previewRects = new Map();
        this._collectionIconRects = new Map();
        this._previewBitmaps = new Map();
        this._previewBitmapsSmall = new Map();
        this._collectionIconBitmaps = new Map();
        this._outlinedCollectionIconBitmaps = new Map();
        this._nameKeys = new Map();
        this._definitions = new Map();
        this._fallbackRuntimeAssets = new Map();
        this._runtimeAssets = new Map();
        this._pendingRuntimeSheets = new Set();
        this._spritesheet = null;
        this._collectionSpritesheet = null;
    }

    // AS3: HabbiconAssetManager.as::stripTrailingSlash()
    private static stripTrailingSlash(value: string): string
    {
        while(value.length > 0 && value.charAt(value.length - 1) === '/')
        {
            value = value.substr(0, value.length - 1);
        }

        return value;
    }

    // AS3: HabbiconAssetManager.as::endsWithPathSegment()
    private static endsWithPathSegment(value: string, segment: string): boolean
    {
        return value === segment || value.lastIndexOf(`/${segment}`) === value.length - segment.length - 1;
    }

    /**
	 * The small preview is derived from the full one and cached separately, so asking for the small
	 * size first still populates both.
	 */
    // AS3: HabbiconAssetManager.as::resolvePreviewBitmap()
    private resolvePreviewBitmap(habbiconId: number, small: boolean): ImageBitmap | null
    {
        this.ensureLoaded();

        let cached = (small ? this._previewBitmapsSmall.get(habbiconId) : this._previewBitmaps.get(habbiconId)) ?? null;

        if(cached !== null) return cached;

        if(!this._jsonLoaded || !this._sheetLoaded || this._spritesheet === null) return null;

        const rect = this._previewRects.get(habbiconId) ?? null;

        if(rect === null) return null;

        const bitmap = this.extractFrameBitmap(rect);

        if(bitmap === null) return null;

        this._previewBitmaps.set(habbiconId, bitmap);

        if(small)
        {
            cached = BitmapDataUtils.resampleBitmap(bitmap, 0.5);
            this._previewBitmapsSmall.set(habbiconId, cached);

            return cached;
        }

        return bitmap;
    }

    // AS3: HabbiconAssetManager.as::resolveCollectionIconBitmap()
    private resolveCollectionIconBitmap(collectionId: number): ImageBitmap | null
    {
        this.ensureLoaded();

        const cached = this._collectionIconBitmaps.get(collectionId) ?? null;

        if(cached !== null) return cached;

        if(!this._jsonLoaded || !this._collectionSheetLoaded || this._collectionSpritesheet === null) return null;

        const rect = this._collectionIconRects.get(collectionId) ?? null;

        if(rect === null) return null;

        const bitmap = this.extractFrameBitmapFromSheet(this._collectionSpritesheet, rect);

        if(bitmap !== null) this._collectionIconBitmaps.set(collectionId, bitmap);

        return bitmap;
    }

    // AS3: HabbiconAssetManager.as::resolveOutlinedCollectionIconBitmap()
    private resolveOutlinedCollectionIconBitmap(collectionId: number): ImageBitmap | null
    {
        const cached = this._outlinedCollectionIconBitmaps.get(collectionId) ?? null;

        if(cached !== null) return cached;

        const source = this.resolveCollectionIconBitmap(collectionId);

        if(source === null) return null;

        const outlined = HabbiconAssetManager.createOutlinedBitmap(
            source,
            HabbiconAssetManager.COLLECTION_ICON_OUTLINE_SIZE,
            HabbiconAssetManager.COLLECTION_ICON_OUTLINE_COLOR
        );

        this._outlinedCollectionIconBitmaps.set(collectionId, outlined);

        return outlined;
    }

    // AS3: HabbiconAssetManager.as::resolveNameLocalizationKey()
    private resolveNameLocalizationKey(habbiconId: number): string | null
    {
        this.ensureLoaded();

        return this._nameKeys.get(habbiconId) ?? null;
    }

    // AS3: HabbiconAssetManager.as::resolveDirection()
    private resolveDirection(habbiconId: number): number
    {
        this.ensureLoaded();

        return this._definitions.get(habbiconId)?.direction ?? 0;
    }

    /**
	 * The animated sheet is requested but not waited for — the caller gets the still fallback now, and
	 * the animated asset replaces it on a later call, once the sheet has arrived.
	 */
    // AS3: HabbiconAssetManager.as::resolveRuntimeAsset()
    private resolveRuntimeAsset(habbiconId: number): IHabbiconRuntimeAsset | null
    {
        this.ensureLoaded();

        const animated = this._runtimeAssets.get(habbiconId) ?? null;

        if(animated !== null) return animated;

        const definition = this._definitions.get(habbiconId) ?? null;

        if(definition === null) return null;

        if(definition.animated) void this.loadRuntimeAsset(habbiconId, definition);

        let fallback = this._fallbackRuntimeAssets.get(habbiconId) ?? null;

        if(fallback === null)
        {
            fallback = this.buildFallbackRuntimeAsset(habbiconId, definition);

            if(fallback !== null) this._fallbackRuntimeAssets.set(habbiconId, fallback);
        }

        return fallback;
    }

    /**
	 * All three requests go out together and each completes independently, so the order they land in
	 * does not matter — `checkLoadCompletion()` fires the event once all three flags are set.
	 */
    // AS3: HabbiconAssetManager.as::ensureLoaded()
    private ensureLoaded(): void
    {
        if(this._loading || (this._jsonLoaded && this._sheetLoaded && this._collectionSheetLoaded) || this._loadFailed)
        {
            return;
        }

        const root = this.refreshAssetRoot();

        if(!root)
        {
            log.warn('Habbicon asset root is not configured.');
            this.markLoadFailed();

            return;
        }

        this._loading = true;

        void this.loadMetadata(root + HabbiconAssetManager.HABBICONS_METADATA_FILE);
        void this.loadSpritesheet(root + HabbiconAssetManager.HABBICONS_SPRITESHEET_FILE);
        void this.loadCollectionSpritesheet(root + HabbiconAssetManager.COLLECTION_ICONS_SPRITESHEET_FILE);
    }

    // AS3: HabbiconAssetManager.as::onMetadataLoaded()
    private async loadMetadata(url: string): Promise<void>
    {
        try
        {
            const response = await fetch(url);

            if(!response.ok) throw new Error(`HTTP ${response.status}`);

            const document = await response.json() as IHabbiconMetadataDocument;
            const habbicons = Array.isArray(document?.habbicons) ? document.habbicons : [];

            for(const entry of habbicons)
            {
                if(entry === null || entry === undefined || entry.id === null || entry.id === undefined) continue;

                const width = HabbiconAssetManager.normalizeDimension(entry.width);
                const height = HabbiconAssetManager.normalizeDimension(entry.height);
                const id = Number(entry.id) | 0;

                this._previewRects.set(id, {
                    x: Number(entry.x) | 0,
                    y: Number(entry.y) | 0,
                    width,
                    height,
                });

                if(entry.name !== null && entry.name !== undefined) this._nameKeys.set(id, String(entry.name));

                this._definitions.set(id, HabbiconAssetManager.buildDefinition(entry, width, height));
            }

            const collectionIcons = Array.isArray(document?.collectionIcons) ? document.collectionIcons : [];

            for(const entry of collectionIcons)
            {
                if(entry === null || entry === undefined || entry.id === null || entry.id === undefined) continue;

                this._collectionIconRects.set(Number(entry.id) | 0, {
                    x: Number(entry.x) | 0,
                    y: Number(entry.y) | 0,
                    width: HabbiconAssetManager.normalizeDimension(
                        entry.width, HabbiconAssetManager.DEFAULT_COLLECTION_ICON_SIZE
                    ),
                    height: HabbiconAssetManager.normalizeDimension(
                        entry.height, HabbiconAssetManager.DEFAULT_COLLECTION_ICON_SIZE
                    ),
                });
            }

            this._jsonLoaded = true;
            this.checkLoadCompletion();
        }
        catch (error)
        {
            log.warn(`Failed to parse habbicon metadata: ${(error as Error).message}`);
            this.markLoadFailed();
        }
    }

    // AS3: HabbiconAssetManager.as::onSpritesheetLoaded()
    private async loadSpritesheet(url: string): Promise<void>
    {
        try
        {
            this._spritesheet = await HabbiconAssetManager.fetchBitmap(url);
            this._sheetLoaded = true;
            this.checkLoadCompletion();
        }
        catch (error)
        {
            log.warn(`Failed to load habbicon asset: ${(error as Error).message}`);
            this.markLoadFailed();
        }
    }

    /**
	 * Note the failure path: the sheet is marked loaded anyway, exactly as AS3 does, so the hub opens
	 * without collection icons rather than not at all.
	 */
    // AS3: HabbiconAssetManager.as::onCollectionSpritesheetLoaded()
    private async loadCollectionSpritesheet(url: string): Promise<void>
    {
        try
        {
            this._collectionSpritesheet = await HabbiconAssetManager.fetchBitmap(url);
        }
        catch (error)
        {
            log.warn(`Failed to load habbicon collection icon asset: ${(error as Error).message}`);
        }

        this._collectionSheetLoaded = true;
        this.checkLoadCompletion();
    }

    // TS-only: AS3 uses flash.display.Loader, which has no browser equivalent taking a URL.
    private static async fetchBitmap(url: string): Promise<ImageBitmap>
    {
        const response = await fetch(url);

        if(!response.ok) throw new Error(`HTTP ${response.status}`);

        return createImageBitmap(await response.blob());
    }

    // AS3: HabbiconAssetManager.as::markLoadFailed()
    private markLoadFailed(): void
    {
        this._loading = false;
        this._loadFailed = true;
    }

    // AS3: HabbiconAssetManager.as::checkLoadCompletion()
    private checkLoadCompletion(): void
    {
        if(this._jsonLoaded && this._sheetLoaded && this._collectionSheetLoaded)
        {
            this._loading = false;
            HabbiconAssetManager._events.emit(HabbiconAssetManager.ASSETS_LOADED);
        }
    }

    /**
	 * `playbackSpeed` divides each step's duration, so a speed of 2 plays twice as fast. It is clamped
	 * to a positive number, and each resulting duration to at least 1ms.
	 */
    // AS3: HabbiconAssetManager.as::buildDefinition()
    private static buildDefinition(entry: IHabbiconMetadataEntry, width: number, height: number): HabbiconDefinition
    {
        const frameData = Array.isArray(entry.frameData) ? entry.frameData : [];
        const animation = entry.animation ?? null;
        const steps = animation !== null && Array.isArray(animation.steps) ? animation.steps : [];

        let playbackSpeed = 1;

        if(animation !== null && animation.playbackSpeed !== null && animation.playbackSpeed !== undefined)
        {
            playbackSpeed = Number(animation.playbackSpeed);
        }

        if(isNaN(playbackSpeed) || playbackSpeed <= 0) playbackSpeed = 1;

        const animated = (Number(entry.frameCount) | 0) > 1 && frameData.length > 0 && steps.length > 0;

        return new HabbiconDefinition(
            width,
            height,
            HabbiconAssetManager.normalizeDirection(entry.dir),
            animated,
            Boolean(entry.loop),
            HabbiconAssetManager.buildRuntimeFrameDefinitions(frameData, width, height),
            HabbiconAssetManager.buildRuntimeAnimationSteps(steps, playbackSpeed)
        );
    }

    // AS3: HabbiconAssetManager.as::buildRuntimeFrameDefinitions()
    private static buildRuntimeFrameDefinitions(
        source: IHabbiconMetadataFrame[], width: number, height: number
    ): IHabbiconFrameDefinition[]
    {
        const frames: IHabbiconFrameDefinition[] = [];

        for(const frame of source)
        {
            if(frame === null || frame === undefined) continue;

            frames.push({
                id: Number(frame.id) | 0,
                x: Number(frame.x) | 0,
                y: Number(frame.y) | 0,
                width: HabbiconAssetManager.normalizeDimension(frame.width, width),
                height: HabbiconAssetManager.normalizeDimension(frame.height, height),
            });
        }

        // AS3 sorts numerically (Array.NUMERIC) — the ids are the playback order.
        frames.sort((a, b) => a.id - b.id);

        return frames;
    }

    /**
	 * A step with `enabled: false` is dropped entirely, so the timeline can be shorter than the
	 * authored one. Anything else — including a missing `enabled` — is kept.
	 */
    // AS3: HabbiconAssetManager.as::buildRuntimeAnimationSteps()
    private static buildRuntimeAnimationSteps(
        source: IHabbiconMetadataStep[], playbackSpeed: number
    ): IHabbiconAnimationStep[]
    {
        const steps: IHabbiconAnimationStep[] = [];

        for(const step of source)
        {
            if(step === null || step === undefined) continue;

            if(step.enabled === false) continue;

            let duration = Math.max(1, Number(step.durationMs) | 0);

            duration = Math.max(1, duration / playbackSpeed);

            steps.push({
                sourceFrame: Math.max(0, Number(step.sourceFrame) | 0),
                durationMs: duration,
            });
        }

        return steps;
    }

    /**
	 * `playbackDurationMs` is 0 here, and the single step's duration is 0 too — a still has no
	 * timeline for a player to advance.
	 */
    // AS3: HabbiconAssetManager.as::buildFallbackRuntimeAsset()
    private buildFallbackRuntimeAsset(habbiconId: number, definition: HabbiconDefinition): IHabbiconRuntimeAsset | null
    {
        const bitmap = this.resolvePreviewBitmap(habbiconId, false);
        const small = this.resolvePreviewBitmap(habbiconId, true);

        if(bitmap === null) return null;

        return {
            animated: false,
            loop: false,
            direction: definition.direction,
            baseWidth: bitmap.width,
            baseHeight: bitmap.height,
            frames: [{
                bitmap,
                smallBitmap: small ?? bitmap,
                width: bitmap.width,
                height: bitmap.height,
            }],
            steps: [{sourceFrame: 0, durationMs: 0}],
            playbackDurationMs: 0,
        };
    }

    /**
	 * The in-flight set is what stops a habbicon whose sheet is still loading from queueing a second
	 * request on every repaint.
	 */
    // AS3: HabbiconAssetManager.as::loadRuntimeAsset()
    private async loadRuntimeAsset(habbiconId: number, definition: HabbiconDefinition): Promise<void>
    {
        if(!definition.animated
            || this._pendingRuntimeSheets.has(habbiconId)
            || this._runtimeAssets.has(habbiconId))
        {
            return;
        }

        const root = this.refreshAssetRoot();

        if(!root) return;

        this._pendingRuntimeSheets.add(habbiconId);

        try
        {
            const sheet = await HabbiconAssetManager.fetchBitmap(
                `${root}${HabbiconAssetManager.HABBICONS_ANIMATION_PATH}${habbiconId}.png`
            );
            const asset = this.buildAnimatedRuntimeAsset(definition, sheet);

            if(asset !== null) this._runtimeAssets.set(habbiconId, asset);
        }
        catch (error)
        {
            log.warn(`Failed to load habbicon runtime asset: ${(error as Error).message}`);
        }
        finally
        {
            this._pendingRuntimeSheets.delete(habbiconId);
        }
    }

    /**
	 * `baseWidth`/`baseHeight` come from the definition, not the frames — a frame may be larger than
	 * the preview box it is drawn in.
	 */
    // AS3: HabbiconAssetManager.as::buildAnimatedRuntimeAsset()
    private buildAnimatedRuntimeAsset(
        definition: HabbiconDefinition, sheet: ImageBitmap
    ): IHabbiconRuntimeAsset | null
    {
        if(definition.frames.length === 0) return null;

        const frames: IHabbiconRuntimeFrame[] = [];

        for(const frame of definition.frames)
        {
            const bitmap = this.extractFrameBitmapFromSheet(sheet, frame);

            if(bitmap === null) continue;

            frames.push({
                bitmap,
                smallBitmap: BitmapDataUtils.resampleBitmap(bitmap, 0.5),
                width: bitmap.width,
                height: bitmap.height,
            });
        }

        if(frames.length === 0) return null;

        let playbackDurationMs = 0;

        for(const step of definition.steps)
        {
            playbackDurationMs += Math.max(1, step.durationMs | 0);
        }

        return {
            animated: true,
            loop: definition.loop,
            direction: definition.direction,
            baseWidth: definition.previewWidth,
            baseHeight: definition.previewHeight,
            frames,
            steps: definition.steps.length > 0 ? definition.steps : [{sourceFrame: 0, durationMs: 0}],
            playbackDurationMs,
        };
    }

    // AS3: HabbiconAssetManager.as::extractFrameBitmap()
    private extractFrameBitmap(rect: IHabbiconFrameRect): ImageBitmap | null
    {
        if(this._spritesheet === null) return null;

        return this.extractFrameBitmapFromSheet(this._spritesheet, rect);
    }

    // AS3: HabbiconAssetManager.as::extractFrameBitmapFromSheet()
    private extractFrameBitmapFromSheet(sheet: ImageBitmap, rect: IHabbiconFrameRect): ImageBitmap | null
    {
        const source = HabbiconAssetManager.createValidRectForSheet(sheet, rect.x, rect.y, rect.width, rect.height);

        if(source === null) return null;

        const canvas = new OffscreenCanvas(source.width, source.height);
        const context = canvas.getContext('2d');

        if(context === null) return null;

        context.drawImage(
            sheet,
            source.x, source.y, source.width, source.height,
            0, 0, source.width, source.height
        );

        return canvas.transferToImageBitmap();
    }

    /**
	 * Bottom-left origin first, top-left as a fallback, and null if neither fits. A rect that fails
	 * both tests renders nothing rather than throwing.
	 */
    // AS3: HabbiconAssetManager.as::createValidRectForSheet()
    private static createValidRectForSheet(
        sheet: ImageBitmap | null, x: number, y: number, width: number, height: number
    ): IHabbiconFrameRect | null
    {
        if(sheet === null) return null;

        const flipped: IHabbiconFrameRect = {x, y: sheet.height - y - height, width, height};

        if(HabbiconAssetManager.isRectWithinBitmap(sheet, flipped)) return flipped;

        const plain: IHabbiconFrameRect = {x, y, width, height};

        if(HabbiconAssetManager.isRectWithinBitmap(sheet, plain)) return plain;

        return null;
    }

    // AS3: HabbiconAssetManager.as::isRectWithinBitmap()
    private static isRectWithinBitmap(sheet: ImageBitmap | null, rect: IHabbiconFrameRect): boolean
    {
        return sheet !== null
            && rect.x >= 0
            && rect.y >= 0
            && rect.x + rect.width <= sheet.width
            && rect.y + rect.height <= sheet.height;
    }

    // AS3: HabbiconAssetManager.as::normalizeDimension()
    private static normalizeDimension(
        value: unknown, fallback: number = HabbiconAssetManager.DEFAULT_FRAME_SIZE
    ): number
    {
        const dimension = Number(value) | 0;

        return dimension > 0 ? dimension : fallback;
    }

    // AS3: HabbiconAssetManager.as::normalizeDirection()
    private static normalizeDirection(value: unknown): number
    {
        if(value === null || value === undefined) return 0;

        const direction = Number(value) | 0;

        if(direction < 0) return -1;

        if(direction > 0) return 1;

        return 0;
    }
}

// TS-only: the shape of habbicons.json. AS3 reads it as untyped Objects.
interface IHabbiconMetadataFrame
{
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    id?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    x?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    y?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    width?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    height?: unknown;
}

// TS-only: as above.
interface IHabbiconMetadataStep
{
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    enabled?: boolean;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    sourceFrame?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    durationMs?: unknown;
}

// TS-only: as above.
interface IHabbiconMetadataEntry
{
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    id?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    name?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    x?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    y?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    width?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    height?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    dir?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    loop?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    frameCount?: unknown;
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    frameData?: IHabbiconMetadataFrame[];
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    animation?: {steps?: IHabbiconMetadataStep[]; playbackSpeed?: unknown} | null;
}

// TS-only: as above.
interface IHabbiconMetadataDocument
{
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    habbicons?: IHabbiconMetadataEntry[];
    // TS-only: a field of AS3's anonymous object literal (see the interface above).
    collectionIcons?: IHabbiconMetadataFrame[];
}
