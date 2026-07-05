/**
 * VoteResultStuffData
 *
 * Based on AS3: com.sulake.habbo.room.object.data.VoteResultStuffData
 *
 * Vote result furniture data (format type 3).
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IRoomObjectModel} from '@room/object/IRoomObjectModel';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';
import {RoomObjectVariableEnum} from '../RoomObjectVariableEnum';
import type {IStuffData} from './IStuffData';
import {StuffDataBase} from './StuffDataBase';

export class VoteResultStuffData extends StuffDataBase implements IStuffData
{
    public static readonly FORMAT_KEY = 3;

    private _state: string = '';
    private _result: number = 0;

    get result(): number
    {
        return this._result;
    }

    override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
    {
        this._state = wrapper.readString();
        this._result = wrapper.readInt();
        super.initializeFromIncomingMessage(wrapper);
    }

    override initializeFromRoomObjectModel(model: IRoomObjectModel): void
    {
        super.initializeFromRoomObjectModel(model);
        this._state = model.getString(RoomObjectVariableEnum.FURNITURE_DATA);
        this._result = model.getNumber(RoomObjectVariableEnum.FURNITURE_VOTE_MAJORITY_RESULT);
    }

    override writeRoomObjectModel(model: IRoomObjectModelController): void
    {
        super.writeRoomObjectModel(model);
        model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA_FORMAT, VoteResultStuffData.FORMAT_KEY);
        model.setString(RoomObjectVariableEnum.FURNITURE_DATA, this._state);
        model.setNumber(RoomObjectVariableEnum.FURNITURE_VOTE_MAJORITY_RESULT, this._result);
    }

    override getLegacyString(): string
    {
        return this._state;
    }

    override compare(data: IStuffData): boolean
    {
        return this._state === data.getLegacyString();
    }
}
