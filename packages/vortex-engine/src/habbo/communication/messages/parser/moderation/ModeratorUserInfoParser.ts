import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ModeratorUserInfoData} from './ModeratorUserInfoData';

/**
 * Parser for moderator user info messages.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/ModeratorUserInfoEventParser.as
 */
export class ModeratorUserInfoParser implements IMessageParser
{
    private _data: ModeratorUserInfoData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorUserInfoEventParser.as::get data()
    get data(): ModeratorUserInfoData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorUserInfoEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorUserInfoEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new ModeratorUserInfoData(wrapper);

        return true;
    }
}
