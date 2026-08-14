/**
 * How many transaction rows the paged transactions window asks for at a time.
 *
 * This is the whole class in AS3 — one static, no behaviour. It is ported here alone, ahead of the
 * rest of `wired_trading/transactions/overview` (the paged window itself, its controller, its table
 * object), because the chests tab's "view in detail" button sends this page size and would otherwise
 * be blocked on a subsystem it needs one integer from.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/transactions/overview/TransactionConfig.as
 */
export class TransactionConfig
{
    /**
	 * AS3 declares this `public static var`, not `const`, and nothing assigns it.
	 */
    // AS3: TransactionConfig.as::PAGE_SIZE
    static readonly PAGE_SIZE: number = 25;
}
