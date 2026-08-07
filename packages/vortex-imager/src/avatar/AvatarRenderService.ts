/**
 * Boots the client's avatar pipeline headlessly and renders single frames out of it.
 *
 * There is no second renderer here. `AvatarRenderManager`, `AvatarStructure`, `AvatarImage`
 * and their 120-odd collaborators are the engine's own classes, running unmodified — the only
 * things replaced are the browser APIs underneath them (see `shim/`). That is the whole point:
 * an imager that reimplements the compositing rules drifts from the client the first time
 * either side is touched, and the drift shows up as avatars that look subtly wrong in the
 * profile but right in the room.
 *
 * The boot mirrors `VortexMain.prepareCore()`, minus everything that is not avatars: an asset
 * library, the real configuration manager (pointed at the hotel's own `external_variables`),
 * and the render manager. No socket, no window system, no ticker.
 */
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {Core} from '@core/Core';
import type {CoreComponentContext} from '@core/runtime/CoreComponentContext';
import {AssetLibrary, AssetTypeDeclaration, XmlAsset} from '@core/assets';
import {Logger} from '@core/utils/Logger';
import {IID_Core} from '@iid/IIDCore';
import {IID_AssetLibrary} from '@iid/IIDAssetLibrary';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import {HabboConfigurationManager} from '@habbo/configuration/HabboConfigurationManager';
import {HabboProperty} from '@habbo/configuration/enum/HabboProperty';
import {AvatarRenderManager} from '@habbo/avatar/AvatarRenderManager';
import {AvatarRenderEvent} from '@habbo/avatar/enum/AvatarRenderEvent';
import {AvatarSetType} from '@habbo/avatar/enum/AvatarSetType';
import {AvatarAction} from '@habbo/avatar/enum/AvatarAction';
import type {IAvatarImage} from '@habbo/avatar/IAvatarImage';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IAvatarEffectListener} from '@habbo/avatar/IAvatarEffectListener';
import type {IImagerConfig} from '../config';
import type {IAvatarRequest} from './AvatarRequest';
import {canvasToPng, textureToPng} from '../render/encode';
import {composeAvatarWithSprites} from '../render/composeAvatar';

const log = Logger.getLogger('imager.avatar.AvatarRenderService');

/**
 * The avatar XMLs the client embeds and the render manager reads straight out of the asset
 * library — geometry, part sets, animations and the figure defaults. Without them
 * `AvatarStructure` has no body to hang parts on and every render comes back empty.
 */
const EMBEDDED_AVATAR_XML_ASSETS: string[] = [
    'HabboAvatarAnimation',
    'HabboAvatarFigure',
    'HabboAvatarGeometry',
    'HabboAvatarPartSets'
];

/** How long boot waits for the mandatory libraries and the figure map. */
const READY_TIMEOUT_MS = 120_000;

/** How long a single request waits for its figure's part libraries to download. */
const FIGURE_TIMEOUT_MS = 30_000;

/** How long a single request waits for an effect library. */
const EFFECT_TIMEOUT_MS = 15_000;

export class AvatarRenderService
{
    private _config: IImagerConfig;
    private _renderManager: AvatarRenderManager | null = null;
    private _configuration: HabboConfigurationManager | null = null;

    /** Effect ids whose library has arrived, or whose download has already been waited out. */
    private _settledEffects: Set<number> = new Set();

    private constructor(config: IImagerConfig)
    {
        this._config = config;
    }

    static async boot(config: IImagerConfig): Promise<AvatarRenderService>
    {
        const service = new AvatarRenderService(config);

        await service.initialize();

        return service;
    }

