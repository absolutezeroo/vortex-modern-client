import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data for a single hall of fame entry (user ranking).
 * @see source_nitro_renderer/.../parser/quest/HallOfFameEntryData.ts
 */
export class HallOfFameEntryData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._userId = wrapper.readInt();
        this._userName = wrapper.readString();
        this._figure = wrapper.readString();
        this._rank = wrapper.readInt();
        this._currentScore = wrapper.readInt();
    }

    private _userId: number;

    get userId(): number
    {
        return this._userId;
    }

    private _userName: string;

    get userName(): string
    {
        return this._userName;
    }

    private _figure: string;

    get figure(): string
    {
        return this._figure;
    }

    private _rank: number;

    get rank(): number
    {
        return this._rank;
    }

    private _currentScore: number;

    get currentScore(): number
    {
        return this._currentScore;
    }
}
