import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One input in a snow-war turn.
 *
 * Snow War is lock-step deterministic: the server sends what everybody *did*, never where anybody
 * *is*, and each client replays those inputs through the same simulation. So these eight classes
 * are the entire vocabulary of the game — anything not expressible as one of them cannot happen.
 *
 * The eight `EVENT_TYPE_*` ids are obfuscated in every available tree, including the 2016 one, which
 * does not carry these classes at all. **The names below are derived from the subclass each id
 * builds in `create()`** and are not recovered.
 *
 * Note the holes: 5, 6, 9 and 10 have no case. `create()` returns null for them and `GameStatusData`
 * drops the null rather than aborting the turn, which is how a client of this build survives a
 * server that speaks a wider event set than it does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4149/SnowWarGameEventData.as
 */
export class SnowWarGameEventData
{
    /** Derived name — `_SafeStr_11320`, from the class its id builds. */
    // AS3: SnowWarGameEventData.as::_SafeStr_11320
    public static readonly EVENT_TYPE_HUMAN_LEFT_GAME: number = 1;

    /** Derived name — `_SafeStr_10740`, from the class its id builds. */
    // AS3: SnowWarGameEventData.as::_SafeStr_10740
    public static readonly EVENT_TYPE_NEW_MOVE_TARGET: number = 2;

    /** Derived name — `_SafeStr_11083`, from the class its id builds. */
    // AS3: SnowWarGameEventData.as::_SafeStr_11083
    public static readonly EVENT_TYPE_HUMAN_THROWS_SNOWBALL_AT_HUMAN: number = 3;

    /** Derived name — `_SafeStr_10563`, from the class its id builds. */
    // AS3: SnowWarGameEventData.as::_SafeStr_10563
    public static readonly EVENT_TYPE_HUMAN_THROWS_SNOWBALL_AT_POSITION: number = 4;

    /** Derived name — `_SafeStr_11057`, from the class its id builds. */
    // AS3: SnowWarGameEventData.as::_SafeStr_11057
    public static readonly EVENT_TYPE_HUMAN_STARTS_TO_MAKE_A_SNOWBALL: number = 7;

    /** Derived name — `_SafeStr_11042`, from the class its id builds. */
    // AS3: SnowWarGameEventData.as::_SafeStr_11042
    public static readonly EVENT_TYPE_CREATE_SNOWBALL: number = 8;

    /** Derived name — `_SafeStr_11065`, from the class its id builds. */
    // AS3: SnowWarGameEventData.as::_SafeStr_11065
    public static readonly EVENT_TYPE_MACHINE_CREATES_SNOWBALL: number = 11;

    /** Derived name — `_SafeStr_11538`, from the class its id builds. */
    // AS3: SnowWarGameEventData.as::_SafeStr_11538
    public static readonly EVENT_TYPE_HUMAN_GETS_SNOWBALLS_FROM_MACHINE: number = 12;

    /**
     * TS-only: AS3's `create()` switches over the eight subclasses and imports them directly. In ESM
     * that static import makes this module evaluate before its own subclasses, so every
     * `extends SnowWarGameEventData` runs against a binding still in its temporal dead zone. Each
     * subclass registers itself here at module scope instead, which keeps the base a leaf.
     */
    // TS-only: ESM cycle breaker for AS3's direct-`new` factory switch — see above.
    private static readonly CTORS: Map<number, new (id: number) => SnowWarGameEventData> = new Map();

    /** Derived name — `_SafeStr_4872`, from the `id` accessor pair that reads and writes it. */
    // AS3: SnowWarGameEventData.as::_SafeStr_4872
    private _id: number = 0;

    // AS3: SnowWarGameEventData.as::SnowWarGameEventData()
    public constructor(id: number)
    {
        this._id = id;
    }

    // TS-only: ESM cycle breaker — subclasses call this at module scope so `create()` can find them.
    public static register(type: number, ctor: new (id: number) => SnowWarGameEventData): void
    {
        SnowWarGameEventData.CTORS.set(type, ctor);
    }

    // AS3: SnowWarGameEventData.as::create()
    public static create(type: number): SnowWarGameEventData | null
    {
        const ctor = SnowWarGameEventData.CTORS.get(type);

        if(!ctor)
        {
            return null;
        }

        return new ctor(type);
    }

    // AS3: SnowWarGameEventData.as::get id()
    public get id(): number
    {
        return this._id;
    }

    // AS3: SnowWarGameEventData.as::set id()
    public set id(value: number)
    {
        this._id = value;
    }

    // AS3: SnowWarGameEventData.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        void wrapper;
    }
}
