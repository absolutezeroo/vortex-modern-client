/**
 * RoomToolCtrl — the moderator's card on one room: who owns it, who is in it, and what can be done
 * to it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/RoomToolCtrl.as
 *
 * **The window is built hidden and only shown once the room info arrives.** `show()` sends the
 * request and steals the `room_data` block out of the layout to use as a prototype; `onRoomInfo()`
 * paints it and swaps the listener over to room *enter* events, so the two send buttons can be
 * re-gated whenever the moderator walks in or out of the room.
 *
 * **Both send buttons need the moderator to be standing in the room** — `setSendButtonState()`
 * compares the card's room against `currentFlatId` — and the room-alert permission on top.
 *
 * The room block lays itself out by hand: each field is measured, hidden fields are skipped, the
 * children are stacked with `moveChildrenToColumn()`, and the container is resized to the lowest
 * visible edge. A room with no tags has the whole tag row removed rather than emptied.
 *
 * `act()` sends up to two messages: the caution/message itself, and a separate room-moderation
 * message when any of the three checkboxes is ticked.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IDropMenuWindow} from '@core/window/components/IDropMenuWindow';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import {
    GetModeratorRoomInfoMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/GetModeratorRoomInfoMessageComposer';
import {
    GetRoomChatlogMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/GetRoomChatlogMessageComposer';
import {
    ModerateRoomMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/ModerateRoomMessageComposer';
import {
    ModeratorActionMessageComposer
} from '@habbo/communication/messages/outgoing/moderation/ModeratorActionMessageComposer';
import type {
    ModeratorRoomInfoData
} from '@habbo/communication/messages/parser/moderation/ModeratorRoomInfoData';
import type {RoomDataData} from '@habbo/communication/messages/parser/moderation/RoomDataData';
import {ChatlogCtrl} from './ChatlogCtrl';
import type {ITrackedWindow} from './ITrackedWindow';
import type {ModerationManager} from './ModerationManager';
import {UserInfoFrameCtrl} from './UserInfoFrameCtrl';
import {WindowTracker} from './WindowTracker';

const log = Logger.getLogger('habbo.moderation.RoomToolCtrl');

export class RoomToolCtrl implements IDisposable, ITrackedWindow
{
    /** The four `ModeratorActionMessageComposer` action ids, by (caution?, kick?). */
    // AS3: RoomToolCtrl.as::determineAction()
    private static readonly ACTION_CAUTION: number = 0;
    // AS3: RoomToolCtrl.as::determineAction()
    private static readonly ACTION_CAUTION_AND_KICK: number = 1;
    // AS3: RoomToolCtrl.as::determineAction()
    private static readonly ACTION_MESSAGE: number = 3;
    // AS3: RoomToolCtrl.as::determineAction()
    private static readonly ACTION_MESSAGE_AND_KICK: number = 4;

    /** AS3 asks for a guest room's chatlog with a leading `0`. */
    // AS3: RoomToolCtrl.as::onChatlog()
    private static readonly CHATLOG_GUEST_ROOM: number = 0;

    // AS3: RoomToolCtrl.as::_main
    private _main: ModerationManager | null;

    // AS3: RoomToolCtrl.as::_flatId
    private _flatId: number;

    /** Derived name — `_SafeStr_4556`. */
    // AS3: RoomToolCtrl.as::_SafeStr_4556
    private _data: ModeratorRoomInfoData | null = null;

    // AS3: RoomToolCtrl.as::_frame
    private _frame: IFrameWindow | null = null;

    /** Derived name — `_SafeStr_4652`. */
    // AS3: RoomToolCtrl.as::_SafeStr_4652
    private _list: IItemListWindow | null = null;

    // AS3: RoomToolCtrl.as::_disposed
    private _disposed: boolean = false;

    // AS3: RoomToolCtrl.as::_msgSelect
    private _msgSelect: IDropMenuWindow | null = null;

    /** Derived name — `_SafeStr_5389`. */
    // AS3: RoomToolCtrl.as::_SafeStr_5389
    private _messageInput: ITextFieldWindow | null = null;

    /** True while the field still holds the layout's placeholder — see `onInputClick()`. */
    // AS3: RoomToolCtrl.as::_includeInfo
    private _includeInfo: boolean = true;

    /** Derived name — `_SafeStr_6237`. */
    // AS3: RoomToolCtrl.as::_SafeStr_6237
    private _kickCheck: ISelectableWindow | null = null;

    /** Derived name — `_SafeStr_7413`. */
    // AS3: RoomToolCtrl.as::_SafeStr_7413
    private _lockCheck: ISelectableWindow | null = null;

    /** Derived name — `_SafeStr_7200`. */
    // AS3: RoomToolCtrl.as::_SafeStr_7200
    private _changeNameCheck: ISelectableWindow | null = null;

    /** Derived name — `_SafeStr_8689`: the `room_data` block, torn out of the layout as a prototype. */
    // AS3: RoomToolCtrl.as::_SafeStr_8689
    private _roomDataTemplate: IWindowContainer | null = null;

    // AS3: RoomToolCtrl.as::RoomToolCtrl()
    constructor(main: ModerationManager, flatId: number)
    {
        this._main = main;
        this._flatId = flatId;
    }

    /** The lowest visible edge among a container's children — hidden ones do not count. */
    // AS3: RoomToolCtrl.as::getLowestPoint()
    public static getLowestPoint(container: IWindowContainer): number
    {
        let lowest = 0;

        for(let index = 0; index < container.numChildren; index++)
        {
            const child = container.getChildAt(index);

            if(child !== null && child.visible) lowest = Math.max(lowest, child.y + child.height);
        }

        return lowest;
    }

    /** Stacks visible, non-empty children downward from `top`, `spacing` apart. */
    // AS3: RoomToolCtrl.as::moveChildrenToColumn()
    public static moveChildrenToColumn(container: IWindowContainer, top: number, spacing: number): void
    {
        let y = top;

        for(let index = 0; index < container.numChildren; index++)
        {
            const child = container.getChildAt(index);

            if(child === null || !child.visible || child.height <= 0) continue;

            child.y = y;
            y += child.height + spacing;
        }
    }

    // AS3: RoomToolCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RoomToolCtrl.as::show()
    public show(): void
    {
        this._frame = this._main?.getXmlWindow('roomtool_frame') as unknown as IFrameWindow | null;

        if(this._frame === null || this._main === null) return;

        const list = this._frame.findChildByName('list_cont') as unknown as IItemListWindow | null;
        const roomContainer = list?.getListItemByName('room_cont') as unknown as IWindowContainer | null;

        if(roomContainer !== null)
        {
            this._roomDataTemplate = roomContainer.findChildByName('room_data') as unknown as IWindowContainer | null;

            if(this._roomDataTemplate !== null)
            {
                roomContainer.removeChild(this._roomDataTemplate as unknown as IWindow);
            }
        }

        this._main.messageHandler?.addRoomInfoListener(this);
        this._main.connection?.send(new GetModeratorRoomInfoMessageComposer(this._flatId));

        log.debug(`BEGINNING TO SHOW: ${this._flatId}`);
    }

    // AS3: RoomToolCtrl.as::getType()
    public getType(): number
    {
        return WindowTracker.TYPE_ROOMINFO;
    }

    // AS3: RoomToolCtrl.as::getId()
    public getId(): string
    {
        return `${this._flatId}`;
    }

    // AS3: RoomToolCtrl.as::getFrame()
    public getFrame(): IFrameWindow | null
    {
        return this._frame;
    }

    /** Re-gates the two send buttons; the room-enter listener is what calls it. */
    // AS3: RoomToolCtrl.as::onRoomChange()
    public onRoomChange(): void
    {
        this.setSendButtonState('send_caution_but');
        this.setSendButtonState('send_message_but');
    }

    // AS3: RoomToolCtrl.as::setSendButtonState()
    private setSendButtonState(name: string): void
    {
        const inThisRoom = this._data !== null && this._data.flatId === (this._main?.currentFlatId ?? 0);
        const button = this._frame?.findChildByName(name) ?? null;

        if(button === null) return;

        if(inThisRoom && (this._main?.initMsg?.roomAlertPermission ?? false))
        {
            button.enable();
        }
        else
        {
            button.disable();
        }
    }

    /** Swaps room-info for room-enter: this card is built once but re-gated on every move. */
    // AS3: RoomToolCtrl.as::onRoomInfo()
    public onRoomInfo(data: ModeratorRoomInfoData): void
    {
        if(this._disposed) return;

        log.debug(`GOT ROOM INFO: ${data.flatId}, ${this._flatId}`);

        if(data.flatId !== this._flatId)
        {
            log.debug(`NOT THE SAME FLAT: ${data.flatId}, ${this._flatId}`);

            return;
        }

        this._data = data;

        this.populate();

        this._main?.messageHandler?.removeRoomInfoListener(this);

        if(this._frame !== null) (this._frame as unknown as IWindow).visible = true;

        this._main?.messageHandler?.addRoomEnterListener(this);
    }

    // AS3: RoomToolCtrl.as::populate()
    public populate(): void
    {
        const frame = this._frame;
        const data = this._data;

        if(frame === null || data === null) return;

        this._list = frame.findChildByName('list_cont') as unknown as IItemListWindow | null;

        const closeButton = frame.findChildByTag('close');

        if(closeButton !== null) closeButton.procedure = this.onClose;

        this._messageInput = frame.findChildByName('message_input') as ITextFieldWindow | null;

        if(this._messageInput !== null)
        {
            (this._messageInput as unknown as IWindow).procedure = this.onInputClick;
        }

        this._msgSelect = frame.findChildByName('msgTemplatesSelect') as unknown as IDropMenuWindow | null;

        if(this._msgSelect !== null)
        {
            this.prepareMsgSelect(this._msgSelect);

            (this._msgSelect as unknown as IWindow).procedure = this.onSelectTemplate;
        }

        this._kickCheck = frame.findChildByName('kick_check') as unknown as ISelectableWindow | null;
        this._lockCheck = frame.findChildByName('lock_check') as unknown as ISelectableWindow | null;
        this._changeNameCheck = frame.findChildByName('changename_check') as unknown as ISelectableWindow | null;

        this.refreshRoomData(data.room, 'room_cont');

        this.setTxt('owner_name_txt', data.ownerName);
        this.setTxt('owner_in_room_txt', data.ownerInRoom ? 'Yes' : 'No');
        this.setTxt('user_count_txt', `${data.userCount}`);

        this.bind('enter_room_but', this.onEnterRoom);
        this.bind('chatlog_but', this.onChatlog);
        this.bind('edit_in_hk_but', this.onEditInHk);
        this.bind('send_caution_but', this.onSendCaution);
        this.bind('send_message_but', this.onSendMessage);

        if(!(this._main?.initMsg?.roomKickPermission ?? false))
        {
            (this._kickCheck as unknown as IWindow | null)?.disable();
        }

        this.bind('owner_name_txt', this.onOwnerName);

        this.onRoomChange();
    }

    // TS-only: the null-guarded form of AS3's `_frame.findChildByName(name).procedure = handler`.
    private bind(name: string, handler: (event: WindowEvent) => void): void
    {
        const child = this._frame?.findChildByName(name) ?? null;

        if(child !== null) child.procedure = handler;
    }

    // AS3: RoomToolCtrl.as::disposeItemFromList()
    private disposeItemFromList(list: IItemListWindow, item: IWindow | null): void
    {
        if(item === null) return;

        list.removeListItem(item)?.dispose();
    }

    /**
     * A room the server says does not exist takes its whole block *and* the spacer below it out of
     * the list, rather than showing an empty card.
     */
    // AS3: RoomToolCtrl.as::refreshRoomData()
    private refreshRoomData(room: RoomDataData, containerName: string): void
    {
        const list = this._list;

        if(list === null) return;

        const container = list.getListItemByName(containerName) as unknown as IWindowContainer | null;

        if(container === null) return;

        let block = container.findChildByName('room_data') as unknown as IWindowContainer | null;

        if(block === null && this._roomDataTemplate !== null)
        {
            const clone = (this._roomDataTemplate as unknown as IWindow).clone();

            block = (clone !== null ? container.addChild(clone) : null) as unknown as IWindowContainer | null;
        }

        if(!room.exists)
        {
            this.disposeItemFromList(list, container as unknown as IWindow);
            this.disposeItemFromList(list, list.getListItemByName('event_spacing'));

            return;
        }

        if(block === null) return;

        const name = block.findChildByName('name') as ITextWindow | null;

        if(name !== null)
        {
            (name as unknown as IWindow).caption = room.name;
            (name as unknown as IWindow).height = name.textHeight + 5;
        }

        const desc = block.findChildByName('desc') as ITextWindow | null;

        if(desc !== null)
        {
            (desc as unknown as IWindow).caption = room.desc;
            (desc as unknown as IWindow).height = desc.textHeight + 5;
        }

        const tagsContainer = block.findChildByName('tags_cont') as unknown as IWindowContainer | null;
        const tagsText = tagsContainer?.findChildByName('tags_txt') as ITextWindow | null;

        if(tagsText !== null)
        {
            const tagsWindow = tagsText as unknown as IWindow;

            tagsWindow.caption = RoomToolCtrl.getTagsAsString(room.tags);
            tagsWindow.height = tagsText.textHeight + 5;

            if(tagsContainer !== null) (tagsContainer as unknown as IWindow).height = tagsWindow.height;
        }

        if(room.tags.length < 1 && tagsContainer !== null)
        {
            block.removeChild(tagsContainer as unknown as IWindow);
        }

        RoomToolCtrl.moveChildrenToColumn(block, (name as unknown as IWindow | null)?.y ?? 0, 0);

        const blockWindow = block as unknown as IWindow;
        const containerWindow = container as unknown as IWindow;

        blockWindow.height = RoomToolCtrl.getLowestPoint(block);
        containerWindow.height = blockWindow.height + 2 * blockWindow.y;
    }

    // AS3: RoomToolCtrl.as::getTagsAsString()
    private static getTagsAsString(tags: string[]): string
    {
        let result = '';

        for(const tag of tags)
        {
            result = result === '' ? tag : `${result}, ${tag}`;
        }

        return result;
    }

    // AS3: RoomToolCtrl.as::setTxt()
    private setTxt(name: string, value: string): void
    {
        const target = this._frame?.findChildByName(name) as ITextWindow | null;

        if(target !== null) target.text = value;
    }

    // AS3: RoomToolCtrl.as::onOwnerName()
    private onOwnerName = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._main === null || this._data === null) return;

        this._main.windowTracker?.show(
            new UserInfoFrameCtrl(this._main, this._data.ownerId), this._frame, false, false, true
        );
    };

    // AS3: RoomToolCtrl.as::onEnterRoom()
    private onEnterRoom = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null) return;

        log.debug('Enter room clicked');

        this._main?.goToRoom(this._data.flatId);
    };

    // AS3: RoomToolCtrl.as::onChatlog()
    private onChatlog = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._main === null || this._data === null) return;

        this._main.windowTracker?.show(
            new ChatlogCtrl(
                new GetRoomChatlogMessageComposer(RoomToolCtrl.CHATLOG_GUEST_ROOM, this._data.flatId),
                this._main,
                WindowTracker.TYPE_CHATLOG_ROOM,
                this._data.flatId
            ),
            this._frame,
            false,
            false,
            true
        );
    };

    // AS3: RoomToolCtrl.as::onEditInHk()
    private onEditInHk = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK' || this._data === null) return;

        log.debug('Edit in hk clicked');

        this._main?.openHkPage('roomadmin.url', `${this._data.flatId}`);
    };

    // AS3: RoomToolCtrl.as::onSendCaution()
    private onSendCaution = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        log.debug('Sending caution...');

        this.act(true);
    };

    // AS3: RoomToolCtrl.as::onSendMessage()
    private onSendMessage = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        log.debug('Sending message...');

        this.act(false);
    };

    /**
     * The guard refuses while `_includeInfo` is still set — i.e. the field has not been focused or
     * filled from a template — exactly as `SendMsgsCtrl` does with its own placeholder flag.
     */
    // AS3: RoomToolCtrl.as::act()
    private act(caution: boolean): void
    {
        const message = this._messageInput?.text ?? '';

        if(this._includeInfo || message === '')
        {
            this._main?.windowManager?.alert(
                'Alert', 'You must input a message to the user', 0, RoomToolCtrl.onAlertClose
            );

            return;
        }

        const kick = this._kickCheck?.isSelected ?? false;
        const lock = this._lockCheck?.isSelected ?? false;
        const changeName = this._changeNameCheck?.isSelected ?? false;

        this._main?.connection?.send(new ModeratorActionMessageComposer(
            RoomToolCtrl.determineAction(caution, kick), message, ''
        ));

        if(lock || changeName || kick)
        {
            this._main?.connection?.send(new ModerateRoomMessageComposer(
                this._data?.flatId ?? 0, lock, changeName, kick
            ));
        }

        this.dispose();
    }

    // AS3: RoomToolCtrl.as::determineAction()
    private static determineAction(caution: boolean, kick: boolean): number
    {
        if(kick) return caution ? RoomToolCtrl.ACTION_CAUTION_AND_KICK : RoomToolCtrl.ACTION_MESSAGE_AND_KICK;

        return caution ? RoomToolCtrl.ACTION_CAUTION : RoomToolCtrl.ACTION_MESSAGE;
    }

    // AS3: RoomToolCtrl.as::onInputClick()
    private onInputClick = (event: WindowEvent): void =>
    {
        if(event.type !== 'WE_FOCUSED' || !this._includeInfo) return;

        if(this._messageInput !== null) this._messageInput.text = '';

        this._includeInfo = false;
    };

    // AS3: RoomToolCtrl.as::onAlertClose()
    private static onAlertClose = (dialog: IDisposable): void =>
    {
        dialog.dispose();
    };

    /** These templates are the *room* ones, not the per-user list `SendMsgsCtrl` uses. */
    // AS3: RoomToolCtrl.as::prepareMsgSelect()
    private prepareMsgSelect(select: IDropMenuWindow): void
    {
        const templates = this._main?.initMsg?.roomMessageTemplates ?? [];

        log.debug(`MSG TEMPLATES: ${templates.length}`);

        select.populate(templates);
    }

    // AS3: RoomToolCtrl.as::onSelectTemplate()
    private onSelectTemplate = (event: WindowEvent): void =>
    {
        if(event.type !== 'WE_SELECTED') return;

        const templates = this._main?.initMsg?.roomMessageTemplates ?? [];
        const template = templates[this._msgSelect?.selection ?? -1] ?? null;

        if(template === null) return;

        this._includeInfo = false;

        if(this._messageInput !== null) this._messageInput.text = template;
    };

    // AS3: RoomToolCtrl.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.dispose();
    };

    /**
     * AS3 removes only the *room-enter* listener here. A card disposed before its room info arrives
     * therefore stays on the room-info list — that is the source's behaviour and it is kept.
     */
    // AS3: RoomToolCtrl.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._main?.messageHandler?.removeRoomEnterListener(this);

        if(this._frame !== null)
        {
            (this._frame as unknown as IWindow).destroy();
            this._frame = null;
        }

        this._data = null;
        this._main = null;
        this._list = null;
        this._msgSelect = null;
        this._messageInput = null;
        this._kickCheck = null;
        this._lockCheck = null;
        this._changeNameCheck = null;
    }
}