    /**
	 * Renders one avatar frame to a PNG.
	 *
	 * The sequence is the client's: get the figure's libraries down, build the image, point it,
	 * apply the actions, then ask for the composite. Actions must be bracketed by
	 * `initActionAppends()` / `endActionAppends()` — that pair is what re-resolves the action
	 * set and picks the winning posture by precedence.
	 */
    async render(request: IAvatarRequest): Promise<Buffer>
    {
        const renderManager = this.requireRenderManager();

        await this.ensureFigureReady(request.figure);

        let effectResolve: (() => void) | null = null;
        const effectReady = new Promise<void>((resolve) =>
        {
            effectResolve = resolve;
        });

        const effectListener: IAvatarEffectListener = {
            disposed: false,
            avatarEffectReady: (): void => effectResolve?.()
        };

        const avatarImage = renderManager.createAvatarImage(
            request.figure,
            request.scale,
            request.gender,
            null,
            effectListener
        );

        if(avatarImage === null)
        {
            throw new Error('Avatar render manager is not ready');
        }

        try
        {
            this.applyRequest(avatarImage, request);

            // An effect's own library is only requested when `endActionAppends()` sees the
            // action, so the first composite would come back without it. `forceActionUpdate()`
            // re-resolves the action set once the library is in.
            if(request.effectId > 0 && !this.isEffectSettled(request.effectId))
            {
                await withTimeout(effectReady, EFFECT_TIMEOUT_MS).catch(() =>
                {
                    log.warn(`Effect ${request.effectId} did not load in time; rendering without it`);
                });

                this._settledEffects.add(request.effectId);

                avatarImage.forceActionUpdate();

                if(request.frame > 0) avatarImage.updateAnimationByFrames(request.frame);
            }

            const setType = request.headOnly ? AvatarSetType.HEAD : AvatarSetType.FULL;

            // Compositing stays at 1x — see `render/encode.ts` for why the zoom is applied there.
            const texture = request.cropped
                ? avatarImage.getCroppedImage(setType)
                : avatarImage.getImage(setType, false);

            if(!texture)
            {
                throw new Error(`Nothing rendered for figure "${request.figure}"`);
            }

            // Effect sprites only make sense around a whole avatar; a head crop has nothing to
            // hang them on, so those requests keep the body composite untouched.
            const composite = request.headOnly || request.cropped
                ? null
                : composeAvatarWithSprites(avatarImage, texture);

            return composite === null
                ? await textureToPng(texture, request.zoom)
                : await canvasToPng(composite, request.zoom);
        }
        finally
        {
            effectListener.disposed = true;
            avatarImage.dispose();
        }
    }

    /**
	 * Reads a resolved hotel property. The badge renderer needs
	 * `image.library.badgepart.url` from the same `external_variables` the avatars come from,
	 * so it goes through the configuration manager this service already owns rather than
	 * getting its own copy of the hotel config.
	 */
    getProperty(key: string): string
    {
        return this._configuration?.getProperty(key) ?? '';
    }

    async dispose(): Promise<void>
    {
        this._renderManager?.dispose();
        this._renderManager = null;

        Core.dispose();
    }

    /**
	 * Applies direction, posture, gestures and effects to a freshly built image.
	 *
	 * The order is not arbitrary. The body direction goes first because
	 * `appendAction(POSTURE, 'lay')` turns the avatar itself — a lying avatar only exists at
	 * directions 2 and 4 — and it reads `_mainDirection` to decide which. Head direction goes
	 * last because `setDirection(FULL, …)` turns the head with the body, so a distinct
	 * `head_direction` only survives if it is applied afterwards.
	 */
    private applyRequest(avatarImage: IAvatarImage, request: IAvatarRequest): void
    {
        avatarImage.setDirection(AvatarSetType.FULL, request.direction);

        avatarImage.initActionAppends();
        avatarImage.appendAction(AvatarAction.POSTURE, request.posture);

        for(const action of request.actions)
        {
            if(action.param === null) avatarImage.appendAction(action.type);
            else avatarImage.appendAction(action.type, action.param);
        }

        avatarImage.endActionAppends();

        avatarImage.setDirection(AvatarSetType.HEAD, request.headDirection);

        if(request.frame > 0) avatarImage.updateAnimationByFrames(request.frame);
    }

    /**
	 * Whether rendering can proceed without waiting for effect `effectId`.
	 *
	 * There is no readiness check to call: `AvatarRenderManager` exposes `isFigureReady()` but
	 * has no effect equivalent (neither does AS3's `_SafeCls_582`), and `effectMap` lists every
	 * effect the hotel *declares*, not the ones downloaded — reading it as readiness is what
	 * made effects render as a plain standing avatar. So readiness is tracked here instead:
	 * an id is settled once its library has arrived, or once waiting for it has already timed
	 * out, or if the hotel never declared it at all.
	 */
    private isEffectSettled(effectId: number): boolean
    {
        if(this._settledEffects.has(effectId)) return true;

        return !this.requireRenderManager().effectMap.has(String(effectId));
    }

