/**
 * The seven badge rarity tiers, and the colours and localisation keys that go with them.
 *
 * The tiers are **not** a plain ladder: `UNIQUE` (6) is above `LEGENDARY` (5) in the enum but is
 * treated as its own thing everywhere — the badge display gives it the plain header and a white
 * background rather than the tinted treatment the tiers below it get.
 *
 * Class name DERIVED: the AS3 file is `_SafeCls_3609.as` and the identifier exists in no tree.
 * Named after the `badge.rarity.*` keys it produces.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/enum/_SafeCls_3609.as
 */
export class BadgeRarityEnum
{
    // AS3: .../communication/enum/_SafeCls_3609.as::COMMON
    public static readonly COMMON: number = 0;

    // AS3: .../communication/enum/_SafeCls_3609.as::UNCOMMON
    // Name DERIVED (`_SafeStr_10569`): its key is "badge.rarity.uncommon", and it is the tier the
    // `badge_rarity.uncommon` config flag switches on.
    public static readonly UNCOMMON: number = 1;

    // AS3: .../communication/enum/_SafeCls_3609.as::RARE
    public static readonly RARE: number = 2;

    // AS3: .../communication/enum/_SafeCls_3609.as::VERY_RARE
    // Its localisation key is "badge.rarity.epic" — the constant and the key disagree in AS3.
    public static readonly VERY_RARE: number = 3;

    // AS3: .../communication/enum/_SafeCls_3609.as::MYTHICAL
    public static readonly MYTHICAL: number = 4;

    // AS3: .../communication/enum/_SafeCls_3609.as::LEGENDARY
    // Name DERIVED (`_SafeStr_11384`), from its key "badge.rarity.legendary".
    public static readonly LEGENDARY: number = 5;

    // AS3: .../communication/enum/_SafeCls_3609.as::UNIQUE
    // Name DERIVED (`_SafeStr_10700`), from its key "badge.rarity.unique".
    public static readonly UNIQUE: number = 6;

    // AS3: .../communication/enum/_SafeCls_3609.as::UNCOMMON_GLOW_COLOR
    // Name DERIVED (`_SafeStr_11420`): the one colour that only `getGlowColor` uses, and only for
    // the uncommon tier.
    private static readonly UNCOMMON_GLOW_COLOR: number = 11759111;

    // AS3: .../communication/enum/_SafeCls_3609.as::isRareOrHigher()
    public static isRareOrHigher(rarity: number): boolean
    {
        return rarity >= BadgeRarityEnum.RARE;
    }

