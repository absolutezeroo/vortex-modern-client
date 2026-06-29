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

		for (let i = 0; i < count; i++)
		{
			this._hof.push(new HallOfFameEntryData(wrapper));
		}
	}

	private _goalCode: string;

	get goalCode(): string
	{
		return this._goalCode;
	}

	private _hof: HallOfFameEntryData[];

	get hof(): HallOfFameEntryData[]
	{
		return this._hof;
	}

	private _disposed: boolean = false;
	get disposed(): boolean
	{
		return this._disposed;
	}

	dispose(): void
	{
		if (this._disposed) return;
		this._disposed = true;
		this._hof = [];
	}
}
