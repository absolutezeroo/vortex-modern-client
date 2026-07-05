/**
 * IStuffData Interface
 *
 * Based on AS3: com.sulake.habbo.room.IStuffData
 *
 * Interface for furniture data storage.
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IRoomObjectModel} from '@room/object/IRoomObjectModel';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';

export interface IStuffData
{
    flags: number;
    uniqueSerialNumber: number;
    uniqueSeriesSize: number;
    readonly rarityLevel: number;

    initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void;

    initializeFromRoomObjectModel(model: IRoomObjectModel): void;

    writeRoomObjectModel(model: IRoomObjectModelController): void;

    getLegacyString(): string;

    getJSONValue(key: string): string;

    compare(data: IStuffData): boolean;
}
