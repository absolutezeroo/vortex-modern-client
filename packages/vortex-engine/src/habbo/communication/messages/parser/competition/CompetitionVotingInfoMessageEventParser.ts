import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for competition voting info message
 *
 * Parses voting information including goal ID, goal code, result code,
 * whether voting is allowed, and votes remaining.
 *
 * @see source_as_win63/habbo/communication/messages/parser/competition/CompetitionVotingInfoMessageEventParser.as
 */
export class CompetitionVotingInfoMessageEventParser implements IMessageParser
{
    private _goalId: number = 0;

    get goalId(): number
    {
        return this._goalId;
    }

    private _goalCode: string = '';

    get goalCode(): string
    {
        return this._goalCode;
    }

    private _resultCode: number = 0;

    get resultCode(): number
    {
        return this._resultCode;
    }

    private _votesRemaining: number = 0;

    get votesRemaining(): number
    {
        return this._votesRemaining;
    }

    get isVotingAllowedForUser(): boolean
    {
        return this._resultCode === 0;
    }

    flush(): boolean
    {
        this._goalId = 0;
        this._goalCode = '';
        this._resultCode = 0;
        this._votesRemaining = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._goalId = wrapper.readInt();
        this._goalCode = wrapper.readString();
        this._resultCode = wrapper.readInt();
        this._votesRemaining = wrapper.readInt();

        return true;
    }
}
