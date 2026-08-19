/**
 * HideDiscussionThread — wires one button so that clicking it hides a forum thread and closes the
 * chatlog popup it was clicked from.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/HideDiscussionThread.as
 *
 * AS3 sends the literal `20`; that is `ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD`, the same
 * value `GroupForumController.deleteThread()` uses for a staff member. The mod tool never offers
 * the weaker admin state — a thread hidden from here is hidden permanently.
 *
 * The popup is disposed *before* the send, so the moderator cannot fire twice at a thread whose
 * window has already gone.
 */
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {
    ModerateThreadMessageComposer
} from '@habbo/communication/messages/outgoing/groupforums/ModerateThreadMessageComposer';
import {ForumModerationState} from '@habbo/friendbar/groupforums/ForumModerationState';
import type {ChatlogCtrl} from '../ChatlogCtrl';
import type {ModerationManager} from '../ModerationManager';

export class HideDiscussionThread
{
    // AS3: HideDiscussionThread.as::_main
    private _main: ModerationManager;

    // AS3: HideDiscussionThread.as::_popup
    private _popup: ChatlogCtrl;

    // AS3: HideDiscussionThread.as::_groupId
    private _groupId: number;

    /** Derived name — `_SafeStr_4866`. */
    // AS3: HideDiscussionThread.as::_SafeStr_4866
    private _threadId: number;

    // AS3: HideDiscussionThread.as::HideDiscussionThread()
    constructor(
        main: ModerationManager, popup: ChatlogCtrl, button: IWindow, groupId: number, threadId: number
    )
    {
        this._main = main;
        this._popup = popup;
        this._groupId = groupId;
        this._threadId = threadId;

        button.procedure = this.onClick;
    }

    // AS3: HideDiscussionThread.as::onClick()
    private onClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._popup.dispose();

        this._main.connection?.send(new ModerateThreadMessageComposer(
            this._groupId, this._threadId, ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD
        ));
    };
}
