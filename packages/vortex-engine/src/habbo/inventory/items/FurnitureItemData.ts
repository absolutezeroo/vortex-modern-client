import type {IStuffData} from '@habbo/room/object/data/IStuffData';

/**
 * Data structure for furniture item from server parser
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.inventory.furni.class_1703
 */
export interface IFurnitureItemData
{
    itemId: number;
    itemType: string;
    roomItemId: number;
    itemTypeId: number;
    category: number;
    stuffData: IStuffData | null;
    isGroupable: boolean;
    isRecyclable: boolean;
    isTradeable: boolean;
    isSellable: boolean;
    secondsToExpiration: number;
    flatId: number;
    slotId: string;
    songId: number;
    extra: number;
    isRented: boolean;
    isWallItem: boolean;
    hasRentPeriodStarted: boolean;
    expirationTimeStamp: number;
    creationDay: number;
    creationMonth: number;
    creationYear: number;
    isExternalImageFurni: boolean;
}
