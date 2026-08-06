import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for user classification messages.
 * Contains maps of user IDs to usernames and classification types.
 *
 * @see source_as_win63/habbo/communication/messages/parser/userclassification/UserClassificationMessageEventParser.as
 */
export class UserClassificationMessageParser implements IMessageParser
{
    private _classifiedUsernameMap: Map<number, string> = new Map();

    // AS3: sources/win63_version/habbo/communication/messages/parser/userclassification/UserClassificationMessageEventParser.as::get classifiedUsernameMap()
    get classifiedUsernameMap(): Map<number, string>
    {
        return this._classifiedUsernameMap;
    }

    private _classifiedUserTypeMap: Map<number, string> = new Map();

    // AS3: sources/win63_version/habbo/communication/messages/parser/userclassification/UserClassificationMessageEventParser.as::get classifiedUserTypeMap()
    get classifiedUserTypeMap(): Map<number, string>
    {
        return this._classifiedUserTypeMap;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/userclassification/UserClassificationMessageEventParser.as::flush()
    flush(): boolean
    {
        this._classifiedUsernameMap = new Map();
        this._classifiedUserTypeMap = new Map();
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/userclassification/UserClassificationMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        this._classifiedUsernameMap = new Map();
        this._classifiedUserTypeMap = new Map();

        for(let i = 0; i < count; i++)
        {
            const userId = wrapper.readInt();
            const userName = wrapper.readString();
            const classType = wrapper.readString();

            this._classifiedUsernameMap.set(userId, userName);
            this._classifiedUserTypeMap.set(userId, classType);
        }

        return true;
    }
}
