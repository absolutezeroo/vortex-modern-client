import type {EventEmitter} from 'eventemitter3';

/**
 * Interface for the advertisement manager
 *
 * @see source_as_win63/habbo/advertisement/class_1811.as
 */
export interface IAdManager
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/IAdManager.as::showInterstitial()
    showInterstitial(): void;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/advertisement/IAdManager.as::loadRoomAdImage()
    loadRoomAdImage(roomId: number, objectId: number, objectCategory: number, imageURL: string, clickURL: string): void;

    get adEvents(): EventEmitter;
}
