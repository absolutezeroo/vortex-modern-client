/**
 * UserInfoFrameCtrl — the standalone window around a `UserInfoCtrl` panel.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/UserInfoFrameCtrl.as
 *
 * `UserInfoCtrl` is a panel, not a window; this is the frame that hosts one on its own. The issue
 * handler embeds the same panel directly instead, which is why the two are separate classes.
 *
 * It passes `openToolsBelow = true`, so the five tools this card opens stack under it rather than
 * to its right.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IssueInfoData} from '@habbo/communication/messages/parser/moderation/IssueInfoData';
import type {ITrackedWindow} from './ITrackedWindow';
import type {ModerationManager} from './ModerationManager';
import {UserInfoCtrl} from './UserInfoCtrl';
import {WindowTracker} from './WindowTracker';

export class UserInfoFrameCtrl implements IDisposable, ITrackedWindow
{
    // AS3: UserInfoFrameCtrl.as::_main
    private _main: ModerationManager | null;

    /** Derived name — `_SafeStr_5971`. */
    // AS3: UserInfoFrameCtrl.as::_SafeStr_5971
    private _userId: number;

    // AS3: UserInfoFrameCtrl.as::_frame
    private _frame: IFrameWindow | null = null;

    // AS3: UserInfoFrameCtrl.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_6616`. */
    // AS3: UserInfoFrameCtrl.as::_SafeStr_6616
    private _userInfo: UserInfoCtrl | null = null;

    /** Derived name — `_SafeStr_7643`. */
    // AS3: UserInfoFrameCtrl.as::_SafeStr_7643
    private _issue: IssueInfoData | null;

    // AS3: UserInfoFrameCtrl.as::UserInfoFrameCtrl()
    constructor(main: ModerationManager, userId: number, issue: IssueInfoData | null = null)
    {
        this._main = main;
        this._userId = userId;
        this._issue = issue;
    }

    // AS3: UserInfoFrameCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: UserInfoFrameCtrl.as::show()
    public show(): void
    {
        this._frame = this._main?.getXmlWindow('user_info_frame') as unknown as IFrameWindow | null;

        if(this._frame === null || this._main === null) return;

        const frame = this._frame as unknown as IWindow;

        frame.caption = 'User Info';

        const closeButton = this._frame.findChildByTag('close');

        if(closeButton !== null) closeButton.procedure = this.onClose;

        this._userInfo = new UserInfoCtrl(this._frame, this._main, this._issue, null, true);
        this._userInfo.load(this._frame.content, this._userId);

        frame.visible = true;
    }

    // AS3: UserInfoFrameCtrl.as::getType()
    public getType(): number
    {
        return WindowTracker.TYPE_USERINFO;
    }

    // AS3: UserInfoFrameCtrl.as::getId()
    public getId(): string
    {
        return `${this._userId}`;
    }

    // AS3: UserInfoFrameCtrl.as::getFrame()
    public getFrame(): IFrameWindow | null
    {
        return this._frame;
    }

    // AS3: UserInfoFrameCtrl.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.dispose();
    };

    // AS3: UserInfoFrameCtrl.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._frame !== null)
        {
            (this._frame as unknown as IWindow).destroy();
            this._frame = null;
        }

        if(this._userInfo !== null)
        {
            this._userInfo.dispose();
            this._userInfo = null;
        }

        this._issue = null;
        this._main = null;
    }
}
