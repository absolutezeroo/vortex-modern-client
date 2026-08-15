/**
 * What the rest of the client may ask of the wired-chest controller: open a chest, or close
 * whatever is open.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/_SafeCls_2148.as
 * (name derived: obfuscated in every tree, named for the controller that implements it)
 */
export interface IWiredChest
{
    // AS3: _SafeCls_2148.as::open()
    open(chestId: number): void;

    // AS3: _SafeCls_2148.as::close()
    close(): void;
}
