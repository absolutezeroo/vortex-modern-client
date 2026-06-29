import EventEmitter from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets';
import type {IAvatarEffectListener} from './IAvatarEffectListener';
import type {AvatarStructure} from './AvatarStructure';
import {EffectAssetDownloadLibrary} from './EffectAssetDownloadLibrary';

/**
 * Manages downloading avatar effect asset libraries.
 *
 * Parses the effect map to create effect-ID-to-library mappings, then downloads
 * the required libraries when an effect's assets are requested. Libraries are
 * queued and downloaded with a maximum of 2 simultaneous downloads.
 * Listeners are notified when all libraries for a given effect are ready.
 *
 * Mandatory effects are dance.1 through dance.4, which are loaded immediately
 * after the effect map is parsed.
 *
 * In AS3, this extends EventDispatcherWrapper and uses Timer + URLRequest for
 * download scheduling. The effect map key is the string representation of the effect ID.
 *
 * @see sources/win63_version/habbo/avatar/EffectAssetDownloadManager.as
 * @see sources/flash_version/com/sulake/habbo/avatar/EffectAssetDownloadManager.as
 */
export class EffectAssetDownloadManager extends EventEmitter
{
	public static readonly LIBRARY_LOADED: string = 'EADM_LIBRARY_LOADED';

	private static readonly MAX_SIMULTANEOUS_DOWNLOADS: number = 2;
	private static readonly MANDATORY_EFFECT_IDS: string[] = ['dance.1', 'dance.2', 'dance.3', 'dance.4'];

	private _structure: AvatarStructure;
	private _incompleteEffects: Map<string, EffectAssetDownloadLibrary[]>;
	private _listeners: Map<string, IAvatarEffectListener[]>;
	private _pendingDownloadQueue: EffectAssetDownloadLibrary[];
	private _pendingDownloadSet: Set<EffectAssetDownloadLibrary>;
	private _currentDownloads: EffectAssetDownloadLibrary[];
	private _currentDownloadSet: Set<EffectAssetDownloadLibrary>;
	private _initDownloadBuffer: [number, IAvatarEffectListener | null][];
	private _isReady: boolean;
	private _downloadUrl: string;
	private _assetLibrary: IAssetLibrary;

	constructor(
		downloadUrl: string,
		structure: AvatarStructure,
		assetLibrary: IAssetLibrary
	)
	{
		super();

		this._structure = structure;
		this._downloadUrl = downloadUrl;
		this._assetLibrary = assetLibrary;
		this._effectMap = new Map();
		this._incompleteEffects = new Map();
		this._listeners = new Map();
		this._pendingDownloadQueue = [];
		this._pendingDownloadSet = new Set();
		this._currentDownloads = [];
		this._currentDownloadSet = new Set();
		this._initDownloadBuffer = [];
		this._isReady = false;
	}

	private _effectMap: Map<string, EffectAssetDownloadLibrary[]>;

	/**
	 * The underlying effect map for external access.
	 *
	 * In AS3, this is exposed as `get map()`.
	 */
	public get effectMap(): Map<string, EffectAssetDownloadLibrary[]>
	{
		return this._effectMap;
	}

	/**
	 * Parses effect map data and starts downloading mandatory effect libraries.
	 *
	 * In AS3, this is called after the effectmap XML is loaded from URL or cache.
	 * The map is generated, mandatory libs are queued, and _isReady is set to true.
	 *
	 * @param data - The effect map data (JSON, adapted from XML)
	 */
	public loadEffectMap(data: any): void
	{
		if (!data) return;

		if (typeof data === 'object' && Object.keys(data).length === 0) return;

		this.generateMap(data);
		this.loadMandatoryLibs();
		this._isReady = true;
		this.processInitBuffer();
	}

	/**
	 * Checks whether all required libraries for an effect are already downloaded.
	 *
	 * @param effectId - The effect ID to check
	 * @returns True if all required libraries are ready
	 */
	public isReady(effectId: number): boolean
	{
		if (!this._isReady) return false;

		const libs = this.getLibsToDownload(effectId);

		return libs.length === 0;
	}

	/**
	 * Initiates loading of all asset libraries required by the given effect.
	 *
	 * If the manager is not yet ready, the request is buffered for later processing.
	 * If all libraries are already downloaded, the listener is notified immediately.
	 * Otherwise, the required libraries are queued for download and the listener
	 * is registered for notification when all are complete.
	 *
	 * @param effectId - The effect ID to load
	 * @param listener - Optional listener to notify when effect assets are ready
	 */
	public loadEffectData(effectId: number, listener: IAvatarEffectListener | null = null): void
	{
		if (!this._isReady)
		{
			this._initDownloadBuffer.push([effectId, listener]);
			return;
		}

		const libs = this.getLibsToDownload(effectId);
		const effectKey = String(effectId);

		if (libs.length > 0)
		{
			if (listener && !listener.disposed)
			{
				if (!this._listeners.has(effectKey))
				{
					this._listeners.set(effectKey, []);
				}

				this._listeners.get(effectKey)!.push(listener);
			}

			this._incompleteEffects.set(effectKey, libs);

			for (const lib of libs)
			{
				this.addToQueue(lib);
			}
		}
		else if (listener !== null && !listener.disposed)
		{
			listener.avatarEffectReady(effectId);
		}
	}

