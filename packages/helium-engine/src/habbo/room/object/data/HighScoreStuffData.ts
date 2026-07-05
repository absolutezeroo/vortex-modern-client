/**
 * HighScoreStuffData
 *
 * Based on AS3: com.sulake.habbo.room.object.data.HighScoreStuffData
 *
 * High score furniture data (format type 6).
 */
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IRoomObjectModel} from '@room/object/IRoomObjectModel';
import type {IRoomObjectModelController} from '@room/object/IRoomObjectModelController';
import {RoomObjectVariableEnum} from '../RoomObjectVariableEnum';
import type {IStuffData} from './IStuffData';
import {StuffDataBase} from './StuffDataBase';

export interface HighScoreEntry
{
    users: string[];
    score: number;
}

export class HighScoreStuffData extends StuffDataBase implements IStuffData
{
    public static readonly FORMAT_KEY = 6;

    private _state: string = '';
    private _scoreType: number = 0;

    get scoreType(): number
    {
        return this._scoreType;
    }

    private _clearType: number = 0;

    get clearType(): number
    {
        return this._clearType;
    }

    private _entries: HighScoreEntry[] = [];

    get entries(): HighScoreEntry[]
    {
        return this._entries;
    }

    override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
    {
        this._state = wrapper.readString();
        this._scoreType = wrapper.readInt();
        this._clearType = wrapper.readInt();

        this._entries = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const score = wrapper.readInt();
            const userCount = wrapper.readInt();
            const users: string[] = [];

            for(let j = 0; j < userCount; j++)
            {
                users.push(wrapper.readString());
            }

            this._entries.push({users, score});
        }

        super.initializeFromIncomingMessage(wrapper);
    }

    override initializeFromRoomObjectModel(model: IRoomObjectModel): void
    {
        super.initializeFromRoomObjectModel(model);

        this._state = model.getString(RoomObjectVariableEnum.FURNITURE_DATA);
        this._scoreType = model.getNumber(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_SCORE_TYPE);
        this._clearType = model.getNumber(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_CLEAR_TYPE);

        this._entries = [];

        const count = model.getNumber(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_DATA_ENTRY_COUNT);

        for(let i = 0; i < count; i++)
        {
            const users = model.getStringArray(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_DATA_ENTRY_BASE_USERS + i);
            const score = model.getNumber(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_DATA_ENTRY_BASE_SCORE + i);

            this._entries.push({users: users ? [...users] : [], score});
        }
    }

    override writeRoomObjectModel(model: IRoomObjectModelController): void
    {
        super.writeRoomObjectModel(model);

        model.setNumber(RoomObjectVariableEnum.FURNITURE_DATA_FORMAT, HighScoreStuffData.FORMAT_KEY);
        model.setString(RoomObjectVariableEnum.FURNITURE_DATA, this._state);
        model.setNumber(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_SCORE_TYPE, this._scoreType);
        model.setNumber(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_CLEAR_TYPE, this._clearType);
        model.setNumber(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_DATA_ENTRY_COUNT, this._entries.length);

        for(let i = 0; i < this._entries.length; i++)
        {
            const entry = this._entries[i];

            model.setStringArray(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_DATA_ENTRY_BASE_USERS + i, entry.users);
            model.setNumber(RoomObjectVariableEnum.FURNITURE_HIGHSCORE_DATA_ENTRY_BASE_SCORE + i, entry.score);
        }
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
