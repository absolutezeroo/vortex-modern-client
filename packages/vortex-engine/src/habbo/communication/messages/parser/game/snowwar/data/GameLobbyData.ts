import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {GameLobbyPlayerData} from './GameLobbyPlayerData';

/**
 * One open game in the lobby list, with everyone currently in it.
 *
 * `levelName` is read off the wire and **has no getter in AS3** — the field is written and never
 * exposed. Transcribed with the field private and unread, because adding an accessor would be
 * inventing API.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/GameLobbyData.as
 */
export class GameLobbyData
{
    /** Derived name — `_SafeStr_10027`. */
    // AS3: GameLobbyData.as::_SafeStr_10027
    private _gameId: number;

    /** Derived name — `_SafeStr_6884`. */
    // AS3: GameLobbyData.as::_SafeStr_6884
    private _gameType: number;

    /** Derived name — `_SafeStr_7522`. */
    // AS3: GameLobbyData.as::_SafeStr_7522
    private _fieldType: number;

    // AS3: GameLobbyData.as::_numberOfTeams
    private _numberOfTeams: number;

    /** Derived name — `_SafeStr_9994`. */
    // AS3: GameLobbyData.as::_SafeStr_9994
    private _maximumPlayers: number;

    /** Derived name — `_SafeStr_9987`. */
    // AS3: GameLobbyData.as::_SafeStr_9987
    private _owningPlayerName: string;

    /** Derived name — `_SafeStr_9162`. */
    // AS3: GameLobbyData.as::_SafeStr_9162
    private _levelEntryId: number;

    /**
     * Read off the wire and never exposed: AS3 declares the field and gives it no getter.
     * Transcribed as unread rather than given an accessor this port would be inventing.
     */
    // AS3: GameLobbyData.as::_levelName
    private _levelName: string = '';

    // AS3: GameLobbyData.as::_players
    private _players: GameLobbyPlayerData[] = [];

    // AS3: GameLobbyData.as::GameLobbyData()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._gameId = wrapper.readInt();
        this._levelName = wrapper.readString();
        this._gameType = wrapper.readInt();
        this._fieldType = wrapper.readInt();
        this._numberOfTeams = wrapper.readInt();
        this._maximumPlayers = wrapper.readInt();
        this._owningPlayerName = wrapper.readString();
        this._levelEntryId = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._players.push(new GameLobbyPlayerData(wrapper));
        }
    }

    // AS3: GameLobbyData.as::get gameId()
    public get gameId(): number
    {
        return this._gameId;
    }

    // AS3: GameLobbyData.as::get gameType()
    public get gameType(): number
    {
        return this._gameType;
    }

    // AS3: GameLobbyData.as::get fieldType()
    public get fieldType(): number
    {
        return this._fieldType;
    }

    // AS3: GameLobbyData.as::get numberOfTeams()
    public get numberOfTeams(): number
    {
        return this._numberOfTeams;
    }

    // AS3: GameLobbyData.as::get maximumPlayers()
    public get maximumPlayers(): number
    {
        return this._maximumPlayers;
    }

    // AS3: GameLobbyData.as::get owningPlayerName()
    public get owningPlayerName(): string
    {
        return this._owningPlayerName;
    }

    // AS3: GameLobbyData.as::get levelEntryId()
    public get levelEntryId(): number
    {
        return this._levelEntryId;
    }

    // AS3: GameLobbyData.as::get players()
    public get players(): GameLobbyPlayerData[]
    {
        return this._players;
    }
}
