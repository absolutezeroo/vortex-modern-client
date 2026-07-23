/**
 * TradeRequirementRule — the trade-requirement rule mode constants for wired trading contracts
 * (InitiateTransaction). A pure constants holder: three int modes 0/1/2.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4486`) and the three mode members carry no
 * recoverable names in any tree (they postdate the 2016 PRODUCTION build); the class name follows the
 * AS3 package path `wiredtrading/trade/requirements/rules`. TYPE_0/1/2 preserve the AS3 ordinal values;
 * behaviour observed in InitiateTransaction: TYPE_0 disables the amount section, TYPE_2 switches the
 * amount title to the "multiplier_selection2" variant.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/_SafeCls_4486.as
 */
export class TradeRequirementRule
{
    // AS3: _SafeCls_4486.as::_SafeStr_10448 (name derived: rule mode 0)
    public static readonly TYPE_0: number = 0;

    // AS3: _SafeCls_4486.as::_SafeStr_10226 (name derived: rule mode 1)
    public static readonly TYPE_1: number = 1;

    // AS3: _SafeCls_4486.as::_SafeStr_8654 (name derived: rule mode 2)
    public static readonly TYPE_2: number = 2;
}
