import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {PendingGuideTicket} from './PendingGuideTicket';

/**
 * Whether the player may open a guide ticket, and the one they already have open if they may not
 * (header 3725).
 *
 * The ticket is only on the wire for status 1, so the read is conditional — which is why this
 * parser has to branch rather than read a fixed field list.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/help/_SafeCls_2138.as
 */
export class GuideReportingStatusMessageParser implements IMessageParser
{
    public static readonly STATUS_OK: number = 0;
    public static readonly STATUS_PENDING: number = 1;
    public static readonly STATUS_BLOCKED: number = 2;
    public static readonly STATUS_TOO_QUICK: number = 3;

    private _statusCode: number = 0;

    // AS3: .../messages/parser/help/_SafeCls_2138.as::_SafeStr_8024 (name from `get pendingTicket()`)
    private _pendingTicket: PendingGuideTicket | null = null;

    // AS3: .../messages/parser/help/_SafeCls_2138.as::get statusCode()
    get statusCode(): number
    {
        return this._statusCode;
    }

    /**
     * The ticket the player already has open, or null. Non-null only for `STATUS_PENDING` — the
     * server sends nothing for the other three codes.
     */
    // AS3: .../messages/parser/help/_SafeCls_2138.as::get pendingTicket()
    get pendingTicket(): PendingGuideTicket | null
    {
        return this._pendingTicket;
    }

    // AS3: .../messages/parser/help/_SafeCls_2138.as::get localizationCode()
    get localizationCode(): string
    {
        switch(this._statusCode - 2)
        {
            case 0:
                return 'blocked';
            case 1:
                return 'tooquick';
            default:
                return '';
        }
    }

    // AS3: .../messages/parser/help/_SafeCls_2138.as::flush()
    // AS3 clears only the ticket here, not the status code.
    flush(): boolean
    {
        this._pendingTicket = null;

        return true;
    }

    // AS3: .../messages/parser/help/_SafeCls_2138.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._statusCode = wrapper.readInt();

        if(this._statusCode === GuideReportingStatusMessageParser.STATUS_PENDING)
        {
            this._pendingTicket = new PendingGuideTicket(wrapper);
        }

        return true;
    }
}
