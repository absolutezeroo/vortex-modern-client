/**
 * Integer square root by table lookup, exact to the same integer the server gets.
 *
 * Class name DERIVED — obfuscated in every tree as `_SafeCls_4189`, named from its single member.
 *
 * The shape is a binary search over the magnitude of the input: eleven nested range tests pick a
 * shift that brings the value into the table's 0..255 window, and the same shift halved comes back
 * out on the result. `sqrt(2^2k · n) = 2^k · sqrt(n)`, so a right-shift of `2k` going in pairs with
 * a left-shift of `k` coming out — which is why the shifts run 24/8, 22/7, 20/6, 18/5 and so on,
 * and why the four smallest buckets shift the *result* right instead.
 *
 * `Math.sqrt` would be more accurate and that is the problem: Snow War is lock-step deterministic
 * and the server computes this table's answer, not the true root. Being closer to the real value
 * than the server is a desync.
 *
 * A negative input answers -1 rather than NaN.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/_SafeCls_4189.as
 */
export class FastSqrt
{
    // AS3: _SafeCls_4189.as::table
    private static readonly TABLE: readonly number[] = [
        0, 16, 22, 27, 32, 35, 39, 42, 45, 48, 50, 53, 55, 57, 59, 61, 64, 65, 67, 69, 71, 73, 75, 76, 78, 80,
        81, 83, 84, 86, 87, 89, 90, 91, 93, 94, 96, 97, 98, 99, 101, 102, 103, 104, 106, 107, 108, 109, 110,
        112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 128, 128, 129, 130, 131, 132,
        133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 144, 145, 146, 147, 148, 149, 150, 150, 151,
        152, 153, 154, 155, 155, 156, 157, 158, 159, 160, 160, 161, 162, 163, 163, 164, 165, 166, 167, 167, 168,
        169, 170, 170, 171, 172, 173, 173, 174, 175, 176, 176, 177, 178, 178, 179, 180, 181, 181, 182, 183, 183,
        184, 185, 185, 186, 187, 187, 188, 189, 189, 190, 191, 192, 192, 193, 193, 194, 195, 195, 196, 197, 197,
        198, 199, 199, 200, 201, 201, 202, 203, 203, 204, 204, 205, 206, 206, 207, 208, 208, 209, 209, 210, 211,
        211, 212, 212, 213, 214, 214, 215, 215, 216, 217, 217, 218, 218, 219, 219, 220, 221, 221, 222, 222, 223,
        224, 224, 225, 225, 226, 226, 227, 227, 228, 229, 229, 230, 230, 231, 231, 232, 232, 233, 234, 234, 235,
        235, 236, 236, 237, 237, 238, 238, 239, 240, 240, 241, 241, 242, 242, 243, 243, 244, 244, 245, 245, 246,
        246, 247, 247, 248, 248, 249, 249, 250, 250, 251, 251, 252, 252, 253, 253, 254, 254, 255
    ];

    // AS3: _SafeCls_4189.as::fast_sqrt()
    public static fastSqrt(value: number): number
    {
        if(value >= 65536)
        {
            if(value >= 16777216)
            {
                if(value >= 268435456)
                {
                    if(value >= 1073741824) return FastSqrt.TABLE[value >> 24] << 8;

                    return FastSqrt.TABLE[value >> 22] << 7;
                }

                if(value >= 67108864) return FastSqrt.TABLE[value >> 20] << 6;

                return FastSqrt.TABLE[value >> 18] << 5;
            }

            if(value >= 1048576)
            {
                if(value >= 4194304) return FastSqrt.TABLE[value >> 16] << 4;

                return FastSqrt.TABLE[value >> 14] << 3;
            }

            if(value >= 262144) return FastSqrt.TABLE[value >> 12] << 2;

            return FastSqrt.TABLE[value >> 10] << 1;
        }

        if(value >= 256)
        {
            if(value >= 4096)
            {
                if(value >= 16384) return FastSqrt.TABLE[value >> 8];

                return FastSqrt.TABLE[value >> 6] >> 1;
            }

            if(value >= 1024) return FastSqrt.TABLE[value >> 4] >> 2;

            return FastSqrt.TABLE[value >> 2] >> 3;
        }

        if(value >= 0) return FastSqrt.TABLE[value] >> 4;

        return -1;
    }
}
