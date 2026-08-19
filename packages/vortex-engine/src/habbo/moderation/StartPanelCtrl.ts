/**
 * StartPanelCtrl — the mod tool's launcher: four buttons, three of which stay disabled until there
 * is something to point them at.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/StartPanelCtrl.as
 *
 * Built in `ModerationManager`'s constructor and shown by the moderator init packet, so it exists
 * for the whole session. `show()` builds the window on first call and afterwards only makes it
 * visible again — the buttons keep whatever state they were left in.
 *
 * **Disabled state is painted, not just set**: each button's label is greyed to `0x666666` when
 * disabled and back to black when enabled, because the window system does not restyle a disabled
 * label on its own. The chatlog button additionally needs the chatlog permission from the init
 * packet, so entering a room is not enough to enable it.
 *
 * The ticket-queue button opens no window of its own — it calls `IssueManager.init()`, which shows
 * the issue browser.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {ILabelWindow} from '@core/window/components/ILabelWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {
    GetRoomChatlogMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/GetRoomChatlogMessageComposer';
import type {
    RoomEntryInfoMessageParser
} from '@habbo/communication/messages/parser/room/engine/RoomEntryInfoMessageParser';
import {ChatlogCtrl} from './ChatlogCtrl';
import type {ModerationManager} from './ModerationManager';
import {RoomToolCtrl} from './RoomToolCtrl';
import {UserInfoFrameCtrl} from './UserInfoFrameCtrl';
import {WindowTracker} from './WindowTracker';

export class StartPanelCtrl implements IDisposable
{
    /** `0x666666` — AS3 writes it as the decimal `6710886`. */
    // AS3: StartPanelCtrl.as::show()
    private static readonly LABEL_COLOR_DISABLED: number = 0x666666;

    // AS3: StartPanelCtrl.as::userSelected()
    private static readonly LABEL_COLOR_ENABLED: number = 0;

    /** AS3 asks for a guest room's chatlog with `0`, a public one's with `1`. */
    // AS3: StartPanelCtrl.as::onChatlogButton()
    private static readonly CHATLOG_GUEST_ROOM: number = 0;

    // AS3: StartPanelCtrl.as::onChatlogButton()
    private static readonly CHATLOG_PUBLIC_ROOM: number = 1;

    // AS3: StartPanelCtrl.as::_main
    private _main: ModerationManager | null;

    // AS3: StartPanelCtrl.as::_frame
    private _frame: IFrameWindow | null = null;

    /** Derived name — `_SafeStr_5971`: the user the info button would open. */
    // AS3: StartPanelCtrl.as::_SafeStr_5971
    private _userId: number = 0;

    // AS3: StartPanelCtrl.as::_isGuestRoom
    private _isGuestRoom: boolean = false;

    /** Derived name — `_SafeStr_6722`: the room the tool and chatlog buttons would open. */
    // AS3: StartPanelCtrl.as::_SafeStr_6722
    private _roomId: number = 0;

    // AS3: StartPanelCtrl.as::_disposed
    private _disposed: boolean = false;

    // AS3: StartPanelCtrl.as::StartPanelCtrl()
    constructor(main: ModerationManager)
    {
        this._main = main;
    }

    // AS3: StartPanelCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /** AS3 never sets `_disposed` here, so a second call re-runs the body — kept as written. */
    // AS3: StartPanelCtrl.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._main = null;

        if(this._frame !== null)
        {
            (this._frame as unknown as IWindow).dispose();
            this._frame = null;
        }
    }

    // AS3: StartPanelCtrl.as::userSelected()
    public userSelected(userId: number, userName: string): void
    {
        if(this._frame === null) return;

        this._userId = userId;

        this._frame.findChildByName('userinfo_but')?.enable();

        this.setButtonLabel('userinfo_but', `User info: ${userName}`, StartPanelCtrl.LABEL_COLOR_ENABLED);
    }

    // AS3: StartPanelCtrl.as::guestRoomEntered()
    public guestRoomEntered(data: RoomEntryInfoMessageParser | null): void
    {
        if(this._frame === null || data === null) return;

        this._frame.findChildByName('room_tool_but')?.enable();

        this.setButtonLabel('room_tool_but', null, StartPanelCtrl.LABEL_COLOR_ENABLED);

        this.enableChatlogButton();

        this._isGuestRoom = true;
        this._roomId = data.guestRoomId;
    }

    // AS3: StartPanelCtrl.as::roomExited()
    public roomExited(): void
    {
        if(this._frame === null) return;

        this._frame.findChildByName('room_tool_but')?.disable();
        this._frame.findChildByName('chatlog_but')?.disable();
    }

    // AS3: StartPanelCtrl.as::show()
    public show(): void
    {
        if(this._frame === null)
        {
            this._frame = this._main?.getXmlWindow('start_panel') as unknown as IFrameWindow | null;

            if(this._frame === null) return;

            for(const name of ['room_tool_but', 'chatlog_but', 'ticket_queue_but', 'userinfo_but'])
            {
                const button = this._frame.findChildByName(name);

                if(button === null) continue;

                button.addEventListener('WME_CLICK', this.handlerFor(name));
                button.addEventListener('WME_OVER', this.onMouseOver);
                button.addEventListener('WME_OUT', this.onMouseOut);
            }

            this._frame.findChildByName('userinfo_but')?.disable();
            this._frame.findChildByName('room_tool_but')?.disable();
            this._frame.findChildByName('chatlog_but')?.disable();

            this.setButtonLabel('userinfo_but', null, StartPanelCtrl.LABEL_COLOR_DISABLED);
            this.setButtonLabel('room_tool_but', null, StartPanelCtrl.LABEL_COLOR_DISABLED);
            this.setButtonLabel('chatlog_but', null, StartPanelCtrl.LABEL_COLOR_DISABLED);
        }

        (this._frame as unknown as IWindow).visible = true;
    }

    // TS-only: AS3 wires four differently-named handlers; this maps a button name to its own.
    private handlerFor(name: string): (event: WindowEvent) => void
    {
        switch(name)
        {
            case 'room_tool_but':
                return this.onRoomToolButton;
            case 'chatlog_but':
                return this.onChatlogButton;
            case 'ticket_queue_but':
                return this.onTicketQueueButton;
            default:
                return this.onUserinfoButton;
        }
    }

    /** The label lives inside the button, under `offence_name`. */
    // TS-only: the shape the five label writes in this class share.
    private setButtonLabel(buttonName: string, caption: string | null, color: number): void
    {
        const button = this._frame?.findChildByName(buttonName) as unknown as IWindowContainer | null;
        const label = button?.findChildByName('offence_name') ?? null;

        if(label === null) return;

        (label as unknown as ILabelWindow).textColor = color;

        if(caption !== null) label.caption = caption;
    }

    // AS3: StartPanelCtrl.as::enableChatlogButton()
    private enableChatlogButton(): void
    {
        if(!(this._main?.initMsg?.chatlogsPermission ?? false)) return;

        this._frame?.findChildByName('chatlog_but')?.enable();

        this.setButtonLabel('chatlog_but', null, StartPanelCtrl.LABEL_COLOR_ENABLED);
    }

    /** A disabled button shows no hover highlight. */
    // AS3: StartPanelCtrl.as::onMouseOver()
    private onMouseOver = (event: WindowEvent): void =>
    {
        const window = event.window;

        if(window === null || !window.isEnabled()) return;

        const highlight = (window as unknown as IWindowContainer).findChildByName('mouseover');

        if(highlight !== null) highlight.visible = true;
    };

    // AS3: StartPanelCtrl.as::onMouseOut()
    private onMouseOut = (event: WindowEvent): void =>
    {
        const window = event.window;

        if(window === null) return;

        const highlight = (window as unknown as IWindowContainer).findChildByName('mouseover');

        if(highlight !== null) highlight.visible = false;
    };

    // AS3: StartPanelCtrl.as::onRoomToolButton()
    private onRoomToolButton = (): void =>
    {
        if(this._main === null) return;

        this._main.windowTracker?.show(
            new RoomToolCtrl(this._main, this._roomId), this._frame, false, false, true
        );
    };

    // AS3: StartPanelCtrl.as::onChatlogButton()
    private onChatlogButton = (): void =>
    {
        if(this._main === null) return;

        const roomKind = this._isGuestRoom
            ? StartPanelCtrl.CHATLOG_GUEST_ROOM
            : StartPanelCtrl.CHATLOG_PUBLIC_ROOM;

        this._main.windowTracker?.show(
            new ChatlogCtrl(
                new GetRoomChatlogMessageComposer(roomKind, this._roomId),
                this._main,
                WindowTracker.TYPE_CHATLOG_ROOM,
                this._roomId
            ),
            this._frame,
            false,
            false,
            true
        );
    };

    // AS3: StartPanelCtrl.as::onUserinfoButton()
    private onUserinfoButton = (): void =>
    {
        if(this._main === null) return;

        this._main.windowTracker?.show(
            new UserInfoFrameCtrl(this._main, this._userId), this._frame, false, false, true
        );
    };

    // AS3: StartPanelCtrl.as::onTicketQueueButton()
    private onTicketQueueButton = (): void =>
    {
        this._main?.issueManager?.init();
    };
}
