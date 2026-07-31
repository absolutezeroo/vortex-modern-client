/**
 * RelationshipStatusEnum
 *
 * The four relationship statuses a friend entry can carry, and the string names the
 * badge assets are keyed by.
 *
 * The class name is recovered from
 * `PRODUCTION-201601012205-226667486/.../friendlist/RelationshipStatusEnum.as`, which
 * declares the same shape unobfuscated. **`HEART` is derived**: WIN63 leaves `NONE`,
 * `SMILE` and `BOBBA` readable but obfuscates the value-1 constant, and the 2016 build
 * obfuscates all three names — the name comes from the class's own string table,
 * where index 1 is `"heart"`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_2095.as
 */
export class RelationshipStatusEnum
{
    // AS3: .../_SafeCls_2095.as::NONE
    static readonly NONE: number = 0;

    // AS3: .../_SafeCls_2095.as::HEART
    static readonly HEART: number = 1;

    // AS3: .../_SafeCls_2095.as::SMILE
    static readonly SMILE: number = 2;

    // AS3: .../_SafeCls_2095.as::BOBBA
    static readonly BOBBA: number = 3;

    // AS3: .../_SafeCls_2095.as::_asString
    private static readonly AS_STRING: string[] = ['none', 'heart', 'smile', 'bobba'];

    /** The three statuses that actually render a badge — `NONE` draws nothing. */
    // AS3: .../_SafeCls_2095.as::get displayableStatuses()
    static get displayableStatuses(): number[]
    {
        return [RelationshipStatusEnum.HEART, RelationshipStatusEnum.SMILE, RelationshipStatusEnum.BOBBA];
    }

    // AS3: .../_SafeCls_2095.as::statusAsString()
    static statusAsString(status: number): string
    {
        return RelationshipStatusEnum.AS_STRING[status]!;
    }

    // AS3: .../_SafeCls_2095.as::stringAsStatus()
    static stringAsStatus(name: string): number
    {
        for(const status of RelationshipStatusEnum.displayableStatuses)
        {
            if(RelationshipStatusEnum.statusAsString(status) === name)
            {
                return status;
            }
        }

        return RelationshipStatusEnum.NONE;
    }
}
