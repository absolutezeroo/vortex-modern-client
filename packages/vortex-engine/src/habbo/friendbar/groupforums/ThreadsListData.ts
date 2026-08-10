import type {ForumThread} from '@habbo/communication/messages/parser/groupforums/ForumThread';

/**
 * One page of threads, plus an id index over it so a single-thread update does not have to scan.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/ThreadsListData.as
 */
export class ThreadsListData
{
    // AS3: ThreadsListData.as::PAGE_SIZE
    // The page size every forum request carries — the third argument of GetForumsList,
    // GetThreads and GetMessages alike.
    static readonly PAGE_SIZE: number = 20;

    // AS3: ThreadsListData.as::_totalThreads
    private _totalThreads: number;

    // AS3: ThreadsListData.as::_startIndex
    private _startIndex: number;

    // AS3: ThreadsListData.as::_threads
    private _threads: ForumThread[];

    // AS3: ThreadsListData.as::_threadsById (a flash.utils.Dictionary)
    private _threadsById: Map<number, ForumThread>;

    // AS3: ThreadsListData.as::ThreadsListData()
    constructor(totalThreads: number, startIndex: number, threads: ForumThread[])
    {
        this._totalThreads = totalThreads;
        this._startIndex = startIndex;
        this._threads = threads;
        this._threadsById = new Map();

        for(const thread of threads)
        {
            this._threadsById.set(thread.threadId, thread);
        }
    }

    // AS3: ThreadsListData.as::get totalThreads()
    get totalThreads(): number
    {
        return this._totalThreads;
    }

    // AS3: ThreadsListData.as::get startIndex()
    get startIndex(): number
    {
        return this._startIndex;
    }

    // AS3: ThreadsListData.as::get threads()
    get threads(): ForumThread[]
    {
        return this._threads;
    }

    // AS3: ThreadsListData.as::get threadsById()
    get threadsById(): Map<number, ForumThread>
    {
        return this._threadsById;
    }

    // AS3: ThreadsListData.as::get size()
    // How many threads this page holds, against `totalThreads` for the whole forum.
    get size(): number
    {
        return this._threads.length;
    }

    /**
     * AS3: ThreadsListData.as::updateThread()
     *
     * Replaces the record wholesale, in both the index and the array. Returns false when the
     * thread is not on this page — the index is still updated either way, which is AS3's own
     * order and lets a lookup answer for a thread the current page does not show.
     */
    // AS3: ThreadsListData.as::updateThread()
    updateThread(thread: ForumThread): boolean
    {
        this._threadsById.set(thread.threadId, thread);

        for(let i = 0; i < this._threads.length; i++)
        {
            if(this._threads[i].threadId === thread.threadId)
            {
                this._threads[i] = thread;

                return true;
            }
        }

        return false;
    }
}
