import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_AssetLibrary} from '@iid/IIDAssetLibrary';
import type {IHabboConfigurationManager} from '../configuration/IHabboConfigurationManager';
import type {IAssetLibrary} from '@core/assets';
import type {IAvatarRenderManager} from './IAvatarRenderManager';
import type {IAvatarImage} from './IAvatarImage';
import type {IAvatarFigureContainer} from './IAvatarFigureContainer';
import type {IAvatarImageListener} from './IAvatarImageListener';
import type {IAvatarEffectListener} from './IAvatarEffectListener';
import type {IFigureData} from './structure/IFigureData';
import {AvatarStructure} from './AvatarStructure';
import {AssetAliasCollection} from './alias/AssetAliasCollection';
import {AvatarFigureContainer} from './AvatarFigureContainer';
import {AvatarImage} from './AvatarImage';
import {PlaceholderAvatarImage} from './PlaceholderAvatarImage';
import {AvatarAssetDownloadManager} from './AvatarAssetDownloadManager';
import {EffectAssetDownloadManager} from './EffectAssetDownloadManager';
import {AvatarRenderEvent} from './enum/AvatarRenderEvent';
import {EMBEDDED_AVATAR_ANIMATION_DATA} from './structure/EmbeddedAvatarAnimationData';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('AvatarRenderManager');

/**
 * Main avatar render manager component. Initializes and manages the avatar rendering system.
 *
 * @see sources/win63_version/habbo/avatar/class_1808.as
 * @see sources/flash_version/com/sulake/habbo/avatar/AvatarRenderManager.as
 */
export class AvatarRenderManager extends Component implements IAvatarRenderManager
{
	private static readonly AVATAR_PLACEHOLDER_FIGURE: string = 'hd-99999-99999';

	private _structure: AvatarStructure;
	private _aliasCollection: AssetAliasCollection;
	private _avatarAssetDownloadManager: AvatarAssetDownloadManager | null = null;
	private _effectAssetDownloadManager: EffectAssetDownloadManager | null = null;
	private _placeholderFigure: AvatarFigureContainer | null = null;
	private _pendingFigureDownloads: [IAvatarFigureContainer, IAvatarImageListener | null][] = [];
	private _configuration: IHabboConfigurationManager | null = null;
	private _assetLibrary: IAssetLibrary | null = null;
	private _figureMapReady: boolean = false;
	private _mandatoryLibrariesReady: boolean = false;
	private _structureReady: boolean = false;
	private _geometryReady: boolean = false;
	private _partSetsReady: boolean = false;
	private _actionsReady: boolean = false;
	private _animationsReady: boolean = false;
	private _effectMapReady: boolean = false;

	constructor(context: IContext)
	{
		super(context);

		this._structure = new AvatarStructure();
		this._aliasCollection = new AssetAliasCollection();
	}

	private _isReady: boolean = false;

	public get isReady(): boolean
	{
		return this._isReady;
	}

