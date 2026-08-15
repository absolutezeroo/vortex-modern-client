/**
 * The two kinds of wired chest: one that holds furniture, one that holds coins.
 *
 * A whole class in AS3 for two constants, with no behaviour — kept as its own file rather than
 * folded into the controller, because both sub-controllers and the wrapper view read it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/_SafeCls_4300.as
 * (name derived: obfuscated in every tree; the two *members* kept their real names)
 */
export class ChestType
{
    /**
	 * AS3 declares both as `public static var`, not `const`, and nothing assigns them.
	 */
    // AS3: _SafeCls_4300.as::TYPE_FURNI
    static readonly TYPE_FURNI: number = 0;

    // AS3: _SafeCls_4300.as::TYPE_COIN
    static readonly TYPE_COIN: number = 1;
}
