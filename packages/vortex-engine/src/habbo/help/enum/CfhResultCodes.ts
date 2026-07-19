/**
 * Call For Help result codes
 *
 * Constants for CFH submission results.
 *
 * @see source_as_win63/habbo/help/enum/class_3529.as
 */
export class CfhResultCodes
{
    public static readonly CALL_FOR_HELP_SENT_OK: string = 'CFHRE_SENT_OK';
    public static readonly TOO_MANY_PENDING_CALLS: string = 'CFHRE_ERROR_TOO_MANY_PENDING';
    public static readonly HAS_ABUSIVE_CALL: string = 'CFHRE_HAS_ABUSIVE_CALL';

    public static readonly TOO_MANY_PENDING_CALLS_CODE: number = 1;
    public static readonly HAS_ABUSIVE_CALL_CODE: number = 2;
}
