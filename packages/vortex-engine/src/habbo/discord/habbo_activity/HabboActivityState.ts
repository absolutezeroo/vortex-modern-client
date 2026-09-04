/**
 * What the player looks like they are doing, for the Discord status line.
 *
 * `rank` is the tie-break: `HabboActivityDetection` collects every state that currently applies and
 * keeps the highest-ranked one, so trading (202) beats dancing (201) beats gaming (104) beats
 * plain chatting (101). Building (300) and wired-editing (301) outrank everything, and `CHILLING`
 * at 0 is the floor nothing can lose to.
 *
 * `name` is the localisation suffix — `discord.rpc.state.room.<name>`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/discord/habbo_activity/HabboActivityState.as
 */
export class HabboActivityState
{
    // AS3: .../habbo_activity/HabboActivityState.as::CHILLING
    public static readonly CHILLING: HabboActivityState = new HabboActivityState('chilling', 0);

    // AS3: .../habbo_activity/HabboActivityState.as::GAMING
    public static readonly GAMING: HabboActivityState = new HabboActivityState('gaming', 104);

    // AS3: .../habbo_activity/HabboActivityState.as::WORKING
    public static readonly WORKING: HabboActivityState = new HabboActivityState('working', 103);

    // AS3: .../habbo_activity/HabboActivityState.as::RPG
    public static readonly RPG: HabboActivityState = new HabboActivityState('rpg', 102);

    // AS3: .../habbo_activity/HabboActivityState.as::PARTYING
    public static readonly PARTYING: HabboActivityState = new HabboActivityState('partying', 100);

    // AS3: .../habbo_activity/HabboActivityState.as::TRADING
    public static readonly TRADING: HabboActivityState = new HabboActivityState('trading', 202);

    // AS3: .../habbo_activity/HabboActivityState.as::DANCING
    public static readonly DANCING: HabboActivityState = new HabboActivityState('dancing', 201);

    // AS3: .../habbo_activity/HabboActivityState.as::BUILDING
    public static readonly BUILDING: HabboActivityState = new HabboActivityState('building', 300);

    // AS3: .../habbo_activity/HabboActivityState.as::CREATING_WIRED
    public static readonly CREATING_WIRED: HabboActivityState = new HabboActivityState('creating_wired', 301);

    // AS3: .../habbo_activity/HabboActivityState.as::CHATTING
    public static readonly CHATTING: HabboActivityState = new HabboActivityState('chatting', 101);

    // AS3: .../habbo_activity/HabboActivityState.as::_name
    private readonly _name: string;

    // AS3: .../habbo_activity/HabboActivityState.as::_SafeStr_9490 (name derived: `get rank()` backs it)
    private readonly _rank: number;

    // AS3: .../habbo_activity/HabboActivityState.as::HabboActivityState()
    constructor(name: string, rank: number)
    {
        this._name = name;
        this._rank = rank;
    }

    // AS3: .../habbo_activity/HabboActivityState.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: .../habbo_activity/HabboActivityState.as::get rank()
    get rank(): number
    {
        return this._rank;
    }
}
