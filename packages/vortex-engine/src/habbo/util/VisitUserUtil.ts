/**
 * VisitUserUtil — wires one window so that clicking it walks the moderator to a user.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/util/VisitUserUtil.as
 *
 * Same shape as the mod tool's own action classes: it takes a window, assigns `procedure`, and is
 * never referenced again. It lives under `habbo/util` in AS3 rather than with them, and
 * `UserClassificationCtrl` is its only caller.
 *
 * The message it sends is the ordinary follow-a-friend request (`_SafeCls_3196`, composer id 886) —
 * not the name-based `VisitUserMessageComposer`, which is a different message.
 */
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {
    FollowFriendMessageComposer
} from '@habbo/communication/messages/outgoing/friendlist/FollowFriendMessageComposer';
import type {ModerationManager} from '@habbo/moderation/ModerationManager';

export class VisitUserUtil
{
    // AS3: VisitUserUtil.as::_main
    private _main: ModerationManager;

    /** Derived name — `_SafeStr_5971`. */
    // AS3: VisitUserUtil.as::_SafeStr_5971
    private _userId: number;

    // AS3: VisitUserUtil.as::VisitUserUtil()
    constructor(main: ModerationManager, button: IWindow, userId: number)
    {
        this._main = main;
        this._userId = userId;

        button.procedure = this.onClick;
    }

    // AS3: VisitUserUtil.as::onClick()
    private onClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._main.connection?.send(new FollowFriendMessageComposer(this._userId));
    };
}