    /**
     * A "standalone" tier is one that gets its own colour and label rather than being folded into
     * common. Uncommon only qualifies when the config flag is on, which is what
     * `badge_rarity.uncommon` gates.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/enum/_SafeCls_3609.as::isStandaloneTier()
    public static isStandaloneTier(rarity: number, uncommonEnabled: boolean = false): boolean
    {
        return BadgeRarityEnum.isRareOrHigher(rarity) || (uncommonEnabled && rarity === BadgeRarityEnum.UNCOMMON);
    }

    /**
     * AS3 switches on `rarity - 1`, so its cases 0-5 are tiers 1-6; common (0) and anything
     * unknown fall through to the empty string.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/enum/_SafeCls_3609.as::getLocalizationKey()
    public static getLocalizationKey(rarity: number, uncommonEnabled: boolean = false): string
    {
        switch(rarity)
        {
            case BadgeRarityEnum.UNCOMMON:
                return uncommonEnabled ? 'badge.rarity.uncommon' : '';

            case BadgeRarityEnum.RARE:
                return 'badge.rarity.rare';

            case BadgeRarityEnum.VERY_RARE:
                return 'badge.rarity.epic';

            case BadgeRarityEnum.MYTHICAL:
                return 'badge.rarity.mythical';

            case BadgeRarityEnum.LEGENDARY:
                return 'badge.rarity.legendary';

            case BadgeRarityEnum.UNIQUE:
                return 'badge.rarity.unique';

            default:
                return '';
        }
    }

    // AS3: .../communication/enum/_SafeCls_3609.as::getLabelLocalizationKey()
    // Anything not standalone is labelled "common", whatever its actual tier.
    public static getLabelLocalizationKey(rarity: number, uncommonEnabled: boolean = false): string
    {
        return BadgeRarityEnum.isStandaloneTier(rarity, uncommonEnabled)
            ? BadgeRarityEnum.getLocalizationKey(rarity, uncommonEnabled)
            : 'badge.rarity.common';
    }

    // AS3: .../communication/enum/_SafeCls_3609.as::getDisplayColor()
    // Uncommon is the only tier whose colour depends on the flag; without it, it is black (0),
    // which is what makes an unflagged uncommon badge indistinguishable from common.
    public static getDisplayColor(rarity: number, uncommonEnabled: boolean = false): number
    {
        switch(rarity)
        {
            case BadgeRarityEnum.UNCOMMON:
                return uncommonEnabled ? 16758605 : 0;

            case BadgeRarityEnum.RARE:
                return 8780159;

            case BadgeRarityEnum.VERY_RARE:
                return 6732543;

            case BadgeRarityEnum.MYTHICAL:
                return 12809942;

            case BadgeRarityEnum.LEGENDARY:
                return 14036772;

            case BadgeRarityEnum.UNIQUE:
                return 13406720;

            default:
                return 0;
        }
    }

    // AS3: .../communication/enum/_SafeCls_3609.as::getGlowColor()
    // The one place uncommon gets a colour of its own rather than the display colour.
    public static getGlowColor(rarity: number, uncommonEnabled: boolean = false): number
    {
        return uncommonEnabled && rarity === BadgeRarityEnum.UNCOMMON
            ? BadgeRarityEnum.UNCOMMON_GLOW_COLOR
            : BadgeRarityEnum.getDisplayColor(rarity, uncommonEnabled);
    }

    /**
     * The tag colour on a white background: darkened progressively *less* as the tier rises, so
     * the rarer the badge the closer its tag stays to the display colour.
     *
     * This switch is on the raw rarity, not `rarity - 1` like the two above — the one place in
     * the class where the indexing differs.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/enum/_SafeCls_3609.as::getWhiteBackgroundTagColor()
    public static getWhiteBackgroundTagColor(rarity: number, uncommonEnabled: boolean = false): number
    {
        switch(rarity)
        {
            case 0:
                return 7829367;

            case 1:
                return uncommonEnabled ? BadgeRarityEnum.getDisplayColor(rarity, uncommonEnabled) : 7829367;

            case 2:
                return BadgeRarityEnum.darkenColor(BadgeRarityEnum.getDisplayColor(rarity, uncommonEnabled), 0.35);

            case 3:
                return BadgeRarityEnum.darkenColor(BadgeRarityEnum.getDisplayColor(rarity, uncommonEnabled), 0.2);

            case 4:
                return BadgeRarityEnum.darkenColor(BadgeRarityEnum.getDisplayColor(rarity, uncommonEnabled), 0.15);

            case 5:
                return BadgeRarityEnum.darkenColor(BadgeRarityEnum.getDisplayColor(rarity, uncommonEnabled), 0.1);

            default:
                return BadgeRarityEnum.getDisplayColor(rarity, uncommonEnabled);
        }
    }

    // AS3: .../communication/enum/_SafeCls_3609.as::darkenColor()
    // No alpha byte, unlike the badge display's own lighten/multiply pair.
    private static darkenColor(color: number, amount: number): number
    {
        const factor = 1 - amount;
        const r = Math.trunc(((color >> 16) & 0xFF) * factor);
        const g = Math.trunc(((color >> 8) & 0xFF) * factor);
        const b = Math.trunc((color & 0xFF) * factor);

        return (r << 16) | (g << 8) | b;
    }
}
