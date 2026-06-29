import type {EventEmitter} from 'eventemitter3';

/**
 * Interface for the advertisement manager
 *
 * @see source_as_win63/habbo/advertisement/class_1811.as
 */
export interface IAdManager
{
	showInterstitial(): void;

	loadRoomAdImage(roomId: number, objectId: number, objectCategory: number, imageURL: string, clickURL: string): void;

	get adEvents(): EventEmitter;
}
