import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Seconds remaining until a named custom timer (matched by `timeStr`) expires.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/competition/SecondsUntilMessageEventParser.as
 */
export class SecondsUntilMessageEventParser implements IMessageParser
{
    private _timeStr: string = '';
    private _secondsUntil: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/competition/SecondsUntilMessageEventParser.as::flush()
    flush(): boolean
    {
        this._timeStr = '';
        this._secondsUntil = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/competition/SecondsUntilMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._timeStr = wrapper.readString();
        this._secondsUntil = wrapper.readInt();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/competition/SecondsUntilMessageEventParser.as::get timeStr()
    get timeStr(): string
    {
        return this._timeStr;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/competition/SecondsUntilMessageEventParser.as::get secondsUntil()
    get secondsUntil(): number
    {
        return this._secondsUntil;
    }
}
