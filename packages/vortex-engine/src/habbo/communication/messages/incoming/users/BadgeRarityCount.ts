/**
 * How many badges a player holds at one rarity tier — one entry of the extended profile's
 * `badgeRarityCounts` list.
 *
 * The tier arrives as a *byte* and the count as an int, which is the only thing about this class
 * that can go wrong: reading the tier as an int swallows three bytes of the count and desyncs the
 * rest of the packet.
 *
 * The AS3 class is obfuscated in every tree and postdates the 2016 build, so the class name here
 * is DERIVED from the accessor that returns the list; both members keep their real names.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_3034.as
 */
export class BadgeRarityCount
{
    // AS3: .../src/unknowns/_SafePkg_1731/_SafeCls_3034.as::_SafeStr_9163 (name from `get rarityId()`)
    private _rarityId: number;

    // AS3: .../src/unknowns/_SafePkg_1731/_SafeCls_3034.as::_count
    private _count: number;

    // AS3: .../src/unknowns/_SafePkg_1731/_SafeCls_3034.as::_SafeCls_3034()
    constructor(rarityId: number, count: number)
    {
        this._rarityId = rarityId;
        this._count = count;
    }

    // AS3: .../src/unknowns/_SafePkg_1731/_SafeCls_3034.as::get rarityId()
    get rarityId(): number
    {
        return this._rarityId;
    }

    // AS3: .../src/unknowns/_SafePkg_1731/_SafeCls_3034.as::get count()
    get count(): number
    {
        return this._count;
    }
}
