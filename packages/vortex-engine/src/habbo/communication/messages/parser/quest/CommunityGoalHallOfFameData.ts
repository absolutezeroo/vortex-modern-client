import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {HallOfFameEntryData} from './HallOfFameEntryData';

/**
 * Data for the community goal hall of fame.
 * @see source_nitro_renderer/.../parser/quest/CommunityGoalHallOfFameData.ts
 */
export class CommunityGoalHallOfFameData
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._hof = [];
        this._goalCode = wrapper.readString();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._hof.push(new HallOfFameEntryData(wrapper));
        }
    }

    private _goalCode: string;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/quest/CommunityGoalHallOfFameData.as::get goalCode()
    get goalCode(): string
    {
        return this._goalCode;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/quest/CommunityGoalHallOfFameData.as::_hof
    private _hof: HallOfFameEntryData[];

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/quest/CommunityGoalHallOfFameData.as::get hof()
    get hof(): HallOfFameEntryData[]
    {
        return this._hof;
    }

    private _disposed: boolean = false;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/quest/CommunityGoalHallOfFameData.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/quest/CommunityGoalHallOfFameData.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;
        this._disposed = true;
        this._hof = [];
    }
}
