/**
 * The one thing the rest of the client asks the vault: is there something to collect?
 *
 * The purse area reads it to decide whether to show its indicator dot, which is why the interface
 * exists at all rather than the toolbar taking the whole controller.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/earnings/_SafeCls_1750.as
 * (name derived: obfuscated in every tree, named for its one implementor)
 */
export interface IEarningsController
{
    // AS3: _SafeCls_1750.as::get showingIndicator()
    readonly showingIndicator: boolean;
}
