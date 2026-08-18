/**
 * OpenDiscussionMessage — wires one button so that clicking it opens one post in a forum thread.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/OpenDiscussionMessage.as
 */
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ModerationManager} from '../ModerationManager';

export class OpenDiscussionMessage
{
    // AS3: OpenDiscussionMessage.as::_main
    private _main: ModerationManager;

    // AS3: OpenDiscussionMessage.as::_groupId
    private _groupId: number;

    /** Derived name — `_SafeStr_4866`. */
    // AS3: OpenDiscussionMessage.as::_SafeStr_4866
    private _threadId: number;

    /** Derived name — `_SafeStr_7944`. */
    // AS3: OpenDiscussionMessage.as::_SafeStr_7944
    private _messageId: number;

    // AS3: OpenDiscussionMessage.as::OpenDiscussionMessage()
    constructor(
        main: ModerationManager, button: IWindow, groupId: number, threadId: number, messageId: number
    )
    {
        this._main = main;
        this._groupId = groupId;
        this._threadId = threadId;
        this._messageId = messageId;

        button.procedure = this.onClick;
    }

    // AS3: OpenDiscussionMessage.as::onClick()
    private onClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._main.openThreadMessage(this._groupId, this._threadId, this._messageId);
    };
}
