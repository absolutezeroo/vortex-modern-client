import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ForumPermissions} from './ForumPermissions';

/**
 * One forum in full, with this user's rights in it — the answer to a forum-stats request.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_4043.as
 * (readable as `ForumDataMessageEventParser` in win63_version)
 */
export class ForumDataMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4043.as::_forumData
    private _forumData: ForumPermissions | null = null;

    // AS3: _SafeCls_4043.as::get forumData()
    get forumData(): ForumPermissions | null
    {
        return this._forumData;
    }

    // AS3: _SafeCls_4043.as::flush()
    flush(): boolean
    {
        this._forumData = null;

        return true;
    }

    // AS3: _SafeCls_4043.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._forumData = ForumPermissions.readFromMessage(wrapper);

        return true;
    }
}
