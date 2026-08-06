/**
 * Event dispatched when the unseen achievement count changes
 *
 * @see source_as_win63/habbo/quest/events/UnseenAchievementsCountUpdateEvent.as
 */
export class UnseenAchievementsCountUpdateEvent
{
    // AS3: .../src/com/sulake/habbo/quest/events/UnseenAchievementsCountUpdateEvent.as::TYPE
    public static readonly TYPE: string = 'qe_uacue';

    constructor(count: number)
    {
        this._count = count;
    }

    // AS3: .../src/com/sulake/habbo/quest/events/UnseenAchievementsCountUpdateEvent.as::_count
    private _count: number;

    // AS3: .../src/com/sulake/habbo/quest/events/UnseenAchievementsCountUpdateEvent.as::get count()
    get count(): number
    {
        return this._count;
    }
}
