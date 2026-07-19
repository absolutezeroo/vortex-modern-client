/**
 * Event dispatched when the unseen achievement count changes
 *
 * @see source_as_win63/habbo/quest/events/UnseenAchievementsCountUpdateEvent.as
 */
export class UnseenAchievementsCountUpdateEvent
{
    public static readonly TYPE: string = 'qe_uacue';

    constructor(count: number)
    {
        this._count = count;
    }

    private _count: number;

    get count(): number
    {
        return this._count;
    }
}
