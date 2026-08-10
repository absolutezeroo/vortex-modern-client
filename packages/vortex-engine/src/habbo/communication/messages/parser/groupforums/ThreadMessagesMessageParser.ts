import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ForumMessage} from './ForumMessage';

/**
 * A page of posts inside one thread.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_2469.as
 * (readable as `ThreadMessagesMessageEventParser` in win63_version)
 *
 * The forum and thread ids frame the list and are not repeated per post, so each record is
 * stamped with them as it is read — that is the only place a ForumMessage gets them.
 */
export class ThreadMessagesMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2469.as::_groupId
    private _groupId: number = 0;

    // AS3: _SafeCls_2469.as::_threadId
    private _threadId: number = 0;

    // AS3: _SafeCls_2469.as::_startIndex
    private _startIndex: number = 0;

    // AS3: _SafeCls_2469.as::_amount
    private _amount: number = 0;

    // AS3: _SafeCls_2469.as::_messages
    private _messages: ForumMessage[] = [];

    // AS3: _SafeCls_2469.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: _SafeCls_2469.as::get threadId()
    get threadId(): number
    {
        return this._threadId;
    }

    // AS3: _SafeCls_2469.as::get startIndex()
    get startIndex(): number
    {
        return this._startIndex;
    }

    // AS3: _SafeCls_2469.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: _SafeCls_2469.as::get messages()
    get messages(): ForumMessage[]
    {
        return this._messages;
    }

    // AS3: _SafeCls_2469.as::flush()
    flush(): boolean
    {
        this._groupId = 0;
        this._threadId = 0;
        this._startIndex = 0;
        this._amount = 0;
        this._messages = [];

        return true;
    }

    // AS3: _SafeCls_2469.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._groupId = wrapper.readInt();
        this._threadId = wrapper.readInt();
        this._startIndex = wrapper.readInt();
        this._amount = wrapper.readInt();

        for(let i = 0; i < this._amount; i++)
        {
            const message = ForumMessage.readFromMessage(wrapper);

            message.groupID = this._groupId;
            message.threadId = this._threadId;
            this._messages.push(message);
        }

        return true;
    }
}
