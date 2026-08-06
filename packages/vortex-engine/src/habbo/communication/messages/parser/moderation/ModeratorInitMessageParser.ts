import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ModeratorInitData} from './ModeratorInitData';

/**
 * Parser for moderator initialization message.
 * Contains issues, templates, permissions, and room message templates.
 *
 * @see source_as_win63/habbo/communication/messages/parser/moderation/ModeratorInitMessageEventParser.as
 */
export class ModeratorInitMessageParser implements IMessageParser
{
    private _data: ModeratorInitData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorInitMessageEventParser.as::get data()
    get data(): ModeratorInitData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorInitMessageEventParser.as::flush()
    flush(): boolean
    {
        if(this._data)
        {
            this._data.dispose();
            this._data = null;
        }

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/moderation/ModeratorInitMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new ModeratorInitData(wrapper);

        return true;
    }
}
