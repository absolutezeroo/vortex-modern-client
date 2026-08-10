import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ForumThread} from './ForumThread';

/**
 * A thread that has just been created, echoed back so the forum's thread list can prepend it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_3347.as
 * (readable as `PostThreadMessageEventParser` in win63_version)
 */
export class PostThreadMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3347.as::_groupId
    private _groupId: number = 0;

    // AS3: _SafeCls_3347.as::_thread
    private _thread: ForumThread | null = null;

    // AS3: _SafeCls_3347.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: _SafeCls_3347.as::get thread()
    get thread(): ForumThread | null
    {
        return this._thread;
    }

    // AS3: _SafeCls_3347.as::flush()
    flush(): boolean
    {
        this._groupId = 0;
        this._thread = null;

        return true;
    }

    // AS3: _SafeCls_3347.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._groupId = wrapper.readInt();
        this._thread = ForumThread.readFromMessage(wrapper);

        return true;
    }
}
