import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {AchievementData} from '../../quest/AchievementData';

/**
 * Parses a list of achievements and the default category.
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/achievements/AchievementsEventParser.as
 */
export class AchievementsEventParser implements IMessageParser
{
	private _achievements: AchievementData[] = [];

	get achievements(): AchievementData[]
	{
		return this._achievements;
	}

	private _defaultCategory: string = '';

	get defaultCategory(): string
	{
		return this._defaultCategory;
	}

	flush(): boolean
	{
		this._achievements = [];
		this._defaultCategory = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._achievements = [];

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._achievements.push(new AchievementData(wrapper));
		}

		this._defaultCategory = wrapper.readString();
		return true;
	}
}
