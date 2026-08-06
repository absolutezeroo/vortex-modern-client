/**
 * Event dispatched when a quest is completed
 *
 * @see source_as_win63/habbo/quest/events/QuestCompletedEvent.as
 */
export class QuestCompletedEvent
{
    // AS3: .../src/com/sulake/habbo/quest/events/QuestCompletedEvent.as::QUEST_SEASONAL
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

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/quest/events/QuestCompletedEvent.as::_questData
    private _questData: unknown;

    // AS3: .../src/com/sulake/habbo/quest/events/QuestCompletedEvent.as::get questData()
    get questData(): unknown
    {
        return this._questData;
    }
}
