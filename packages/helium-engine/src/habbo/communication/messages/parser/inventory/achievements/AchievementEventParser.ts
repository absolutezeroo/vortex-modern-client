import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {AchievementData} from '../../quest/AchievementData';

/**
 * Parses a single achievement update.
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/achievements/AchievementEventParser.as
 */
export class AchievementEventParser implements IMessageParser
{
	private _achievement: AchievementData | null = null;

	get achievement(): AchievementData | null
	{
		return this._achievement;
	}

	flush(): boolean
	{
		this._achievement = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._achievement = new AchievementData(wrapper);
		return true;
	}
}