	/**
	 * Flushes the init download buffer, processing any requests that were queued
	 * before the manager was ready.
	 */
	public processInitBuffer(): void
	{
		for (const [effectId, listener] of this._initDownloadBuffer)
		{
			this.loadEffectData(effectId, listener);
		}

		this._initDownloadBuffer = [];
	}

	public dispose(): void
	{
		this._effectMap.clear();
		this._incompleteEffects.clear();
		this._listeners.clear();
		this._pendingDownloadQueue = [];
		this._currentDownloads = [];
		this._initDownloadBuffer = [];
	}

	/**
	 * Generates the effect-ID-to-library mapping from effect map data.
	 *
	 * In AS3, iterates XML `<effect>` elements, creating EffectAssetDownloadLibrary
	 * instances keyed by effect ID string.
	 */
	private generateMap(data: any): void
	{
		if (!data || !data.effects) return;

		for (const effectData of data.effects)
		{
			const effectId = String(effectData.id || '');
			const libName = String(effectData.lib || '');
			const revision = String(effectData.revision || '0');

			if (effectId === '' || libName === '') continue;

			const library = new EffectAssetDownloadLibrary(
				libName,
				revision,
				this._downloadUrl,
				this._assetLibrary
			);

			library.on(EffectAssetDownloadLibrary.COMPLETE, () => this.onLibraryComplete(library));

			if (!this._effectMap.has(effectId))
			{
				this._effectMap.set(effectId, []);
			}

			this._effectMap.get(effectId)!.push(library);
		}
	}

	/**
	 * Determines which libraries still need to be downloaded for a given effect.
	 */
	private getLibsToDownload(effectId: number): EffectAssetDownloadLibrary[]
	{
		const result: EffectAssetDownloadLibrary[] = [];
		const resultSet: Set<EffectAssetDownloadLibrary> = new Set();

		if (!this._structure) return result;

		const libs = this._effectMap.get(String(effectId));

		if (!libs) return result;

		for (const lib of libs)
		{
			if (lib && !lib.isReady && !resultSet.has(lib))
			{
				resultSet.add(lib);
				result.push(lib);
			}
		}

		return result;
	}

	/**
	 * Callback invoked when a library finishes downloading.
	 *
	 * Registers the library's animation data with the avatar structure, checks which
	 * pending effects are now complete, notifies their listeners, removes the library
	 * from current downloads, and triggers the next batch of downloads.
	 */
	private onLibraryComplete(library: EffectAssetDownloadLibrary): void
	{
		// Register animation data with the structure
		if (library.animation)
		{
			this._structure.registerAnimation(library.animation);
		}

		// Check which pending effects are now complete
		const completedEffects: string[] = [];

		for (const [effectKey, libs] of this._incompleteEffects)
		{
			const allReady = libs.every(lib => lib.isReady);

			if (allReady)
			{
				completedEffects.push(effectKey);

				const listeners = this._listeners.get(effectKey);

				if (listeners)
				{
					for (const listener of listeners)
					{
						if (listener && !listener.disposed)
						{
							listener.avatarEffectReady(parseInt(effectKey));
						}
					}

					this._listeners.delete(effectKey);
				}
			}
		}

		for (const effectKey of completedEffects)
		{
			this._incompleteEffects.delete(effectKey);
		}

		// Remove from current downloads
		if (this._currentDownloadSet.delete(library))
		{
			const downloadIndex = this._currentDownloads.indexOf(library);

			if (downloadIndex !== -1)
			{
				this._currentDownloads.splice(downloadIndex, 1);
			}
		}

		if (completedEffects.length > 0)
		{
			this.emit(EffectAssetDownloadManager.LIBRARY_LOADED, library.name);
		}

		this.processPending();
	}

	/**
	 * Adds a library to the pending download queue if not already queued or downloading.
	 *
	 * In AS3, this also immediately calls processPending().
	 */
	private addToQueue(library: EffectAssetDownloadLibrary): void
	{
		if (!library.isReady && !this._pendingDownloadSet.has(library) && !this._currentDownloadSet.has(library))
		{
			this._pendingDownloadSet.add(library);
			this._pendingDownloadQueue.push(library);
			this.processPending();
		}
	}

	/**
	 * Processes the pending download queue, starting downloads up to the maximum limit.
	 *
	 * In AS3, this is also triggered by a Timer with 100ms delay.
	 */
	private processPending(): void
	{
		while (this._pendingDownloadQueue.length > 0 && this._currentDownloads.length < EffectAssetDownloadManager.MAX_SIMULTANEOUS_DOWNLOADS)
		{
			const library = this._pendingDownloadQueue.shift()!;
			this._pendingDownloadSet.delete(library);

			this._currentDownloadSet.add(library);
			library.startDownloading();
			this._currentDownloads.push(library);
		}
	}

	/**
	 * Loads mandatory effect libraries (dance.1 through dance.4).
	 *
	 * These are queued immediately after the effect map is generated.
	 */
	private loadMandatoryLibs(): void
	{
		const mandatoryIds = EffectAssetDownloadManager.MANDATORY_EFFECT_IDS.slice();

		for (const effectId of mandatoryIds)
		{
			const libs = this._effectMap.get(effectId);

			if (libs)
			{
				for (const lib of libs)
				{
					this.addToQueue(lib);
				}
			}
		}
	}
}
