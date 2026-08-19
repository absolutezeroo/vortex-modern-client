/**
 * OpenUserInfo — wires one button so that clicking it opens a user's moderator card.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/OpenUserInfo.as
 *
 * The eight classes in this directory are the mod tool's whole click vocabulary. Each takes a
 * window in its constructor, assigns `procedure` on it, and lives only as long as that window does
 * — nothing keeps a reference to them, which is why none of them is disposable.
 *
 * `procedure` fires for every event the window sees, not just clicks, so each one re-checks the
 * type. That guard is AS3's, not a port addition.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ModerationManager} from '../ModerationManager';
import {UserInfoFrameCtrl} from '../UserInfoFrameCtrl';

export class OpenUserInfo
{
    // AS3: OpenUserInfo.as::_frame
    private _frame: IFrameWindow | null;

    // AS3: OpenUserInfo.as::_main
    private _main: ModerationManager;

    /** Derived name — `_SafeStr_5971`: the user whose card opens. */
    // AS3: OpenUserInfo.as::_SafeStr_5971
    private _userId: number;

    // AS3: OpenUserInfo.as::OpenUserInfo()
    constructor(frame: IFrameWindow | null, main: ModerationManager, button: IWindow, userId: number)
    {
        this._frame = frame;
        this._main = main;
        this._userId = userId;

        button.procedure = this.onClick;
    }

    // AS3: OpenUserInfo.as::onClick()
    private onClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._main.windowTracker?.show(
            new UserInfoFrameCtrl(this._main, this._userId), this._frame, false, false, true
        );
    };
}
