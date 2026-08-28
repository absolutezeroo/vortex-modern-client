/**
 * Java's integer division semantics, which AS3 needs and neither language gives for free.
 *
 * Class name DERIVED — obfuscated in every tree as `_SafeCls_4237`, named from its single member.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/_SafeCls_4237.as
 */
export class MathUtils
{
    /**
     * Truncation **towards zero**, which is what Java's `(int)` cast does and what the server is
     * therefore doing. `Math.floor()` alone would round -0.5 to -1 where the server gets 0, and in
     * a lock-step simulation that one step is a desync.
     */
    // AS3: _SafeCls_4237.as::javaDiv()
    public static javaDiv(value: number): number
    {
        if(value >= 0) return Math.floor(value);

        return Math.ceil(value);
    }
}