	public get effectMap(): Map<string, any>
	{
		if (!this._effectAssetDownloadManager) return new Map();

		return this._effectAssetDownloadManager.effectMap;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboConfigurationManager,
				(config: IHabboConfigurationManager | null) =>
				{
					this._configuration = config;
				},
				true
			),
			new ComponentDependency(
				IID_AssetLibrary,
				(assets: IAssetLibrary | null) =>
				{
					this._assetLibrary = assets;
				},
				true
			),
		];
	}
	// AS3: sources/win63_version/habbo/avatar/class_49.as::initComponent()
	protected override initComponent(): void
	{
		this.onConfigurationReady();
	}

	public createAvatarImage(
		figureString: string,
		scale: string,
		gender: string,
		listener: IAvatarImageListener | null = null,
		effectListener: IAvatarEffectListener | null = null
	): IAvatarImage | null
	{
		const figureContainer = new AvatarFigureContainer(figureString);

		if (this._avatarAssetDownloadManager === null)
		{
			this._pendingFigureDownloads.push([figureContainer, listener]);

			return null;
		}

		if (gender)
		{
			this.validateAvatarFigure(figureContainer, gender);
		}

		if (this._avatarAssetDownloadManager.isReady(figureContainer))
		{
			return new AvatarImage(
				this._structure,
				this._aliasCollection,
				figureContainer,
				scale,
				this._effectAssetDownloadManager,
				effectListener
			);
		}

		if (this._placeholderFigure === null)
		{
			this._placeholderFigure = new AvatarFigureContainer(AvatarRenderManager.AVATAR_PLACEHOLDER_FIGURE);
		}

		this._avatarAssetDownloadManager.loadFigureSetData(figureContainer, listener);

		return new PlaceholderAvatarImage(
			this._structure,
			this._aliasCollection,
			this._placeholderFigure,
			scale,
			this._effectAssetDownloadManager
		);
	}

	public getFigureData(): IFigureData
	{
		return this._structure.figureData;
	}

	public getFigureStringWithFigureIds(figureString: string, gender: string, figureIds: number[]): string
	{
		const figure = new AvatarFigureContainer(figureString);

		for (const setId of figureIds)
		{
			const partSet = this._structure.figureData.getFigurePartSet(setId);

			if (partSet)
			{
				figure.updatePart(partSet.type, setId, [0]);
			}
		}

		return figure.getFigureString();
	}

	public isValidFigureSetForGender(setId: number, gender: string): boolean
	{
		const partSet = this._structure.figureData.getFigurePartSet(setId);

		if (!partSet) return false;

		return partSet.gender === gender || partSet.gender === 'U';
	}

	public getMandatoryAvatarPartSetIds(gender: string, clubLevel: number): string[]
	{
		return this._structure.getMandatorySetTypeIds(gender, clubLevel);
	}

	public createFigureContainer(figureString: string): IAvatarFigureContainer
	{
		return new AvatarFigureContainer(figureString);
	}

	public isFigureReady(figure: IAvatarFigureContainer): boolean
	{
		if (!this._avatarAssetDownloadManager) return false;

		return this._avatarAssetDownloadManager.isReady(figure);
	}

	public downloadFigure(figure: IAvatarFigureContainer, listener: IAvatarImageListener | null = null): void
	{
		if (!this._avatarAssetDownloadManager)
		{
			this._pendingFigureDownloads.push([figure, listener]);

			return;
		}

		this._avatarAssetDownloadManager.loadFigureSetData(figure, listener);
	}

	public injectFigureData(data: any): void
	{
		this._structure.injectFigureData(data);
	}

	public dispose(): void
	{
		if (this._disposed) return;

		this._disposed = true;

		if (this._avatarAssetDownloadManager)
		{
			this._avatarAssetDownloadManager.dispose();
			this._avatarAssetDownloadManager = null;
		}

		if (this._effectAssetDownloadManager)
		{
			this._effectAssetDownloadManager.dispose();
			this._effectAssetDownloadManager = null;
		}

		this._pendingFigureDownloads.length = 0;
		this._placeholderFigure = null;
		this._structure.dispose();
		this._aliasCollection.dispose();

		super.dispose();
	}

	/**
	 * Called by HeliumMain when game_data hash URLs become available.
	 * Loads all avatar resources whose URLs are derived from game_data hashes
	 * (avatar.actions.url, avatar.figuredata.url, avatar.figuremap.url, etc.)
	 * and any remaining resources not yet loaded.
	 */
	public onGameDataReady(): void
	{
		if (!this._configuration) return;

		log.info('Game data URLs available, loading avatar resources...');

		// Load hash-based resources (URLs set by HeliumMain.onGameDataResourcesReady)
		this.loadActions();
		this.loadFigureData();

		// Initialize download managers (figure map + effect map)
		this.initDownloadManagers();
	}

	/**
	 * AS3 initComponent(): loads geometry/partsets from asset library (embedded in .nitro bundles),
	 * registers a hardcoded Default action, and marks animations ready (per-effect only).
	 *
	 * @see sources/flash_version/com/sulake/habbo/avatar/AvatarRenderManager.as lines 67-82
	 */
	private onConfigurationReady(): void
	{
		if (!this._configuration) return;

		log.info('Configuration ready, loading avatar data...');

		// AS3 line 71: hardcoded Default action as initial fallback
		this._structure.initActions({
			action: [{
				id: 'Default',
				precedence: '1000',
				state: 'std',
				main: '1',
				isdefault: '1',
				geometrytype: 'vertical',
				activepartset: 'figure',
				assetpartdefinition: 'std'
			}]
		});
		this._actionsReady = true;
		this._structure.initAnimation(EMBEDDED_AVATAR_ANIMATION_DATA);
		this._animationsReady = true;

		// AS3 uses embedded HabboAvatarPartSets; geometry still follows the existing converted web data path until its XML parser is fully ported.
		this.loadGeometry();
		this.loadPartSets();

		this.checkReady();
	}

	/**
	 * Load actions from habbo_avatar_actions URL.
	 * Uses updateActions() to append to the hardcoded Default action.
	 *
	 * @see AS3 RoomEngine._Str_1200() loads HabboAvatarActions.xml externally
	 */
	private async loadActions(): Promise<void>
	{
		try
		{
			const url = this._configuration?.getProperty('avatar.actions.url');

			if (url)
			{
				const response = await fetch(url);
				const data = await response.json();

				this._structure.updateActions(data);
			}

			this.checkReady();
		}
		catch (error)
		{
			log.error('Failed to load actions data', error);
		}
	}

	/**
	 * Fetches avatar geometry JSON from configured URL.
	 * TODO(AS3): sources/win63_version/habbo/avatar/class_49.as::initComponent() should read HabboAvatarGeometry from assets once AvatarModelGeometry supports AS3 XML directly.
	 */
	private async loadGeometry(): Promise<void>
	{
		try
		{
			const url = this._configuration?.getProperty('avatar.geometry.url');

			if (url)
			{
				log.info(`Loading geometry from: ${url}`);

				const response = await fetch(url);

				if (!response.ok)
				{
					log.error(`Geometry fetch failed: ${response.status} ${response.statusText}`);
				}
				else
				{
					const data = await response.json();

					this._structure.initGeometry(data.geometry ?? data);
					log.info('Loaded geometry data');
				}
			}
			else
			{
				log.warn('No avatar.geometry.url configured');
			}

			this._geometryReady = true;
			this.checkReady();
		}
		catch (error)
		{
			log.error('Failed to load geometry data', error);
			this._geometryReady = true;
			this.checkReady();
		}
	}

	// AS3: sources/win63_version/habbo/avatar/class_49.as::initComponent()
	private loadPartSets(): void
	{
		this._structure.initPartSets(this.getEmbeddedAvatarAssetContent('HabboAvatarPartSets'));
		this._partSetsReady = true;
		this.checkReady();
	}

	// AS3: sources/win63_version/habbo/avatar/class_49.as::initComponent()
	private getEmbeddedAvatarAssetContent(assetName: string): unknown | null
	{
		if (!this._assetLibrary || !this._assetLibrary.hasAsset(assetName))
		{
			log.warn(`Missing embedded avatar asset: ${assetName}`);

			return null;
		}

		return this._assetLibrary.getAssetByName(assetName)?.content ?? null;
	}
	private async loadFigureData(): Promise<void>
	{
		try
		{
			const url = this._configuration?.getProperty('avatar.figuredata.url');

			// log.debug(`Loading figure data from: ${url}`);

			if (url)
			{
				const response = await fetch(url);

				if (!response.ok)
				{
					log.error(`Figure data fetch failed: ${response.status} ${response.statusText}`);
				}
				else
				{
					const text = await response.text();

					// Try parsing as JSON first
					try
					{
						const data = JSON.parse(text);
						const figureData = data.figuredata ?? data.figureData ?? data;

						// log.info(`Figure data parsed as JSON. Top keys: ${Object.keys(data).join(', ')}`);
						this._structure.initFigureData(figureData);
					}
					catch (parseError)
					{
						// If JSON parsing fails, try as XML
						// log.info('Figure data is not JSON, trying XML parser...');
						const xmlData = this.parseFigureDataXml(text);

						if (xmlData)
						{
							this._structure.initFigureData(xmlData);
						}
						else
						{
							log.error('Failed to parse figure data as JSON or XML');
						}
					}
				}
			}

			this._structureReady = true;
			this.checkReady();
		}
		catch (error)
		{
			log.error('Failed to load figure data', error);
			this._structureReady = true;
			this.checkReady();
		}
	}

	private initDownloadManagers(): void
	{
		const avatarDownloadUrl = this.getAvatarDownloadUrlTemplate(
			'flash.dynamic.avatar.download.url',
			'flash.dynamic.avatar.download.name.template',
			'avatar.asset.url');
		const effectDownloadUrl = this.getAvatarDownloadUrlTemplate(
			'flash.dynamic.effect.download.url',
			'flash.dynamic.effect.download.name.template',
			'avatar.effect.url') || avatarDownloadUrl;

		// log.debug(`Avatar download URL: ${avatarDownloadUrl}`);
		// log.debug(`Effect download URL: ${effectDownloadUrl}`);

		if (!this._assetLibrary)
		{
			log.error('AssetLibrary not available for download managers');

			return;
		}

		this._mandatoryLibrariesReady = false;

		// Connect alias collection to asset library for sprite resolution
		this._aliasCollection.setAssetLibrary(this._assetLibrary);

		this._avatarAssetDownloadManager = new AvatarAssetDownloadManager(
			avatarDownloadUrl,
			this._structure,
			this._assetLibrary,
			this._aliasCollection,
			() => this._isReady,
			() =>
			{
				this._mandatoryLibrariesReady = true;
				this.checkReady();
			}
		);

		this._effectAssetDownloadManager = new EffectAssetDownloadManager(
			effectDownloadUrl,
			this._structure,
			this._assetLibrary
		);

		// Load figure map
		this.loadFigureMap();

		// Load effect map
		this.loadEffectMap();
	}

	private getAvatarDownloadUrlTemplate(downloadUrlKey: string, nameTemplateKey: string, fallbackUrlKey: string): string
	{
		if (!this._configuration)
		{
			return '';
		}

		const downloadUrl = this._configuration.getProperty(downloadUrlKey);

		if (this.isResolvedDownloadUrlTemplate(downloadUrl))
		{
			return downloadUrl + this._configuration.getProperty(nameTemplateKey);
		}

		const fallbackUrl = this._configuration.getProperty(fallbackUrlKey);

		if (!this.isResolvedDownloadUrlTemplate(fallbackUrl))
		{
			return '';
		}

		return fallbackUrl;
	}

	private isResolvedDownloadUrlTemplate(url: string): boolean
	{
		return !!url && url.indexOf('${') < 0;
	}

	private async loadFigureMap(): Promise<void>
	{
		try
		{
			const url = this._configuration?.getProperty('avatar.figuremap.url');

			log.info(`Loading figure map from: ${url}`);

			if (url && this._avatarAssetDownloadManager)
			{
				const response = await fetch(url);

				if (!response.ok)
				{
					log.error(`Figure map fetch failed: ${response.status} ${response.statusText}`);
				}
				else
				{
					const text = await response.text();

					// Try parsing as JSON first
					try
					{
						const data = JSON.parse(text);

						this._avatarAssetDownloadManager.loadFigureMap(data);
					}
					catch (parseError)
					{
						// If JSON parsing fails, try as XML
						log.info('Figure map is not JSON, trying XML parser...');

						const xmlData = this.parseFigureMapXml(text);

						if (xmlData)
						{
							this._avatarAssetDownloadManager.loadFigureMap(xmlData);
						}
						else
						{
							log.error('Failed to parse figure map as JSON or XML');
						}
					}
				}
			}

			this._figureMapReady = true;
			this.checkReady();
		}
		catch (error)
		{
			log.error('Failed to load figure map', error);
			this._figureMapReady = true;
			this.checkReady();
		}
	}

	/**
	 * Parses figure map XML into the JSON format expected by generateMap.
	 *
	 * AS3 uses XML natively. The figure map XML format is:
	 * <map><lib id="..." revision="..."><part type="..." id="..."/></lib></map>
	 */
	private parseFigureMapXml(xmlText: string): any | null
	{
		try
		{
			const parser = new DOMParser();
			const doc = parser.parseFromString(xmlText, 'text/xml');
			const libElements = doc.querySelectorAll('lib');

			if (libElements.length === 0) return null;

			const libraries: any[] = [];

			for (const libEl of libElements)
			{
				const id = libEl.getAttribute('id') || '';
				const revision = libEl.getAttribute('revision') || '';
				const parts: any[] = [];

				const partElements = libEl.querySelectorAll('part');

				for (const partEl of partElements)
				{
					parts.push({
						type: partEl.getAttribute('type') || '',
						id: partEl.getAttribute('id') || ''
					});
				}

				libraries.push({id, revision, parts});
			}

			log.info(`Parsed XML figure map: ${libraries.length} libraries`);

			return {libraries};
		}
		catch (error)
		{
			log.error('XML parsing error', error);

			return null;
		}
	}

	/**
	 * Parses figure data XML into the JSON format expected by FigureSetData.parse().
	 *
	 * XML format:
	 * <figuredata>
	 *   <colors><palette id="1"><color id="0" index="0" club="0" selectable="1">FFFFFF</color></palette></colors>
	 *   <sets><settype type="hd" paletteid="1" ...><set id="1" gender="M" ...><part type="hd" id="1" .../></set></settype></sets>
	 * </figuredata>
	 */
	private parseFigureDataXml(xmlText: string): any | null
	{
		try
		{
			const parser = new DOMParser();
			const doc = parser.parseFromString(xmlText, 'text/xml');

			// Parse palettes
			const palettes: any[] = [];
			const paletteElements = doc.querySelectorAll('colors > palette');

			for (const paletteEl of paletteElements)
			{
				const colors: any[] = [];
				const colorElements = paletteEl.querySelectorAll('color');

				for (const colorEl of colorElements)
				{
					colors.push({
						id: parseInt(colorEl.getAttribute('id') || '0'),
						index: parseInt(colorEl.getAttribute('index') || '0'),
						club: parseInt(colorEl.getAttribute('club') || '0'),
						selectable: colorEl.getAttribute('selectable') === '1',
						hexCode: colorEl.textContent?.trim() || '0'
					});
				}

				palettes.push({
					id: parseInt(paletteEl.getAttribute('id') || '0'),
					colors
				});
			}

			// Parse set types
			const setTypes: any[] = [];
			const setTypeElements = doc.querySelectorAll('sets > settype');

			for (const setTypeEl of setTypeElements)
			{
				const sets: any[] = [];
				const setElements = setTypeEl.querySelectorAll('set');

				for (const setEl of setElements)
				{
					const parts: any[] = [];
					const partElements = setEl.querySelectorAll('part');

					for (const partEl of partElements)
					{
						parts.push({
							id: parseInt(partEl.getAttribute('id') || '0'),
							type: partEl.getAttribute('type') || '',
							colorable: partEl.getAttribute('colorable') === '1',
							index: parseInt(partEl.getAttribute('index') || '0'),
							colorindex: parseInt(partEl.getAttribute('colorindex') || '0')
						});
					}

					const hiddenLayers: any[] = [];
					const layerElements = setEl.querySelectorAll('hiddenlayers > layer');

					for (const layerEl of layerElements)
					{
						hiddenLayers.push({
							partType: layerEl.getAttribute('parttype') || ''
						});
					}

					sets.push({
						id: parseInt(setEl.getAttribute('id') || '0'),
						gender: setEl.getAttribute('gender') || '',
						club: parseInt(setEl.getAttribute('club') || '0'),
						colorable: setEl.getAttribute('colorable') === '1',
						selectable: setEl.getAttribute('selectable') === '1',
						preselectable: setEl.getAttribute('preselectable') === '1',
						sellable: setEl.getAttribute('sellable') === '1',
						parts,
						hiddenLayers: hiddenLayers.length > 0 ? hiddenLayers : undefined
					});
				}

				setTypes.push({
					type: setTypeEl.getAttribute('type') || '',
					paletteId: parseInt(setTypeEl.getAttribute('paletteid') || '0'),
					mandatory_m_0: setTypeEl.getAttribute('mand_m_0') === '1',
					mandatory_m_1: setTypeEl.getAttribute('mand_m_1') === '1',
					mandatory_f_0: setTypeEl.getAttribute('mand_f_0') === '1',
					mandatory_f_1: setTypeEl.getAttribute('mand_f_1') === '1',
					sets
				});
			}

			if (palettes.length === 0 && setTypes.length === 0) return null;

			log.info(`Parsed XML figure data: ${palettes.length} palettes, ${setTypes.length} set types`);

			return {palettes, setTypes};
		}
		catch (error)
		{
			log.error('Figure data XML parsing error', error);

			return null;
		}
	}

	private async loadEffectMap(): Promise<void>
	{
		try
		{
			const url = this._configuration?.getProperty('avatar.effectmap.url');

			if (url && this._effectAssetDownloadManager)
			{
				const response = await fetch(url);
				const data = await response.json();

				this._effectAssetDownloadManager.loadEffectMap(data);
			}

			this._effectMapReady = true;
			this.checkReady();
		}
		catch (error)
		{
			log.error('Failed to load effect map', error);
			this._effectMapReady = true;
			this.checkReady();
		}
	}

	private checkReady(): void
	{
		if (this._isReady) return;

		if (this._geometryReady &&
			this._partSetsReady &&
			this._actionsReady &&
			this._animationsReady &&
			this._structureReady &&
			this._figureMapReady &&
			this._mandatoryLibrariesReady &&
			this._effectMapReady)
		{
			this._isReady = true;

			log.info('Avatar render system ready');
			this.events.emit(AvatarRenderEvent.AVATAR_RENDER_READY);
			this._avatarAssetDownloadManager?.processInitBuffer();
			this.purgeInitDownloadBuffer();
		}
	}

	private purgeInitDownloadBuffer(): void
	{
		if (!this._avatarAssetDownloadManager) return;

		const buffer = this._pendingFigureDownloads;

		this._pendingFigureDownloads = [];

		for (const [figure, listener] of buffer)
		{
			if (listener !== null && !listener.disposed)
			{
				this._avatarAssetDownloadManager.loadFigureSetData(figure, listener);
			}
		}
	}

	private validateAvatarFigure(figure: AvatarFigureContainer, gender: string): void
	{
		const mandatoryTypes = this._structure.getMandatorySetTypeIds(gender, 0);

		for (const partType of mandatoryTypes)
		{
			if (!figure.hasPartType(partType))
			{
				const defaultPartSet = this._structure.getDefaultPartSet(partType, gender);

				if (defaultPartSet)
				{
					figure.updatePart(partType, defaultPartSet.id, [0]);
				}
			}
		}
	}
}
