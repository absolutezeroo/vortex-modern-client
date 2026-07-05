import type {IMessageDataWrapper} from '@core/communication';

/**
 * Competition rooms data
 *
 * Based on AS3 class_1665
 */
export class CompetitionRoomsData
{
    constructor(wrapper: IMessageDataWrapper | null, goalId: number = 0, pageIndex: number = 0)
    {
        this._goalId = goalId;
        this._pageIndex = pageIndex;

        if(wrapper !== null)
        {
            this._goalId = wrapper.readInt();
            this._pageIndex = wrapper.readInt();
            this._pageCount = wrapper.readInt();
        }
    }

    private _goalId: number = 0;

    get goalId(): number
    {
        return this._goalId;
    }

    private _pageIndex: number = 0;

    get pageIndex(): number
    {
        return this._pageIndex;
    }

    private _pageCount: number = 0;

    get pageCount(): number
    {
        return this._pageCount;
    }
}
