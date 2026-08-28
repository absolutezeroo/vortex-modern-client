/**
 * The xorshift generator the snowball game runs on.
 *
 * It has to be xorshift and not `Math.random()`: Snow War is **lock-step deterministic** — every
 * client advances the same simulation from the same seed and the server sends only inputs, so two
 * clients that disagree about a random number disagree about the whole game. `iterateSeed()` is the
 * exact 13/17/5 shift triple the server's own generator uses.
 *
 * `bitPrint()` is AS3's debug helper, kept because the class has three members and dropping one
 * would make the port look like a partial one.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/QuickRandom.as
 */
export class QuickRandom
{
    /**
     * AS3: QuickRandom.as::iterateSeed()
     *
     * A zero seed is replaced by -1, because xorshift is absorbing at zero — every later value
     * would be zero too.
     *
     * The `| 0` after each step is not decoration: AS3's `int` wraps at 32 bits and JavaScript's
     * numbers do not, so without it the shifts drift out of the range the server is generating in.
     */
    // AS3: QuickRandom.as::iterateSeed()
    public static iterateSeed(seed: number): number
    {
        let value = seed | 0;

        if(value === 0) value = -1;

        value = (value ^ (value << 13)) | 0;
        value = (value ^ (value >> 17)) | 0;

        return (value ^ (value << 5)) | 0;
    }

    /** The absolute value modulo `range`, and 0 for a zero range rather than a division by it. */
    // AS3: QuickRandom.as::getRandomNumber()
    public static getRandomNumber(seed: number, range: number): number
    {
        if(range === 0) return 0;

        return (seed < 0 ? seed * -1 : seed) % range;
    }

    /** AS3's own debug helper: the 32 bits of `value`, most significant first. */
    // AS3: QuickRandom.as::bitPrint()
    protected static bitPrint(value: number): string
    {
        let out = '';

        for(let bit = 31; bit >= 0; bit--)
        {
            out += (value & (1 << bit)) > 0 ? '1' : '0';
        }

        return out;
    }
}
