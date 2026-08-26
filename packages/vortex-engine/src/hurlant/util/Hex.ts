/**
 * Hex — hurlant's byte/hex conversion helper.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/hurlant/util/_SafeCls_69.as
 *
 * Only `fromArray()` is ported: it is the single member this client reaches, from the new mod
 * tool's room-name check. The rest of the class (`toArray`, `toString`, `fromString`) is left out
 * rather than stubbed, since nothing in the port calls it.
 *
 * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/hurlant/util/_SafeCls_69.as::toRawString() —
 * not ported. Dead in AS3 itself: `grep -rn toRawString` across every source tree (WIN63,
 * win63_version, PRODUCTION) turns up only the declaration, no caller.
 * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/hurlant/util/_SafeCls_69.as::fromRawString() —
 * same: declared, never called anywhere in any AS3 tree.
 */
export class Hex
{
    /**
     * `("0" + b.toString(16)).substr(-2, 2)` in AS3 — a right-anchored two-character slice, which
     * `padStart(2, '0')` reproduces exactly for the 0..255 a byte can hold.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/hurlant/util/_SafeCls_69.as::fromArray()
    public static fromArray(bytes: Uint8Array, colons: boolean = false): string
    {
        let result: string = '';

        for(let index = 0; index < bytes.length; index++)
        {
            result += bytes[index].toString(16).padStart(2, '0');

            if(colons)
            {
                if(index < bytes.length - 1) result += ':';
            }
        }

        return result;
    }
}
