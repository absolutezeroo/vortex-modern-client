/**
 * TrophyTheme
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/trophy/TrophyTheme.as
 *
 * Gold/silver/bronze lookup for the trophy frame. Both tables are indexed by the
 * normalized theme, so an out-of-range `furniture_color` falls back to gold rather
 * than reading past the end of the array.
 */
export class TrophyTheme
{
    /**
     * AS3: TrophyTheme.as::_SafeStr_10744
     *
     * Obfuscated in every available tree. The name is DERIVED from its position: it is
     * index 0, which `BACKGROUND_ASSET_NAMES` maps to `trophy_bg_gold`.
     */
    public static readonly GOLD: number = 0;

    // AS3: TrophyTheme.as::SILVER
    public static readonly SILVER: number = 1;

    // AS3: TrophyTheme.as::BRONZE
    public static readonly BRONZE: number = 2;

    // AS3: TrophyTheme.as::DEFAULT_BACKGROUND_TINT
    public static readonly DEFAULT_BACKGROUND_TINT: number = 16777215;

    // AS3: TrophyTheme.as::BACKGROUND_ASSET_NAMES
    private static readonly BACKGROUND_ASSET_NAMES: string[] = ['trophy_bg_gold', 'trophy_bg_silver', 'trophy_bg_bronze'];

    // AS3: TrophyTheme.as::HEADER_COLORS
    private static readonly HEADER_COLORS: number[] = [4293707079, 4291411404, 4290279476];

    // AS3: TrophyTheme.as::normalize()
    public static normalize(theme: number): number
    {
        if(theme < 0 || theme > 2)
        {
            return 0;
        }

        return theme;
    }

    // AS3: TrophyTheme.as::getBackgroundAssetName()
    public static getBackgroundAssetName(theme: number): string
    {
        return TrophyTheme.BACKGROUND_ASSET_NAMES[TrophyTheme.normalize(theme)];
    }

    // AS3: TrophyTheme.as::getHeaderColor()
    public static getHeaderColor(theme: number): number
    {
        return TrophyTheme.HEADER_COLORS[TrophyTheme.normalize(theme)];
    }
}
