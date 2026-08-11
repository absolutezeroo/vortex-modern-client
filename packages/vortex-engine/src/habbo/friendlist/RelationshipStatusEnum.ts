/**
 * The four relationship statuses a player can set on a friend, and the names the window layout
 * uses for them.
 *
 * `NONE` is deliberately absent from `displayableStatuses`: it is the "clear it" value the selector
 * sends, never a row the infostand draws. The string table is indexed by the status value, so it
 * has to keep `'none'` at position 0 even though nothing displays it.
 *
 * The AS3 class is obfuscated in every tree, so the class name here is DERIVED; the four constants
 * and all three methods keep their real names.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_2095.as
 */
export class RelationshipStatusEnum
{
    // AS3: .../src/com/sulake/habbo/friendlist/_SafeCls_2095.as::NONE
    public static readonly NONE: number = 0;

    /**
     * Name DERIVED from the string table's second entry — the constant's own identifier is
     * obfuscated, unlike its three siblings.
     */
    // AS3: .../src/com/sulake/habbo/friendlist/_SafeCls_2095.as::_SafeStr_10764
    public static readonly HEART: number = 1;

    // AS3: .../src/com/sulake/habbo/friendlist/_SafeCls_2095.as::SMILE
    public static readonly SMILE: number = 2;

    // AS3: .../src/com/sulake/habbo/friendlist/_SafeCls_2095.as::BOBBA
    public static readonly BOBBA: number = 3;

    // AS3: .../src/com/sulake/habbo/friendlist/_SafeCls_2095.as::_asString
    private static readonly AS_STRING: string[] = ['none', 'heart', 'smile', 'bobba'];

    // AS3: .../src/com/sulake/habbo/friendlist/_SafeCls_2095.as::statusAsString()
    public static statusAsString(status: number): string
    {
        return RelationshipStatusEnum.AS_STRING[status];
    }

    // AS3: .../src/com/sulake/habbo/friendlist/_SafeCls_2095.as::get displayableStatuses()
    public static get displayableStatuses(): number[]
    {
        return [RelationshipStatusEnum.HEART, RelationshipStatusEnum.SMILE, RelationshipStatusEnum.BOBBA];
    }

    // AS3: .../src/com/sulake/habbo/friendlist/_SafeCls_2095.as::stringAsStatus()
    public static stringAsStatus(name: string): number
    {
        for(const status of RelationshipStatusEnum.displayableStatuses)
        {
            if(RelationshipStatusEnum.statusAsString(status) === name) return status;
        }

        return RelationshipStatusEnum.NONE;
    }
}
