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
    // AS3's `slotId` is a `String`, i.e. nullable, and the trading item parser
    // (incoming/inventory/trading/class_3066) returns null for it outright — only the furni-list
    // parser ever carries a real value. Typing it `string` here forced a cast at the trading call
    // site, which is exactly the kind of escape hatch that hides a real mismatch.
    slotId: string | null;
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
