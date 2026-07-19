import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the answer text of a single FAQ question, sent in response to
 * GetFaqTextMessageComposer(questionId).
 *
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/parser/help/FaqTextMessageParser.as
 *      (name recovered via sources/PRODUCTION-201601012205-226667486/OriginalClassNames.txt; exact field match with
 *      sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/help/_SafeCls_4068.as)
 */
export class FaqTextMessageParser implements IMessageParser 
{
    private _questionId: number = -1;

    get questionId(): number 
    {
        return this._questionId;
    }

    private _answerText: string | null = null;

    get answerText(): string | null 
    {
        return this._answerText;
    }

    flush(): boolean 
    {
        this._questionId = -1;
        this._answerText = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean 
    {
        if(!wrapper) return false;

        this._questionId = wrapper.readInt();
        this._answerText = wrapper.readString();

        return true;
    }
}
