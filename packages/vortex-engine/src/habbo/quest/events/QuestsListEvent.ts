/**
 * Event dispatched when quest list is received from the server
 *
 * @see source_as_win63/habbo/quest/events/QuestsListEvent.as
 */
export class QuestsListEvent
{
    // AS3: .../src/com/sulake/habbo/quest/events/QuestsListEvent.as::QUESTS_SEASONAL
    public static readonly QUESTS_SEASONAL: string = 'qe_quests_seasonal';
    // AS3: .../src/com/sulake/habbo/quest/events/QuestsListEvent.as::QUESTS
    public static readonly QUESTS: string = 'qu_quests';

    constructor(type: string, quests: unknown[], openWindow: boolean)
    {
        this._type = type;
        this._quests = quests;
        this._openWindow = openWindow;
    }

    private _type: string;

    get type(): string
    {
        return this._type;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/quest/events/QuestsListEvent.as::_quests
    private _quests: unknown[];

    // AS3: .../src/com/sulake/habbo/quest/events/QuestsListEvent.as::get quests()
    get quests(): unknown[]
    {
        return this._quests;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/quest/events/QuestsListEvent.as::_openWindow
    private _openWindow: boolean;

    // AS3: .../src/com/sulake/habbo/quest/events/QuestsListEvent.as::get openWindow()
    get openWindow(): boolean
    {
        return this._openWindow;
    }
}
