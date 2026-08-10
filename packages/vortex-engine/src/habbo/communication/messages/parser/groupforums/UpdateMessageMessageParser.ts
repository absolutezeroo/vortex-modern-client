import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ForumMessage} from './ForumMessage';

/**
 * A post whose state changed — hidden, restored, or moderated. Same wire shape as the new-post
 * reply; the header separates them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_2934.as
 * (readable as `UpdateMessageMessageEventParser` in win63_version)
 */
export class UpdateMessageMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2934.as::_groupId
    private _groupId: number = 0;

    // AS3: _SafeCls_2934.as::_threadId
    private _threadId: number = 0;

    // AS3: _SafeCls_2934.as::_message
    private _message: ForumMessage | null = null;

    // AS3: _SafeCls_2934.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: _SafeCls_2934.as::get threadId()
    get threadId(): number
    {
        return this._threadId;
    }

    // AS3: _SafeCls_2934.as::get message()
    get message(): ForumMessage | null
    {
        return this._message;
    }

    // AS3: _SafeCls_2934.as::flush()
    flush(): boolean
    {
        this._groupId = 0;
        this._threadId = 0;
        this._message = null;

        return true;
    }

    // AS3: _SafeCls_2934.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._groupId = wrapper.readInt();
        this._threadId = wrapper.readInt();
        this._message = ForumMessage.readFromMessage(wrapper);

        return true;
    }
}
