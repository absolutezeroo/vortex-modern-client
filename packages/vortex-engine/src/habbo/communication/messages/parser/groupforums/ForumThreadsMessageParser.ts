import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ForumThread} from './ForumThread';

/**
 * A page of threads in one forum.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_2774.as
 * (readable as `ForumThreadsMessageEventParser` in win63_version)
 */
export class ForumThreadsMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2774.as::_groupId
    private _groupId: number = 0;

    // AS3: _SafeCls_2774.as::_startIndex
    private _startIndex: number = 0;

    // AS3: _SafeCls_2774.as::_amount
    private _amount: number = 0;

    // AS3: _SafeCls_2774.as::_threads
    private _threads: ForumThread[] = [];

    // AS3: _SafeCls_2774.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: _SafeCls_2774.as::get startIndex()
    get startIndex(): number
    {
        return this._startIndex;
    }

    // AS3: _SafeCls_2774.as::get amount()
    get amount(): number
    {
        return this._amount;
    }

    // AS3: _SafeCls_2774.as::get threads()
    get threads(): ForumThread[]
    {
        return this._threads;
    }

    // AS3: _SafeCls_2774.as::flush()
    flush(): boolean
    {
        this._groupId = 0;
        this._startIndex = 0;
        this._amount = 0;
        this._threads = [];

        return true;
    }

    // AS3: _SafeCls_2774.as::parse()
    // AS3 pushes into the existing array rather than replacing it; the flush above is what clears
    // it between messages, so the effect is the same and a stale page cannot survive.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._groupId = wrapper.readInt();
        this._startIndex = wrapper.readInt();
        this._amount = wrapper.readInt();

        for(let i = 0; i < this._amount; i++)
        {
            this._threads.push(ForumThread.readFromMessage(wrapper));
        }

        return true;
    }
}