    /**
	 * Blocks until every part library the figure needs is downloaded.
	 *
	 * In the client this is fire-and-forget — a placeholder avatar shows while the parts
	 * arrive, then `avatarImageReady()` redraws. A single HTTP response has nowhere to put a
	 * placeholder, so the request waits instead.
	 */
    private async ensureFigureReady(figure: string): Promise<void>
    {
        const renderManager = this.requireRenderManager();
        const container = renderManager.createFigureContainer(figure);

        if(renderManager.isFigureReady(container)) return;

        await withTimeout(new Promise<void>((resolve) =>
        {
            const listener: IAvatarImageListener = {
                disposed: false,
                avatarImageReady: (): void =>
                {
                    listener.disposed = true;
                    resolve();
                }
            };

            renderManager.downloadFigure(container, listener);
        }), FIGURE_TIMEOUT_MS);
    }

    private requireRenderManager(): AvatarRenderManager
    {
        if(this._renderManager === null)
        {
            throw new Error('AvatarRenderService has not finished booting');
        }

        return this._renderManager;
    }

    private async initialize(): Promise<void>
    {
        const context = Core.instantiate() as CoreComponentContext;

        context.registerInterface(IID_Core, context);

        const assets = new AssetLibrary(context);

        context.attachComponent(assets, [IID_AssetLibrary]);

        await this.registerEmbeddedAvatarAssets(assets);

        context.initialize();

        const configuration = await this.createConfiguration(context);

        this._configuration = configuration;

        log.debug(`Avatar libraries: ${configuration.getProperty('flash.dynamic.avatar.download.url')}`);

        const renderManager = new AvatarRenderManager(context);

        context.attachComponent(renderManager, [IID_AvatarRenderManager]);

        await withTimeout(new Promise<void>((resolve) =>
        {
            if(renderManager.isReady)
            {
                resolve();

                return;
            }

            renderManager.events.once(AvatarRenderEvent.AVATAR_RENDER_READY, () => resolve());
        }), READY_TIMEOUT_MS);

        this._renderManager = renderManager;

        log.info('Avatar pipeline ready');
    }

    /**
	 * Brings up the real configuration manager against the hotel's own `external_variables`,
	 * so the imager resolves `flash.client.url` (and therefore the current asset build) the
	 * same way and at the same time the client does.
	 */
    private async createConfiguration(context: CoreComponentContext): Promise<HabboConfigurationManager>
    {
        const common = await this.readAvatarConfigFile('common_configuration_txt.txt');
        const configuration = new HabboConfigurationManager(context);

        configuration.setEmbeddedConfigurationAssets(common === null ? {} : {common_configuration: common});
        context.attachComponent(configuration, [IID_HabboConfigurationManager]);

        // `Component` defers initComponent() to a microtask, and that is where the embedded
        // configuration is parsed — reading properties before it lands gets empty strings.
        await Promise.resolve();

        configuration.updateEnvironmentId(this._config.environmentId);

        // The asset host is the one thing the imager knows better than the hotel config does:
        // it is told where to read, and every `${url.prefix}` in external_variables resolves
        // through it.
        configuration.setProperty('url.prefix', this._config.assetsBaseUrl);
        configuration.setProperty(HabboProperty.EXTERNAL_VARIABLES, this._config.externalVariablesUrl);

        await configuration.initConfigurationDownload();

        configuration.setProperty('url.prefix', this._config.assetsBaseUrl);

        return configuration;
    }

    /**
	 * Registers the embedded avatar XMLs as `XmlAsset`s, the same shape and under the same
	 * names `AvatarRenderManager.getEmbeddedAvatarAssetContent()` looks for.
	 */
    private async registerEmbeddedAvatarAssets(assets: AssetLibrary): Promise<void>
    {
        const declaration = assets.getAssetTypeDeclarationByMimeType('text/xml')
            ?? new AssetTypeDeclaration('text/xml', XmlAsset, null, 'xml');

        for(const assetName of EMBEDDED_AVATAR_XML_ASSETS)
        {
            const content = await this.readAvatarConfigFile(`${assetName}.xml`);

            if(content === null)
            {
                log.warn(`Missing embedded avatar asset: ${assetName}.xml`);

                continue;
            }

            const asset = new XmlAsset(declaration, assetName);

            asset.setUnknownContent(content);
            assets.setAsset(assetName, asset, true);
        }
    }

    private async readAvatarConfigFile(fileName: string): Promise<string | null>
    {
        try
        {
            return await readFile(join(this._config.avatarConfigDir, fileName), 'utf8');
        }
        catch
        {
            return null;
        }
    }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T>
{
    return new Promise<T>((resolve, reject) =>
    {
        const timer = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);

        promise.then(
            (value) =>
            {
                clearTimeout(timer);
                resolve(value);
            },
            (error) =>
            {
                clearTimeout(timer);
                reject(error);
            }
        );
    });
}
