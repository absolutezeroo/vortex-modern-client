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
import {AvatarStructureDownload} from './structure/AvatarStructureDownload';
import type {IStructureData} from './structure/IStructureData';
import {parseXmlDocument} from './structure/AvatarXmlUtils';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('AvatarRenderManager');

const EMBEDDED_AVATAR_ACTIONS_XML = `<actions><action  id="Default" precedence="1000" state="std" main="1" isdefault="1" geometrytype="vertical" activepartset="figure" assetpartdefinition="std"/>	<!-- baked in actions for snowwar -->
				<action  id="SnowWarRun" state="swrun" precedence="104" main="1" geometrytype="vertical" activepartset="snowwarrun" assetpartdefinition="swrun" prevents="fx.2,fx.3,fx.6,fx.14,fx.15,fx.17,fx.18,fx.19,fx.20,fx.21,fx.22,fx.33,fx.34,fx.35,fx.36,fx.38,fx.39,fx.45,fx.46,fx.48,fx.54,fx.55,fx.56,fx.57,fx.58,fx.69,fx.71,fx.72,fx.89,fx.90,fx.91,fx.92,fx.94,fx.97,fx.100,fx.104,fx.107,fx.108,fx.115,fx.116,fx.117,fx.118,fx.119,fx.120,fx.121,fx.122,fx.123,fx.124,fx.125,fx.127,fx.129,fx.130,fx.131,fx.132,fx.134,fx.135,fx.136,fx.137,fx.138,fx.139,fx.140,fx.141,fx.142,fx.143,fx.144,fx.145,fx.146,fx.147,fx.148,fx.149,fx.150,fx.151,fx.152,fx.153,fx.154,fx.155,fx.156,fx.157,fx.158,fx.159,fx.160,fx.161,fx.162,fx.164,fx.165,fx.166,fx167,fx168,fx169,fx170,fx171,fx172,fx173,fx174,fx175,fx176,dance"/>
				<action  id="SnowWarDieFront" state="swdiefront" precedence="105" main="1" geometrytype="swhorizontal" activepartset="snowwardiefront" assetpartdefinition="swdie" startfromframezero="true" prevents="fx.2,fx.3,fx.6,fx.14,fx.15,fx.17,fx.18,fx.19,fx.20,fx.21,fx.22,fx.33,fx.34,fx.35,fx.36,fx.38,fx.39,fx.45,fx.46,fx.48,fx.54,fx.55,fx.56,fx.57,fx.58,fx.69,fx.71,fx.72,fx.89,fx.90,fx.91,fx.92,fx.94,fx.97,fx.100,fx.104,fx.105,fx.107,fx.108,fx.115,fx.116,fx.117,fx.118,fx.119,fx.120,fx.121,fx.122,fx.123,fx.124,fx.125,fx.127,fx.129,fx.130,fx.131,fx.132,fx.134,fx.135,fx.136,fx.137,fx.138,fx.139,fx.140,fx.141,fx.142,fx.143,fx.144,fx.145,fx.146,fx.147,fx.148,fx.149,fx.150,fx.151,fx.152,fx.153,fx.154,fx.155,fx.156,fx.157,fx.158,fx.159,fx.160,fx.161,fx.162,fx.164,fx.165,fx.166,fx167,fx168,fx169,fx170,fx171,fx172,fx173,fx174,fx175,fx176,dance"/>
				<action  id="SnowWarDieBack" state="swdieback" precedence="106" main="1" geometrytype="swhorizontal" activepartset="snowwardieback" assetpartdefinition="swdie" startfromframezero="true" prevents="fx.2,fx.3,fx.6,fx.14,fx.15,fx.17,fx.18,fx.19,fx.20,fx.21,fx.22,fx.33,fx.34,fx.35,fx.36,fx.38,fx.39,fx.45,fx.46,fx.48,fx.54,fx.55,fx.56,fx.57,fx.58,fx.69,fx.71,fx.72,fx.89,fx.90,fx.91,fx.92,fx.94,fx.97,fx.100,fx.104,fx.105,fx.107,fx.108,fx.115,fx.116,fx.117,fx.118,fx.119,fx.120,fx.121,fx.122,fx.123,fx.124,fx.125,fx.127,fx.129,fx.130,fx.131,fx.132,fx.134,fx.135,fx.140,fx.141,fx.142,fx.143,fx.144,fx.145,fx.146,fx.147,fx.148,fx.149,fx.150,fx.151,fx.152,fx.153,fx.154,fx.155,fx.156,fx.157,fx.158,fx.159,fx.160,fx.161,fx.162,fx.164,fx.165,fx.166,fx167,fx168,fx169,fx170,fx171,fx172,fx173,fx174,fx175,fx176,dance"/>
				<action  id="SnowWarPick" state="swpick" precedence="107" main="1" geometrytype="vertical" activepartset="snowwarpick" assetpartdefinition="swpick" startfromframezero="true" prevents="fx.2,fx.3,fx.6,fx.14,fx.15,fx.17,fx.18,fx.19,fx.20,fx.21,fx.22,fx.33,fx.34,fx.35,fx.36,fx.38,fx.39,fx.45,fx.46,fx.48,fx.54,fx.55,fx.56,fx.57,fx.58,fx.69,fx.71,fx.72,fx.89,fx.90,fx.91,fx.92,fx.94,fx.97,fx.100,fx.104,fx.105,fx.107,fx.108,fx.115,fx.116,fx.117,fx.118,fx.119,fx.120,fx.121,fx.122,fx.123,fx.124,fx.125,fx.127,fx.129,fx.130,fx.131,fx.132,fx.134,fx.135,fx.136,fx.137,fx.138,fx.139,fx.140,fx.141,fx.142,fx.143,fx.144,fx.145,fx.146,fx.147,fx.148,fx.149,fx.150,fx.151,fx.152,fx.153,fx.154,fx.155,fx.156,fx.157,fx.158,fx.159,fx.160,fx.161,fx.162,fx.164,fx.165,fx.166,fx167,fx168,fx169,fx170,fx171,fx172,fx173,fx174,fx175,fx176,dance"/>
				<action  id="SnowWarThrow" state="swthrow" precedence="108" main="1" geometrytype="vertical" activepartset="snowwarthrow" assetpartdefinition="swthrow" startfromframezero="true" prevents="fx.2,fx.3,fx.6,fx.14,fx.15,fx.17,fx.18,fx.19,fx.20,fx.21,fx.22,fx.33,fx.34,fx.35,fx.36,fx.38,fx.39,fx.45,fx.46,fx.48,fx.54,fx.55,fx.56,fx.57,fx.58,fx.69,fx.71,fx.72,fx.89,fx.90,fx.91,fx.92,fx.94,fx.97,fx.100,fx.104,fx.105,fx.107,fx.108,fx.115,fx.116,fx.117,fx.118,fx.119,fx.120,fx.121,fx.122,fx.123,fx.124,fx.125,fx.127,fx.129,fx.130,fx.131,fx.132,fx.134,fx.135,fx.136,fx.137,fx.138,fx.139,fx.140,fx.141,fx.142,fx.143,fx.144,fx.145,fx.146,fx.147,fx.148,fx.149,fx.150,fx.151,fx.152,fx.153,fx.154,fx.155,fx.156,fx.157,fx.158,fx.159,fx.160,fx.161,fx.162,fx.164,fx.165,fx.166,fx167,fx168,fx169,fx170,fx171,fx172,fx173,fx.174,fx175,fx176,dance"/>
			</actions>`;

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
	private _structureDownload: AvatarStructureDownload | null = null;

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
				true,
				[{type: 'complete', callback: this.onConfigurationComplete.bind(this)}]
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
		this._structureDownload = null;
		this._placeholderFigure = null;
		this._structure.dispose();
		this._aliasCollection.dispose();

		super.dispose();
	}

	/**
	 * AS3 initComponent(): loads embedded avatar XML assets from AssetLibrary.
	 *
	 * @see sources/win63_version/habbo/avatar/class_49.as
	 */
	private onConfigurationReady(): void
	{
		if (!this._assetLibrary) return;

		log.info('Loading embedded avatar XML assets...');

		const embeddedActions = parseXmlDocument(EMBEDDED_AVATAR_ACTIONS_XML);

		this._structure.initGeometry(this.getEmbeddedAvatarAssetContent('HabboAvatarGeometry'));
		this._geometryReady = true;
		this._structure.initPartSets(this.getEmbeddedAvatarAssetContent('HabboAvatarPartSets'));
		this._partSetsReady = true;

		if (embeddedActions !== null)
		{
			this._structure.initActions(this._assetLibrary, embeddedActions);
		}

		this._structure.initAnimation(this.getEmbeddedAvatarAssetContent('HabboAvatarAnimation'));
		this._animationsReady = true;
		this._structure.initFigureData(this.getEmbeddedAvatarAssetContent('HabboAvatarFigure'));

		this.checkReady();
	}

	// AS3: sources/win63_version/habbo/avatar/class_49.as::onConfigurationComplete()
	public onConfigurationComplete(): void
	{
		void this.loadActions();
		this.loadFigureData();
		this.initDownloadManagers();
	}

	/**
	 * AS3 requestActions()/onAvatarActionsLoaded(): loads HabboAvatarActions XML and updates actions.
	 *
	 * @see sources/win63_version/habbo/avatar/class_49.as::requestActions()
	 * @see sources/win63_version/habbo/avatar/class_49.as::onAvatarActionsLoaded()
	 */
	private async loadActions(): Promise<void>
	{
		try
		{
			let data = this.getEmbeddedAvatarAssetContent('HabboAvatarActions', false);

			if (data === null)
			{
				const url = this.getAvatarActionsUrl();

				if (url !== '')
				{
					data = await this.loadXmlFromUrl(url, 'HabboAvatarActions');
				}
			}

			if (data !== null)
			{
				this._structure.updateActions(data);
				this._actionsReady = true;
				this.checkReady();
			}
		}
		catch (error)
		{
			log.error('Failed to load actions data', error);
		}
	}

	// AS3: sources/win63_version/habbo/avatar/class_49.as::initComponent()
	private getEmbeddedAvatarAssetContent(assetName: string, warnIfMissing: boolean = true): unknown | null
	{
		if (!this._assetLibrary || !this._assetLibrary.hasAsset(assetName))
		{
			if (warnIfMissing)
			{
				log.warn(`Missing embedded avatar asset: ${assetName}`);
			}

			return null;
		}

		return this._assetLibrary.getAssetByName(assetName)?.content ?? null;
	}

	// AS3: sources/win63_version/habbo/avatar/class_49.as::onConfigurationComplete()
	private loadFigureData(): void
	{
		const url = this._configuration?.getProperty('external.figurepartlist.txt') ?? '';

		if (url === '')
		{
			return;
		}

		this._structureDownload = new AvatarStructureDownload(url, this._structure.figureData as unknown as IStructureData);
		this._structureDownload.once(AvatarStructureDownload.STRUCTURE_DONE, () =>
		{
			this._structureDownload = null;
			this._structure.init();
			this._structureReady = true;
			this.checkReady();
		});
	}

	private getAvatarActionsUrl(): string
	{
		if (!this._configuration)
		{
			return '';
		}

		const dynamicAvatarUrl = this._configuration.getProperty('flash.dynamic.avatar.download.url');

		if (this.isResolvedDownloadUrlTemplate(dynamicAvatarUrl))
		{
			return dynamicAvatarUrl + 'HabboAvatarActions.xml';
		}

		return '';
	}

	private getEffectMapUrl(): string
	{
		if (!this._configuration)
		{
			return '';
		}

		const dynamicAvatarUrl = this._configuration.getProperty('flash.dynamic.avatar.download.url');

		return this.isResolvedDownloadUrlTemplate(dynamicAvatarUrl) ? dynamicAvatarUrl + 'effectmap.xml' : '';
	}

	private async loadXmlFromUrl(url: string, assetName: string): Promise<Document | null>
	{
		const response = await fetch(url);

		if (!response.ok)
		{
			throw new Error(`${assetName} fetch failed: ${response.status} ${response.statusText}`);
		}

		const text = await response.text();
		const document = parseXmlDocument(text);

		if (document === null)
		{
			throw new Error(`${assetName} is not valid XML`);
		}

		return document;
	}

	// AS3: sources/win63_version/habbo/avatar/class_49.as::onConfigurationComplete()
	private initDownloadManagers(): void
	{
		const avatarDownloadUrl = this.getAvatarDownloadUrlTemplate(
			'flash.dynamic.avatar.download.url',
			'flash.dynamic.avatar.download.name.template');
		const effectDownloadUrl = avatarDownloadUrl;

		if (!this._assetLibrary)
		{
			log.error('AssetLibrary not available for download managers');

			return;
		}

		// Connect alias collection to asset library for sprite resolution
		this._aliasCollection.setAssetLibrary(this._assetLibrary);

		if (this._avatarAssetDownloadManager === null)
		{
			this._mandatoryLibrariesReady = false;
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

			this.loadFigureMap();
		}

		if (this._effectAssetDownloadManager === null)
		{
			this._effectAssetDownloadManager = new EffectAssetDownloadManager(
				effectDownloadUrl,
				this._structure,
				this._assetLibrary
			);

			this.loadEffectMap();
		}
	}

	private getAvatarDownloadUrlTemplate(downloadUrlKey: string, nameTemplateKey: string): string
	{
		if (!this._configuration)
		{
			return '';
		}

		const downloadUrl = this._configuration.getProperty(downloadUrlKey);

		if (!this.isResolvedDownloadUrlTemplate(downloadUrl))
		{
			return '';
		}

		return downloadUrl + this._configuration.getProperty(nameTemplateKey);
	}

	private isResolvedDownloadUrlTemplate(url: string): boolean
	{
		return !!url && url.indexOf('${') < 0;
	}

	private async loadFigureMap(): Promise<void>
	{
		try
		{
			const url = this._configuration?.getProperty('flash.dynamic.avatar.download.configuration') ?? '';

			if (url === '' || !this._avatarAssetDownloadManager)
			{
				return;
			}

			const response = await fetch(url);

			if (!response.ok)
			{
				throw new Error(`Figure map fetch failed: ${response.status} ${response.statusText}`);
			}

			const text = await response.text();
			let data = this.parseFigureMapXml(text);
			const trimmed = text.trim();

			if (data === null && (trimmed.startsWith('{') || trimmed.startsWith('[')))
			{
				data = JSON.parse(trimmed);
			}

			if (data === null)
			{
				throw new Error('Figure map is not valid XML');
			}

			this._avatarAssetDownloadManager.loadFigureMap(data);
			this._figureMapReady = true;
			this.checkReady();
		}
		catch (error)
		{
			log.error('Failed to load figure map', error);
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

	// AS3: sources/win63_version/habbo/avatar/class_49.as::onConfigurationComplete()
	private async loadEffectMap(): Promise<void>
	{
		try
		{
			const url = this.getEffectMapUrl();

			if (url !== '' && this._effectAssetDownloadManager)
			{
				const data = await this.loadXmlFromUrl(url, 'effectmap');

				if (data !== null)
				{
					this._effectAssetDownloadManager.loadEffectMap(data);
				}
			}

			this._effectMapReady = true;
			this.checkReady();
		}
		catch (error)
		{
			log.error('Failed to load effect map', error);
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
