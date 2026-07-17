/**
 * Furniture ID range classification.
 *
 * The server encodes a furni's provenance in its ID: the top of the int range is reserved for
 * Builder's Club items, the band just below it for temporary (rented) items, and everything
 * below that is a normal item.
 *
 * The class name is obfuscated in every available tree; `BuilderClubUtils` is this port's own
 * name for it, kept from when only `isBuilderClubId()` was ported. The member names are real.
 * `sources/win63_version/habbo/utils/class_2262.as` is an older revision of this class with an
 * unbounded `isBuilderClubId()` and no temp/normal range at all — do not port from it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_1824.as
 */
export class BuilderClubUtils
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_1824.as::MAX_CLUB_FURNI_ID
    public static readonly MAX_CLUB_FURNI_ID: number = 2147483647;

    // Name derived from its value and its pairing with MAX_CLUB_FURNI_ID — obfuscated in every
    // available tree.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_1824.as::MIN_CLUB_FURNI_ID
    public static readonly MIN_CLUB_FURNI_ID: number = 2147418112;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_1824.as::MAX_TEMP_FURNI_ID
    public static readonly MAX_TEMP_FURNI_ID: number = 2147418111;

    // Name derived from its value and its pairing with MAX_TEMP_FURNI_ID — obfuscated in every
    // available tree.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_1824.as::MIN_TEMP_FURNI_ID
    public static readonly MIN_TEMP_FURNI_ID: number = 2147401728;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_1824.as::MAX_NORMAL_FURNI_ID
    public static readonly MAX_NORMAL_FURNI_ID: number = 2147401727;

    /**
	 * Check if an ID belongs to a Builder Club item.
	 *
	 * @param id The item ID to check
	 * @returns True if the ID falls in the Builder Club range
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_1824.as::isBuilderClubId()
    static isBuilderClubId(id: number): boolean
    {
        return id >= BuilderClubUtils.MIN_CLUB_FURNI_ID && id <= BuilderClubUtils.MAX_CLUB_FURNI_ID;
    }

    /**
	 * Check if an ID belongs to a temporary (rented) item.
	 *
	 * @param id The item ID to check
	 * @returns True if the ID falls in the temporary-item range
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_1824.as::isTempId()
    static isTempId(id: number): boolean
    {
        return id >= BuilderClubUtils.MIN_TEMP_FURNI_ID && id <= BuilderClubUtils.MAX_TEMP_FURNI_ID;
    }

    /**
	 * Check if an ID belongs to a normal item.
	 *
	 * @param id The item ID to check
	 * @returns True if the ID is below the temporary-item range
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/_SafeCls_1824.as::isNormalId()
    static isNormalId(id: number): boolean
    {
        return id <= BuilderClubUtils.MAX_NORMAL_FURNI_ID;
    }
}
