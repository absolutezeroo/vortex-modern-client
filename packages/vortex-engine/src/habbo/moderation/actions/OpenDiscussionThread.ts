/**
 * OpenDiscussionThread — wires one button so that clicking it opens a group-forum thread.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/OpenDiscussionThread.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ModerationManager} from '../ModerationManager';

export class OpenDiscussionThread
{
    // AS3: OpenDiscussionThread.as::_main
    private _main: ModerationManager;

    // AS3: OpenDiscussionThread.as::_groupId
    private _groupId: number;

    /** Derived name — `_SafeStr_4866`. */
    // AS3: OpenDiscussionThread.as::_SafeStr_4866
    private _threadId: number;

    // AS3: OpenDiscussionThread.as::OpenDiscussionThread()
    constructor(main: ModerationManager, button: IWindow, groupId: number, threadId: number)
    {
        this._main = main;
        this._groupId = groupId;
        this._threadId = threadId;

        button.procedure = this.onClick;
    }

    // AS3: OpenDiscussionThread.as::onClick()
    private onClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._main.openThread(this._groupId, this._threadId);
    };
}
