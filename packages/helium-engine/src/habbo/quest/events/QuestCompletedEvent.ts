/**
 * Event dispatched when a quest is completed
 *
 * @see source_as_win63/habbo/quest/events/QuestCompletedEvent.as
 */
export class QuestCompletedEvent
{
	public static readonly QUEST_SEASONAL: string = 'qce_seasonal';

	constructor(type: string, questData: unknown)
	{
		this._type = type;
		this._questData = questData;
	}

	private _type: string;

	get type(): string
	{
		return this._type;
	}

	private _questData: unknown;

	get questData(): unknown
	{
		return this._questData;
	}
}
