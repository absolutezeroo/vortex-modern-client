/**
 * UserInfoCtrl — the moderator's card on one user: counts, dates, and the five tools it opens.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/UserInfoCtrl.as
 *
 * **This is not a window — it is a panel painted into someone else's container.** `load()` takes the
 * container it should live in, so the same class serves the standalone card
 * (`UserInfoFrameCtrl`) and the two embedded panels inside an issue handler.
 *
 * It shows a "loading" line until the answer arrives, then swaps in the fields. `prepare()` builds
 * the panel on first call and re-binds the nine buttons on every call, so a refresh cannot leave a
 * dead button behind.
 *
 * Two details that look like styling but are not:
 *
 * - **The last-sanction time is tinted by recency**: within 48 hours it gets a red channel scaled by
 *   how recent it is, so a fresh sanction stands out. Older ones keep the layout's colour.
 * - **"No identity" disables the whole mod-action button** — a user the hotel cannot identify
 *   cannot be sanctioned from here.
 *
 * `trackAction()` reports under a different prefix depending on which of the issue handler's two
 * cards this is, which is the only reason it holds an `IssueHandler` at all.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {
    GetModeratorUserInfoMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/GetModeratorUserInfoMessageComposer';
import {
    GetUserChatlogMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/GetUserChatlogMessageComposer';
import type {
    ModeratorUserInfoData
} from '@habbo/communication/messages/parser/moderation/ModeratorUserInfoData';
import type {IssueInfoData} from '@habbo/communication/messages/parser/moderation/IssueInfoData';
import {ChatlogCtrl} from './ChatlogCtrl';
import type {IssueHandler} from './IssueHandler';
import type {IUserInfoReceiver} from './IUserInfoReceiver';
import {ModActionCtrl} from './ModActionCtrl';
import type {ModerationManager} from './ModerationManager';
import {RoomVisitsCtrl} from './RoomVisitsCtrl';
import {SendMsgsCtrl} from './SendMsgsCtrl';
import {WindowTracker} from './WindowTracker';

const log = Logger.getLogger('habbo.moderation.UserInfoCtrl');

export class UserInfoCtrl implements IDisposable, IUserInfoReceiver
{
    // AS3: UserInfoCtrl.as::secsInMinute
    private static readonly SECS_IN_MINUTE: number = 60;

    // AS3: UserInfoCtrl.as::secsInHour
    private static readonly SECS_IN_HOUR: number = 3600;

    // AS3: UserInfoCtrl.as::secsInDay
    private static readonly SECS_IN_DAY: number = 86400;

    // AS3: UserInfoCtrl.as::secsInYear
    private static readonly SECS_IN_YEAR: number = 31536000;

    /** Sanctions younger than this are tinted; older ones keep the layout's colour. */
    // AS3: UserInfoCtrl.as::refresh()
    private static readonly RECENT_SANCTION_HOURS: number = 48;

    /** AS3's marker for a user the hotel cannot identify. */
    // AS3: UserInfoCtrl.as::refresh()
    private static readonly NO_IDENTITY: string = 'No identity';

    // AS3: UserInfoCtrl.as::_callerFrame
    private _callerFrame: IFrameWindow | null;

    // AS3: UserInfoCtrl.as::_main
    private _main: ModerationManager | null;

    /** Derived name — `_SafeStr_5971`. */
    // AS3: UserInfoCtrl.as::_SafeStr_5971
    private _userId: number = 0;

    /** Derived name — `_SafeStr_7643`. */
    // AS3: UserInfoCtrl.as::_SafeStr_7643
    private _issue: IssueInfoData | null;

    /** Derived name — `_SafeStr_4556`: null until the answer arrives. */
    // AS3: UserInfoCtrl.as::_SafeStr_4556
    private _data: ModeratorUserInfoData | null = null;

    /** Derived name — `_SafeStr_6883`: the container this panel is painted into. */
    // AS3: UserInfoCtrl.as::_SafeStr_6883
    private _container: IWindowContainer | null = null;

    // AS3: UserInfoCtrl.as::_openToolsBelow
    private _openToolsBelow: boolean;

    // AS3: UserInfoCtrl.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_6123`: set only for the issue handler's two embedded cards. */
    // AS3: UserInfoCtrl.as::_SafeStr_6123
    private _issueHandler: IssueHandler | null;

    // AS3: UserInfoCtrl.as::UserInfoCtrl()
    constructor(
        callerFrame: IFrameWindow | null,
        main: ModerationManager,
        issue: IssueInfoData | null,
        issueHandler: IssueHandler | null = null,
        openToolsBelow: boolean = false
    )
    {
        this._callerFrame = callerFrame;
        this._main = main;
        this._issue = issue;
        this._openToolsBelow = openToolsBelow;
        this._issueHandler = issueHandler;
    }

    /** Coarse buckets, each switching at *twice* the next unit — 119 minutes still reads in minutes. */
    // AS3: UserInfoCtrl.as::formatTime()
    public static formatTime(seconds: number): string
    {
        if(seconds < 2 * UserInfoCtrl.SECS_IN_MINUTE) return `${seconds} secs ago`;

        if(seconds < 2 * UserInfoCtrl.SECS_IN_HOUR)
        {
            return `${Math.round(seconds / UserInfoCtrl.SECS_IN_MINUTE)} mins ago`;
        }

        if(seconds < 2 * UserInfoCtrl.SECS_IN_DAY)
        {
            return `${Math.round(seconds / UserInfoCtrl.SECS_IN_HOUR)} hours ago`;
        }

        if(seconds < 2 * UserInfoCtrl.SECS_IN_YEAR)
        {
            return `${Math.round(seconds / UserInfoCtrl.SECS_IN_DAY)} days ago`;
        }

        return `${Math.round(seconds / UserInfoCtrl.SECS_IN_YEAR)} years ago`;
    }

    // AS3: UserInfoCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /** Paints the loading state first, then asks — so the panel is never blank. */
    // AS3: UserInfoCtrl.as::load()
    public load(container: IWindowContainer, userId: number): void
    {
        this._container = container;
        this._userId = userId;
        this._data = null;

        this.refresh();

        this._main?.messageHandler?.addUserInfoListener(this);
        this._main?.connection?.send(new GetModeratorUserInfoMessageComposer(userId));
    }

    // AS3: UserInfoCtrl.as::onUserInfo()
    public onUserInfo(data: ModeratorUserInfoData): void
    {
        if(data.userId !== this._userId) return;

        this._data = data;

        this.refresh();
    }

    // AS3: UserInfoCtrl.as::refresh()
    public refresh(): void
    {
        if(this._container === null || (this._container as unknown as IWindow).disposed) return;

        const panel = this.prepare();

        if(panel === null) return;

        const fields = panel.findChildByName('fields');
        const loading = panel.findChildByName('loading_txt');
        const data = this._data;

        if(data === null)
        {
            if(fields !== null) fields.visible = false;
            if(loading !== null) loading.visible = true;

            return;
        }

        if(fields !== null) fields.visible = true;
        if(loading !== null) loading.visible = false;

        UserInfoCtrl.setTxt(panel, 'name_txt', data.userName);
        UserInfoCtrl.setTxt(
            panel, 'registered_txt', UserInfoCtrl.formatTime(data.registrationAgeInMinutes * 60)
        );
        UserInfoCtrl.setTxt(panel, 'cfh_count_txt', `${data.cfhCount}`);

        UserInfoCtrl.setAlertTxt(panel, 'abusive_cfh_count_txt', data.abusiveCfhCount);
        UserInfoCtrl.setAlertTxt(panel, 'caution_count_txt', data.cautionCount);
        UserInfoCtrl.setAlertTxt(panel, 'ban_count_txt', data.banCount);
        UserInfoCtrl.setAlertTxt(panel, 'trading_lock_count_txt', data.tradingLockCount);

        UserInfoCtrl.setTxt(panel, 'trading_lock_expiry_txt', data.tradingExpiryDate, 'No active lock');
        UserInfoCtrl.setTxt(
            panel, 'last_login_txt', UserInfoCtrl.formatTime(data.minutesSinceLastLogin * 60)
        );
        UserInfoCtrl.setTxt(panel, 'online_txt', data.online ? 'Yes' : 'No');
        UserInfoCtrl.setTxt(panel, 'last_purchase_txt', data.lastPurchaseDate, 'No purchases');
        UserInfoCtrl.setTxt(panel, 'email_address_txt', data.primaryEmailAddress, 'No email found');
        UserInfoCtrl.setTxt(panel, 'id_bans_txt', `${data.identityRelatedBanCount}`);
        UserInfoCtrl.setTxt(panel, 'user_class_txt', data.userClassification, '-');
        UserInfoCtrl.setTxt(panel, 'last_sanction_time_txt', data.lastSanctionTime);

        if(data.sanctionAgeHours <= UserInfoCtrl.RECENT_SANCTION_HOURS)
        {
            const sanctionText = panel.findChildByName('last_sanction_time_txt') as ITextWindow | null;

            // AS3 shifts the scaled value into the red channel: fresher reads brighter.
            if(sanctionText !== null)
            {
                sanctionText.textColor =
                    (255 * (UserInfoCtrl.RECENT_SANCTION_HOURS - data.sanctionAgeHours)
                        / UserInfoCtrl.RECENT_SANCTION_HOURS) << 16;
            }
        }

        if(data.primaryEmailAddress === UserInfoCtrl.NO_IDENTITY)
        {
            panel.findChildByName('modaction_but')?.disable();
        }

        log.debug(`USER: ${data.userName}, ${data.banCount}, ${data.cautionCount}`);
    }

    // AS3: UserInfoCtrl.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._main?.messageHandler?.removeUserInfoListener(this);

        this._callerFrame = null;
        this._main = null;
        this._data = null;
        this._container = null;
    }

    /** Built once into the container; the nine handlers are re-bound on every refresh. */
    // AS3: UserInfoCtrl.as::prepare()
    private prepare(): IWindowContainer | null
    {
        let panel = (this._container?.findChildByName('user_info') ?? null) as unknown as IWindowContainer | null;

        if(panel === null)
        {
            panel = this._main?.getXmlWindow('user_info') as unknown as IWindowContainer | null;

            if(panel === null) return null;

            this._container?.addChild(panel as unknown as IWindow);
        }

        UserInfoCtrl.bind(panel, 'chatlog_but', this.onChatlogButton);
        UserInfoCtrl.bind(panel, 'roomvisits_but', this.onRoomVisitsButton);
        UserInfoCtrl.bind(panel, 'habboinfotool_but', this.onHabboInfoToolButton);
        UserInfoCtrl.bind(panel, 'message_but', this.onMessageButton);
        UserInfoCtrl.bind(panel, 'modaction_but', this.onModActionButton);
        UserInfoCtrl.bind(panel, 'view_caution_count_txt', this.onViewCautions);
        UserInfoCtrl.bind(panel, 'view_ban_count_txt', this.onViewBans);
        UserInfoCtrl.bind(panel, 'view_trading_lock_count_txt', this.onViewTradingLocks);
        UserInfoCtrl.bind(panel, 'view_id_bans_txt', this.onViewIDBans);

        return panel;
    }

    // TS-only: the null-guarded form of AS3's `panel.findChildByName(name).procedure = handler`.
    private static bind(panel: IWindowContainer, name: string, handler: (event: WindowEvent) => void): void
    {
        const child = panel.findChildByName(name);

        if(child !== null) child.procedure = handler;
    }

    /** The paired `view_*` link only appears when the count is non-zero. */
    // AS3: UserInfoCtrl.as::setAlertTxt()
    private static setAlertTxt(panel: IWindowContainer, name: string, count: number): void
    {
        const view = panel.findChildByName(`view_${name}`);

        if(view !== null) view.visible = count > 0;

        const target = panel.findChildByName(name);

        if(target !== null) target.caption = `${count}`;
    }

    /** An empty value falls back to `fallback`, which is `''` unless the caller says otherwise. */
    // AS3: UserInfoCtrl.as::setTxt()
    private static setTxt(panel: IWindowContainer, name: string, value: string, fallback: string = ''): void
    {
        const target = panel.findChildByName(name);

        if(target === null) return;

        target.caption = (!value || value.length === 0) ? fallback : value;
    }

    // AS3: UserInfoCtrl.as::onChatlogButton()
    private onChatlogButton = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null || this._main === null) return;

        this.trackAction('chatLog');

        this._main.windowTracker?.show(
            new ChatlogCtrl(
                new GetUserChatlogMessageComposer(this._data.userId),
                this._main,
                WindowTracker.TYPE_CHATLOG_USER,
                this._data.userId
            ),
            this._callerFrame,
            this._openToolsBelow,
            false,
            true
        );
    };

    // AS3: UserInfoCtrl.as::onRoomVisitsButton()
    private onRoomVisitsButton = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null || this._main === null) return;

        this._main.windowTracker?.show(
            new RoomVisitsCtrl(this._main, this._data.userId),
            this._callerFrame,
            this._openToolsBelow,
            false,
            true
        );
    };

    // AS3: UserInfoCtrl.as::onHabboInfoToolButton()
    private onHabboInfoToolButton = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null) return;

        this.trackAction('openInfoTool');

        this._main?.openHkPage('habboinfotool.url', this._data.userName);
    };

    // AS3: UserInfoCtrl.as::onMessageButton()
    private onMessageButton = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null || this._main === null) return;

        this.trackAction('openSendMessage');

        this._main.windowTracker?.show(
            new SendMsgsCtrl(this._main, this._data.userId, this._data.userName, this._issue),
            this._callerFrame,
            this._openToolsBelow,
            false,
            true
        );
    };

    // AS3: UserInfoCtrl.as::onModActionButton()
    private onModActionButton = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null || this._main === null) return;

        this.trackAction('openModAction');

        this._main.windowTracker?.show(
            new ModActionCtrl(this._main, this._data.userId, this._data.userName, this._issue, this),
            this._callerFrame,
            this._openToolsBelow,
            false,
            true
        );
    };

    // AS3: UserInfoCtrl.as::onViewCautions()
    private onViewCautions = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.trackAction('viewCautions');
        this.showModeratorLog();
    };

    // AS3: UserInfoCtrl.as::onViewBans()
    private onViewBans = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.trackAction('viewBans');
        this.showModeratorLog();
    };

    // AS3: UserInfoCtrl.as::onViewTradingLocks()
    private onViewTradingLocks = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.trackAction('viewTradingLocks');
        this.showModeratorLog();
    };

    // AS3: UserInfoCtrl.as::onViewIDBans()
    private onViewIDBans = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.trackAction('viewIdentityInfo');
        this.showIdentityInformation();
    };

    // AS3: UserInfoCtrl.as::showModeratorLog()
    private showModeratorLog(): void
    {
        this._main?.openHkPage('moderatoractionlog.url', this._data?.userName ?? '');
    }

    // AS3: UserInfoCtrl.as::showIdentityInformation()
    private showIdentityInformation(): void
    {
        this._main?.openHkPage('identityinformationtool.url', `${this._data?.identityId ?? 0}`);
    }

    // AS3: UserInfoCtrl.as::logEvent()
    public logEvent(action: string, label: string): void
    {
        this._main?.logEvent(action, label);
    }

    /**
     * Standalone cards go straight to Google Analytics; the issue handler's two embedded cards are
     * reported through it, under a prefix naming which of the two they are.
     */
    // AS3: UserInfoCtrl.as::trackAction()
    public trackAction(action: string): void
    {
        const handler = this._issueHandler;

        if(handler === null || handler.disposed)
        {
            this._main?.trackGoogle(`userInfo_${action}`);

            return;
        }

        if(this === handler.callerUserInfo)
        {
            handler.trackAction(`callerUserInfo_${action}`);
        }
        else if(this === handler.reportedUserInfo)
        {
            handler.trackAction(`reportedUserInfo_${action}`);
        }
        else
        {
            handler.trackAction(`userInfo_${action}`);
        }
    }
}
