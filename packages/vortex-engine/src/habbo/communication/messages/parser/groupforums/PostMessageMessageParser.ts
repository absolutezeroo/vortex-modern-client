import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ForumMessage} from './ForumMessage';

/**
 * A post that has just been created, echoed back so the open thread can append it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_3180.as
 * (readable as `PostMessageMessageEventParser` in win63_version)
 *
 * Identical on the wire to the update-message reply (`_SafeCls_2934`), which is why they are two
 * classes rather than one: the header is what tells "new post" from "post edited".
 */
export class PostMessageMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3180.as::_groupId
    private _groupId: number = 0;

    // AS3: _SafeCls_3180.as::_threadId
    private _threadId: number = 0;

    // AS3: _SafeCls_3180.as::_message
    private _message: ForumMessage | null = null;

    // AS3: _SafeCls_3180.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: _SafeCls_3180.as::get threadId()
    get threadId(): number
    {
        return this._threadId;
    }

    // AS3: _SafeCls_3180.as::get message()
    get message(): ForumMessage | null
    {
        return this._message;
    }

    // AS3: _SafeCls_3180.as::flush()
    flush(): boolean
    {
        this._groupId = 0;
        this._threadId = 0;
        this._message = null;

        return true;
    }

    // AS3: _SafeCls_3180.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._groupId = wrapper.readInt();
        this._threadId = wrapper.readInt();
        this._message = ForumMessage.readFromMessage(wrapper);

        return true;
    }
}
