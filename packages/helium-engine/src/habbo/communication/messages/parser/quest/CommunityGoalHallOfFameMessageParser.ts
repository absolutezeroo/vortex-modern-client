import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CommunityGoalHallOfFameData} from './CommunityGoalHallOfFameData';

/**
 * Parser for the community goal hall of fame message.
 * @see source_nitro_renderer/.../parser/quest/CommunityGoalHallOfFameMessageParser.ts
 */
export class CommunityGoalHallOfFameMessageParser implements IMessageParser
{
	private _data: CommunityGoalHallOfFameData | null = null;

	get data(): CommunityGoalHallOfFameData | null
	{
		return this._data;
	}

	flush(): boolean
	{
		this._data = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._data = new CommunityGoalHallOfFameData(wrapper);
		return true;
	}
}
