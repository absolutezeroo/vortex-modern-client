/**
 * HideDiscussionMessage — wires one button so that clicking it hides a single forum post and closes
 * the chatlog popup it was clicked from.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/HideDiscussionMessage.as
 *
 * Same shape and the same permanent state as `HideDiscussionThread`, one level down.
 */
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {
    ModerateMessageMessageComposer
} from '@habbo/communication/messages/outgoing/groupforums/ModerateMessageMessageComposer';
import {ForumModerationState} from '@habbo/friendbar/groupforums/ForumModerationState';
import type {ChatlogCtrl} from '../ChatlogCtrl';
import type {ModerationManager} from '../ModerationManager';

export class HideDiscussionMessage
{
    // AS3: HideDiscussionMessage.as::_main
    private _main: ModerationManager;

    // AS3: HideDiscussionMessage.as::_popup
    private _popup: ChatlogCtrl;

    // AS3: HideDiscussionMessage.as::_groupId
    private _groupId: number;

    /** Derived name — `_SafeStr_4866`. */
    // AS3: HideDiscussionMessage.as::_SafeStr_4866
    private _threadId: number;

    /** Derived name — `_SafeStr_7944`. */
    // AS3: HideDiscussionMessage.as::_SafeStr_7944
    private _messageId: number;

    // AS3: HideDiscussionMessage.as::HideDiscussionMessage()
    constructor(
        main: ModerationManager,
        popup: ChatlogCtrl,
        button: IWindow,
        groupId: number,
        threadId: number,
        messageId: number
    )
    {
        this._main = main;
        this._popup = popup;
        this._groupId = groupId;
        this._threadId = threadId;
        this._messageId = messageId;

        button.procedure = this.onClick;
    }

    // AS3: HideDiscussionMessage.as::onClick()
    private onClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._popup.dispose();

        this._main.connection?.send(new ModerateMessageMessageComposer(
            this._groupId, this._threadId, this._messageId, ForumModerationState.PERMANENTLY_HIDDEN_BY_MOD
        ));
    };
}
