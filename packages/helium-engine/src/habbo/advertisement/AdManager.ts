import {EventEmitter} from 'eventemitter3';
import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';
import {InterstitialMessageEvent} from '@habbo/communication/messages/incoming/advertisement/InterstitialMessageEvent';
import type {
	InterstitialMessageParser
} from '@habbo/communication/messages/parser/advertisement/InterstitialMessageParser';
import {
	GetInterstitialMessageComposer
} from '@habbo/communication/messages/outgoing/advertisement/GetInterstitialMessageComposer';
import {InterstitialEvent} from './events/InterstitialEvent';
import {AdEvent} from './events/AdEvent';
import {AdImageRequest} from './AdImageRequest';
import type {IAdManager} from './IAdManager';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";

const log = Logger.getLogger('AdManager');

/**
 * Advertisement manager
 *
 * Manages interstitial ads and billboard image loading for rooms.
 *
 * @see source_as_win63/habbo/advertisement/AdManager.as
 */
export class AdManager extends Component implements IAdManager
{
	private _communicationManager: IHabboCommunicationManager | null = null;
	private _billboardImageLoaders: Map<string, AdImageRequest[]> = new Map();
	private _interstitialEvent: IMessageEvent | null = null;

	constructor(context: IContext)
	{
		super(context);
	}

	private _adEvents: EventEmitter = new EventEmitter();

	get adEvents(): EventEmitter
	{
		return this._adEvents;
	}

	protected override get dependencies(): Array<ComponentDependency<any>>
	{
		return [
			new ComponentDependency(
				IID_HabboCommunicationManager,
				(manager: IHabboCommunicationManager | null) =>
				{
					this._communicationManager = manager;
				},
			),
		];
	}

	/**
	 * Request interstitial ad display
	 */
	showInterstitial(): void
	{
		this._communicationManager!.connection!.send(new GetInterstitialMessageComposer());
	}

	/**
	 * Load a billboard ad image for a room object
	 */
	loadRoomAdImage(roomId: number, objectId: number, objectCategory: number, imageURL: string, clickURL: string): void
	{
		if (!imageURL || imageURL.length === 0) return;

		let requests = this._billboardImageLoaders.get(imageURL);

		if (!requests)
		{
			requests = [];
			this._billboardImageLoaders.set(imageURL, requests);
		}

		// Check for duplicate request
		for (const req of requests)
		{
			if (req.roomId === roomId && req.objectId === objectId && req.objectCategory === objectCategory)
			{
				return;
			}
		}

		requests.push(new AdImageRequest(roomId, imageURL, clickURL, objectId, objectCategory));

		// Load image
		this.loadBillboardImage(imageURL);
	}

	dispose(): void
	{
		if (this._disposed) return;

		if (this._communicationManager && this._interstitialEvent)
		{
			this._communicationManager.removeMessageEvent(this._interstitialEvent);
			this._interstitialEvent = null;
		}

		this._billboardImageLoaders.clear();
		this._adEvents.removeAllListeners();
		this._communicationManager = null;

		super.dispose();
	}

	protected override initComponent(): void
	{
		this._interstitialEvent = new InterstitialMessageEvent(this.onInterstitial.bind(this));
		this._communicationManager!.addMessageEvent(this._interstitialEvent);

		log.debug('AdManager initialized');
	}

	/**
	 * Handle interstitial message from server
	 */
	private onInterstitial(event: IMessageEvent): void
	{
		const parser = event.parser as InterstitialMessageParser;

		if (parser?.canShowInterstitial)
		{
			log.debug('Interstitial available');
			this._adEvents.emit(InterstitialEvent.INTERSTITIAL_SHOW);
		}
		else
		{
			this._adEvents.emit(InterstitialEvent.INTERSTITIAL_NOT_SHOWN);
		}
	}

	/**
	 * Load billboard image from URL
	 */
	private async loadBillboardImage(imageURL: string): Promise<void>
	{
		try
		{
			const response = await fetch(imageURL);

			if (!response.ok)
			{
				this.onBillboardImageLoadError(imageURL);
				return;
			}

			const blob = await response.blob();
			const imageBitmap = await createImageBitmap(blob);

			if (imageBitmap.width > 1 || imageBitmap.height > 1)
			{
				this.onBillboardImageReady(imageURL);
			}
		}
		catch
		{
			this.onBillboardImageLoadError(imageURL);
		}
	}

	/**
	 * Billboard image loaded successfully
	 */
	private onBillboardImageReady(imageURL: string): void
	{
		const requests = this._billboardImageLoaders.get(imageURL);
		this._billboardImageLoaders.delete(imageURL);

		if (!requests || requests.length === 0) return;

		for (const req of requests)
		{
			this._adEvents.emit(AdEvent.ROOM_AD_IMAGE_LOADED, new AdEvent(
				AdEvent.ROOM_AD_IMAGE_LOADED,
				req.roomId,
				req.imageURL,
				req.clickURL,
				req.objectId,
				req.objectCategory
			));
		}
	}

	/**
	 * Billboard image failed to load
	 */
	private onBillboardImageLoadError(imageURL: string): void
	{
		const requests = this._billboardImageLoaders.get(imageURL);
		this._billboardImageLoaders.delete(imageURL);

		if (!requests || requests.length === 0) return;

		for (const req of requests)
		{
			this._adEvents.emit(AdEvent.ROOM_AD_IMAGE_LOADING_FAILED, new AdEvent(
				AdEvent.ROOM_AD_IMAGE_LOADING_FAILED,
				req.roomId,
				req.imageURL,
				req.clickURL,
				req.objectId,
				req.objectCategory
			));
		}
	}
}
