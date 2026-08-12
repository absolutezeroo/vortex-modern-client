/**
 * The colour each rarity tier is drawn in.
 *
 * **The lookup is case-broken in AS3 and ported as written.** `getRarityColor()` upper-cases its
 * argument and then tests it against a table whose keys are all lower-case, so `hasOwnProperty()`
 * never matches and *every* rarity resolves to the grey fallback. The table below is therefore
 * dead in the Flash client too — every rarity badge in the collectibles UI is grey today.
 *
 * Left alone deliberately: "fixing" the case would change what the client draws, which is a visual
 * decision, not a port one. The table is kept so the intended colours are recorded rather than lost.
 *
 * Name DERIVED: obfuscated in every tree (`_SafeCls_2814`), named for its one method.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/collectibles/util/_SafeCls_2814.as
 */
export class CollectibleRarity
{
    // AS3: _SafeCls_2814.as::rarityColors
    private static readonly RARITY_COLORS: Record<string, number> = {
        common: 6187373,
        uncommon: 24916,
        rare: 1202293,
        epic: 7150694,
        legendary: 8526848,
        'legendary+': 11167744,
    };

    /** The grey every rarity actually gets — see the class note. */
    // AS3: _SafeCls_2814.as::getRarityColor() (the fallback return)
    public static readonly DEFAULT_COLOR: number = 8947848;

    // AS3: _SafeCls_2814.as::getRarityColor()
    public static getRarityColor(rarity: string): number
    {
        // AS3 upper-cases here against a lower-case table. Kept — see the class note.
        const key = rarity.toUpperCase();

        if(Object.prototype.hasOwnProperty.call(CollectibleRarity.RARITY_COLORS, key))
        {
            return CollectibleRarity.RARITY_COLORS[key];
        }

        return CollectibleRarity.DEFAULT_COLOR;
    }
}
