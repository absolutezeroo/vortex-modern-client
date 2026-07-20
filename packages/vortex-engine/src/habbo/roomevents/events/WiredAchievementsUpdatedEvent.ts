/**
 * Dispatched by WiredEnvironment when the room's enabled-achievement list changes
 * (server pushes it via the wired-environment message on entry / config change).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/events/WiredAchievementsUpdatedEvent.as
 */
export class WiredAchievementsUpdatedEvent
{
    // AS3: WiredAchievementsUpdatedEvent.as::WIRED_ACHIEVEMENTS_UPDATED
    static readonly WIRED_ACHIEVEMENTS_UPDATED: string = 'WIRED_ACHIEVEMENTS_UPDATED';

    private _type: string;

    private _achievements: string[];

    // AS3: WiredAchievementsUpdatedEvent.as::WiredAchievementsUpdatedEvent()
    constructor(type: string, achievements: string[])
    {
        this._type = type;
        this._achievements = achievements;
    }

    // AS3: WiredAchievementsUpdatedEvent.as::get type()
    get type(): string
    {
        return this._type;
    }

    // AS3: WiredAchievementsUpdatedEvent.as::get achievements()
    get achievements(): string[]
    {
        return this._achievements;
    }
}
