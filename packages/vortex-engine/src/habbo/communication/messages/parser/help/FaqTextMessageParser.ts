import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the answer text of a single FAQ question, sent in response to
 * GetFaqTextMessageComposer(questionId).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/help/_SafeCls_4068.as
 *
 * The name is RECOVERED, but not from a file: `PRODUCTION-201601012205-226667486` has no
 * `help/FaqTextMessageParser.as` — it is `OriginalClassNames.txt` in that tree's root that carries
 * the mapping, and the fields of `_SafeCls_4068` match it exactly.
 */
export class FaqTextMessageParser implements IMessageParser 
{
    private _questionId: number = -1;

    // AS3: .../src/com/sulake/habbo/communication/messages/parser/help/_SafeCls_4068.as::get questionId()
    get questionId(): number 
    {
        return this._questionId;
    }

    private _answerText: string | null = null;

    // AS3: .../src/com/sulake/habbo/communication/messages/parser/help/_SafeCls_4068.as::get answerText()
    get answerText(): string | null 
    {
        return this._answerText;
    }

    // AS3: .../src/com/sulake/habbo/communication/messages/parser/help/_SafeCls_4068.as::flush()
    flush(): boolean 
    {
        this._questionId = -1;
        this._answerText = null;
        return true;
    }

    // AS3: .../src/com/sulake/habbo/communication/messages/parser/help/_SafeCls_4068.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean 
    {
        if(!wrapper) return false;

        this._questionId = wrapper.readInt();
        this._answerText = wrapper.readString();

        return true;
    }
}
