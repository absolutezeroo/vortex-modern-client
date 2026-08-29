import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The wire form of one object in a snow-war arena: a snowball, a tree, a pile, a machine, a player.
 *
 * Every subclass is the same shape — a flat `int[]` read off the wire, plus getters that name its
 * slots. Slot 0 is the type and slot 1 the id, both written by the constructor before anything is
 * parsed; `parse()` fills the rest from index 2 up to the subclass's own `NUM_OF_VARIABLES`. That
 * count is the *only* thing separating one subclass's wire layout from another's, which is why
 * getting it wrong desyncs the whole packet rather than one field.
 *
 * The five `OBJECT_TYPE_*` names and `_variables` are recovered from the 2016 tree, where this class
 * is unobfuscated; the 2026 build carries the same constants as `_SafeStr_*`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1721/SnowWarGameObjectData.as
 * @see sources/PRODUCTION-201601012205-226667486/src/snowwar/_Str_62/SnowWarGameObjectData.as
 */
export class SnowWarGameObjectData
{
    // AS3: SnowWarGameObjectData.as::OBJECT_TYPE_SNOWBALL
    public static readonly OBJECT_TYPE_SNOWBALL: number = 1;

    // AS3: SnowWarGameObjectData.as::OBJECT_TYPE_TREE
    public static readonly OBJECT_TYPE_TREE: number = 2;

    // AS3: SnowWarGameObjectData.as::OBJECT_TYPE_SNOWBALL_PILE
    public static readonly OBJECT_TYPE_SNOWBALL_PILE: number = 3;

    // AS3: SnowWarGameObjectData.as::OBJECT_TYPE_SNOWBALL_MACHINE
    public static readonly OBJECT_TYPE_SNOWBALL_MACHINE: number = 4;

    // AS3: SnowWarGameObjectData.as::OBJECT_TYPE_HUMAN
    public static readonly OBJECT_TYPE_HUMAN: number = 5;

    /**
     * TS-only: AS3's `create()` switches over the five subclasses and imports them directly. In ESM
     * that static import makes this module evaluate before its own subclasses, so every
     * `extends SnowWarGameObjectData` runs against a binding still in its temporal dead zone. Each
     * subclass registers itself here at module scope instead, which keeps the base a leaf.
     */
    // TS-only: ESM cycle breaker for AS3's direct-`new` factory switch — see above.
    private static readonly CTORS: Map<number, new (type: number, id: number) => SnowWarGameObjectData> = new Map();

    // AS3: SnowWarGameObjectData.as::_variables
    protected _variables: number[] = [];

    // AS3: SnowWarGameObjectData.as::SnowWarGameObjectData()
    public constructor(type: number, id: number)
    {
        this.setVariable(0, type);
        this.setVariable(1, id);
    }

    // TS-only: ESM cycle breaker — subclasses call this at module scope so `create()` can find them.
    public static register(type: number, ctor: new (type: number, id: number) => SnowWarGameObjectData): void
    {
        SnowWarGameObjectData.CTORS.set(type, ctor);
    }

    /**
     * An unknown type is `null`, not a base instance — `GameObjectsData` pushes whatever comes back,
     * so a silent base instance would sit in the arena's object list reading zero for everything.
     */
    // AS3: SnowWarGameObjectData.as::create()
    public static create(type: number, id: number): SnowWarGameObjectData | null
    {
        const ctor = SnowWarGameObjectData.CTORS.get(type);

        if(!ctor)
        {
            return null;
        }

        return new ctor(type, id);
    }

    // AS3: SnowWarGameObjectData.as::get type()
    public get type(): number
    {
        return this.getVariable(0);
    }

    // AS3: SnowWarGameObjectData.as::get id()
    public get id(): number
    {
        return this.getVariable(1);
    }

    /**
     * AS3 declares this `int`, so a slot the wire never filled reads 0 rather than `undefined`. The
     * `?? 0` is that coercion, not a guard added by the port.
     */
    // AS3: SnowWarGameObjectData.as::getVariable()
    public getVariable(index: number): number
    {
        return this._variables[index] ?? 0;
    }

    // AS3: SnowWarGameObjectData.as::setVariable()
    protected setVariable(index: number, value: number): void
    {
        this._variables[index] = value;
    }

    /**
     * Slots 0 and 1 are already set by the constructor, which is why the read starts at 2.
     */
    // AS3: SnowWarGameObjectData.as::parseVariables()
    protected parseVariables(wrapper: IMessageDataWrapper, count: number): void
    {
        let index = 2;

        while(index < count)
        {
            this._variables.push(wrapper.readInt());
            index++;
        }
    }

    // AS3: SnowWarGameObjectData.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        void wrapper;
    }
}
