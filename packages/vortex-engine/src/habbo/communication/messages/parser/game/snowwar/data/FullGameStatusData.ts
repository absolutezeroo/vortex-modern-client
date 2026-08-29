import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {GameObjectsData} from './GameObjectsData';
import {GameStatusData} from './GameStatusData';

/**
 * The whole arena in one packet — sent on join and after a resync, where `GameStatusData` alone is
 * sent every turn. It is the only message that carries objects *and* events together, which is what
 * lets a client that just arrived start replaying from a known state.
 *
 * Two integers in the middle of `parse()` are read and discarded; see the method.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/FullGameStatusData.as
 */
export class FullGameStatusData
{
    /** Derived name — `_SafeStr_9448`, from the `remainingTimeSeconds` getter that reads it. */
    // AS3: FullGameStatusData.as::_SafeStr_9448
    private _remainingTimeSeconds: number = 0;

    /** Derived name — `_SafeStr_9909`, from the `durationInSeconds` getter that reads it. */
    // AS3: FullGameStatusData.as::_SafeStr_9909
    private _durationInSeconds: number = 0;

    /** Derived name — `_SafeStr_4750`, from the `gameObjects` getter that reads it. */
    // AS3: FullGameStatusData.as::_SafeStr_4750
    private _gameObjects: GameObjectsData | null = null;

    // AS3: FullGameStatusData.as::_numberOfTeams
    private _numberOfTeams: number = 0;

    /** Derived name — `_SafeStr_9401`, from the `gameStatus` getter that reads it. */
    // AS3: FullGameStatusData.as::_SafeStr_9401
    private _gameStatus: GameStatusData | null = null;

    // AS3: FullGameStatusData.as::FullGameStatusData()
    public constructor(wrapper: IMessageDataWrapper)
    {
        this.parse(wrapper);
    }

    /**
     * Two integers are read into nothing — one before `remainingTimeSeconds` and one before
     * `numberOfTeams`. AS3 reads and discards both; they still have to be consumed or every field
     * after them shifts by four bytes.
     */
    // AS3: FullGameStatusData.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        wrapper.readInt();
        this._remainingTimeSeconds = wrapper.readInt();
        this._durationInSeconds = wrapper.readInt();
        this._gameObjects = new GameObjectsData(wrapper);
        wrapper.readInt();
        this._numberOfTeams = wrapper.readInt();
        this._gameStatus = new GameStatusData(wrapper);
    }

    // AS3: FullGameStatusData.as::get remainingTimeSeconds()
    public get remainingTimeSeconds(): number
    {
        return this._remainingTimeSeconds;
    }

    // AS3: FullGameStatusData.as::get durationInSeconds()
    public get durationInSeconds(): number
    {
        return this._durationInSeconds;
    }

    // AS3: FullGameStatusData.as::get gameObjects()
    public get gameObjects(): GameObjectsData | null
    {
        return this._gameObjects;
    }

    // AS3: FullGameStatusData.as::get numberOfTeams()
    public get numberOfTeams(): number
    {
        return this._numberOfTeams;
    }

    // AS3: FullGameStatusData.as::get gameStatus()
    public get gameStatus(): GameStatusData | null
    {
        return this._gameStatus;
    }
}
