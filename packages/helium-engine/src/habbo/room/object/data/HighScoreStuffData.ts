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

export interface IHighScoreEntry
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

    private _entries: IHighScoreEntry[] = [];

    get entries(): IHighScoreEntry[]
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

        // AS3 is the one StuffData override that deliberately does NOT call
        // super.initializeFromIncomingMessage(). The base reads the unique-serial
        // trailer (serial + edition) when the 0x0100 flag is set; a HighScore item
        // never carries it here, so calling super consumed two ints that were not on
        // the wire and desynced the rest of the packet.
    }

    override initializeFromRoomObjectModel(model: IRoomObjectModel): void
    {
        super.initializeFromRoomObjectModel(model);

        // AS3 does not read/write FURNITURE_DATA (the state string) in the model
        // methods — the state lives only on the field set from the incoming message.
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
