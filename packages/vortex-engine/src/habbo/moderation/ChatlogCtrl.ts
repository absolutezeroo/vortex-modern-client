/**
 * ChatlogCtrl — the evidence view: chat records with a header per record and one row per line.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/ChatlogCtrl.as
 *
 * **One class, three window types.** The type is a constructor argument (3 = an issue's evidence,
 * 4 = a room's chatlog, 5 = a user's), and `getType()` returns it — so the tracker keeps the three
 * flavours in separate slots. `onChatlog()` compares that type *and* the id against the answer,
 * because all three come back through one listener list.
 *
 * **`_embedded` decides whether this owns a window at all.** Embedded in an issue handler it is
 * handed a container and a list and only paints into them; standalone it builds `evidence_frame`
 * and takes the two row prototypes out of it. The layout ships both prototypes in the list: item 0
 * is the header, item 1 the chat line.
 *
 * Content rows come from a **static pool shared by every instance**, capped at 1000. Header rows do
 * not — they carry per-record action buttons and are disposed outright.
 *
 * The header's two buttons are re-purposed per record type: room tool / view room, open / delete
 * thread, open / delete message, view selfie, moderate photo. Only the first record type is
 * conditional — a room record with no room id gets no buttons at all.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IScrollableListWindow} from '@core/window/components/IScrollableListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {StringUtil} from '@habbo/utils/StringUtil';
import type {ChatEntryData} from '@habbo/communication/messages/parser/moderation/ChatEntryData';
import type {ChatRecordData} from '@habbo/communication/messages/parser/moderation/ChatRecordData';
import type {IssueInfoData} from '@habbo/communication/messages/parser/moderation/IssueInfoData';
import {HideDiscussionMessage} from './actions/HideDiscussionMessage';
import {HideDiscussionThread} from './actions/HideDiscussionThread';
import {OpenDiscussionMessage} from './actions/OpenDiscussionMessage';
import {OpenDiscussionThread} from './actions/OpenDiscussionThread';
import {OpenExternalLink} from './actions/OpenExternalLink';
import {OpenRoomInSpectatorMode} from './actions/OpenRoomInSpectatorMode';
import {OpenRoomTool} from './actions/OpenRoomTool';
import type {IChatlogReceiver} from './IChatlogReceiver';
import type {ITrackedWindow} from './ITrackedWindow';
import type {ModerationManager} from './ModerationManager';
import {UserInfoFrameCtrl} from './UserInfoFrameCtrl';

export class ChatlogCtrl implements IDisposable, ITrackedWindow, IChatlogReceiver
{
    // AS3: ChatlogCtrl.as::CHAT_LINE_POOL_MAX_SIZE
    private static readonly CHAT_LINE_POOL_MAX_SIZE: number = 1000;

    /** `0xFFF0D6A3` — AS3 writes it as the decimal `4293973667`. The user who was reported. */
    // AS3: ChatlogCtrl.as::CHAT_REPORTED_USER_COLOUR
    private static readonly CHAT_REPORTED_USER_COLOUR: number = 0xFFF0D6A3;

    /** `0xFFA3BDF0` — AS3 writes it as the decimal `4288921072`. The user who reported. */
    // AS3: ChatlogCtrl.as::CHAT_REPORTEE_COLOUR
    private static readonly CHAT_REPORTEE_COLOUR: number = 0xFFA3BDF0;

    /** `0xFFC3ECFA` — the alternating tint for everyone else. */
    // AS3: ChatlogCtrl.as::populateContentLine()
    private static readonly CHAT_ALTERNATE_COLOUR: number = 0xFFC3ECFA;

    /** `0xFFFFFFFF`. */
    // AS3: ChatlogCtrl.as::populateContentLine()
    private static readonly CHAT_DEFAULT_COLOUR: number = 0xFFFFFFFF;

    /** Shared by every instance, as in AS3. */
    // AS3: ChatlogCtrl.as::CHAT_LINE_POOL
    private static readonly CHAT_LINE_POOL: IWindowContainer[] = [];

    /** AS3's fallback when `stories.admin.tool.base.url` is unset. */
    // AS3: ChatlogCtrl.as::populateEvidence()
    private static readonly STORIES_ADMIN_FALLBACK_URL: string =
        'https://theallseeingeye.sulake.com/habbo-stories-admin/#/photos/';

    /** AS3's `new Timer(1000, 1)` — one shot, a second after the last resize. */
    // AS3: ChatlogCtrl.as::show()
    private static readonly RESIZE_DEBOUNCE_MS: number = 1000;

    /** The scrollbar's width here — 22, not the 17 the two list windows use. */
    // AS3: ChatlogCtrl.as::refreshScrollBarVisibility()
    private static readonly SCROLLBAR_WIDTH: number = 22;

    /** `recordType` values; AS3 switches on `recordType - 1`. */
    // AS3: ChatlogCtrl.as::populateEvidence()
    private static readonly RECORD_TYPE_ROOM: number = 1;
    // AS3: ChatlogCtrl.as::populateEvidence()
    private static readonly RECORD_TYPE_IM: number = 2;
    // AS3: ChatlogCtrl.as::populateEvidence()
    private static readonly RECORD_TYPE_FORUM_THREAD: number = 3;
    // AS3: ChatlogCtrl.as::populateEvidence()
    private static readonly RECORD_TYPE_FORUM_MESSAGE: number = 4;
    // AS3: ChatlogCtrl.as::populateEvidence()
    private static readonly RECORD_TYPE_SELFIE: number = 5;
    // AS3: ChatlogCtrl.as::populateEvidence()
    private static readonly RECORD_TYPE_PHOTO: number = 6;

    /** Derived name — `_SafeStr_4778`: this window's tracker type, from the constructor. */
    // AS3: ChatlogCtrl.as::_SafeStr_4778
    private _type: number;

    /** Derived name — `_SafeStr_4872`: the subject id — issue, room or user. */
    // AS3: ChatlogCtrl.as::_SafeStr_4872
    private _id: number;

    // AS3: ChatlogCtrl.as::_msg
    private _msg: IMessageComposer<unknown[]> | null;

    // AS3: ChatlogCtrl.as::_main
    private _main: ModerationManager | null;

    // AS3: ChatlogCtrl.as::_frame
    private _frame: IWindowContainer | null;

    /** Derived name — `_SafeStr_4652`. */
    // AS3: ChatlogCtrl.as::_SafeStr_4652
    private _list: IItemListWindow | null;

    // AS3: ChatlogCtrl.as::_rooms
    private _rooms: ChatRecordData[] = [];

    // AS3: ChatlogCtrl.as::_embedded
    private _embedded: boolean;

    // AS3: ChatlogCtrl.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_6023`: the chat-line prototype (list item 1). */
    // AS3: ChatlogCtrl.as::_SafeStr_6023
    private _lineTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6897`: the header prototype (list item 0). */
    // AS3: ChatlogCtrl.as::_SafeStr_6897
    private _headerTemplate: IWindowContainer | null = null;

    /** user id → 0 for the caller, 1 for the reported user; anything else is untinted. */
    // AS3: ChatlogCtrl.as::_hilitedUserIds
    private _hilitedUserIds: Map<number, boolean> | null = null;

    /** Derived name — `_SafeStr_5526`. */
    // AS3: ChatlogCtrl.as::_SafeStr_5526
    private _resizeTimer: ReturnType<typeof setTimeout> | null = null;

    /** Derived name — `_SafeStr_7995`: chatter name → id, so a clicked name resolves to a card. */
    // AS3: ChatlogCtrl.as::_SafeStr_7995
    private _chatterIdsByName: Map<string, number> = new Map();

    /** Derived name — `_SafeStr_7643`. */
    // AS3: ChatlogCtrl.as::_SafeStr_7643
    private _issue: IssueInfoData | null;

    // AS3: ChatlogCtrl.as::_contentLines
    private _contentLines: IWindowContainer[] = [];

    // AS3: ChatlogCtrl.as::_headers
    private _headers: IWindowContainer[] = [];

    // AS3: ChatlogCtrl.as::ChatlogCtrl()
    constructor(
        msg: IMessageComposer<unknown[]>,
        main: ModerationManager,
        type: number,
        id: number,
        issue: IssueInfoData | null = null,
        frame: IWindowContainer | null = null,
        list: IItemListWindow | null = null,
        embedded: boolean = false
    )
    {
        this._main = main;
        this._type = type;
        this._id = id;
        this._msg = msg;
        this._issue = issue;
        this._frame = frame;
        this._list = list;
        this._embedded = embedded;
    }

    // AS3: ChatlogCtrl.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * The frame is built either way — an embedded instance builds it only to steal the two
     * prototypes out of it, then disposes it.
     */
    // AS3: ChatlogCtrl.as::show()
    public show(): void
    {
        const built = this._main?.getXmlWindow('evidence_frame') as unknown as IFrameWindow | null;

        if(built === null || this._main === null) return;

        (built as unknown as IWindow).visible = false;

        const list = built.findChildByName('evidence_list') as unknown as IItemListWindow | null;

        if(list !== null)
        {
            this._headerTemplate = list.getListItemAt(0) as unknown as IWindowContainer | null;
            this._lineTemplate = list.getListItemAt(1) as unknown as IWindowContainer | null;
            list.removeListItems();
        }

        if(!this._embedded)
        {
            this._frame = built as unknown as IWindowContainer;

            const frame = this._frame as unknown as IWindow;

            frame.procedure = this.onWindow;
            frame.visible = true;

            const closeButton = this._frame.findChildByTag('close');

            if(closeButton !== null) closeButton.procedure = this.onClose;

            this._list = list;
        }
        else
        {
            (built as unknown as IWindow).dispose();
        }

        if(this._msg !== null) this._main.connection?.send(this._msg);

        this._main.messageHandler?.addChatlogListener(this);
    }

    // AS3: ChatlogCtrl.as::hide()
    public hide(): void
    {
        this.dispose();
    }

    /** Recycles what is on screen before repainting, and unsubscribes: this asks once. */
    // AS3: ChatlogCtrl.as::onChatlog()
    public onChatlog(
        caption: string,
        type: number,
        id: number,
        records: ChatRecordData[],
        highlightedUserIds: Map<number, boolean>
    ): void
    {
        if(type !== this._type || id !== this._id || this._disposed) return;

        for(const line of this._contentLines) this.recycleContentLine(line);
        for(const header of this._headers) (header as unknown as IWindow).dispose();

        this._contentLines = [];
        this._headers = [];

        this._main?.messageHandler?.removeChatlogListener(this);

        this._rooms = records;
        this._hilitedUserIds = highlightedUserIds;

        this.populate();
        this.onResizeTimer();

        if(this._embedded) return;

        const frame = this._frame as unknown as IWindow | null;

        if(frame !== null)
        {
            frame.caption = caption;
            frame.visible = true;
        }
    }

    // AS3: ChatlogCtrl.as::getType()
    public getType(): number
    {
        return this._type;
    }

    // AS3: ChatlogCtrl.as::getId()
    public getId(): string
    {
        return `${this._id}`;
    }

    // AS3: ChatlogCtrl.as::setId()
    public setId(id: number): void
    {
        this._id = id;
    }

    // AS3: ChatlogCtrl.as::getFrame()
    public getFrame(): IFrameWindow | null
    {
        return this._frame as unknown as IFrameWindow | null;
    }

    /** Auto-arrange is switched off around the whole rebuild, then back on once. */
    // AS3: ChatlogCtrl.as::populate()
    private populate(): void
    {
        if(this._list === null) return;

        this._list.autoArrangeItems = false;
        this._list.removeListItems();

        for(const record of this._rooms) this.populateEvidence(record);

        this._list.autoArrangeItems = true;
    }

    /**
     * Builds one record's header and its lines, then scrolls to the **first highlighted line** if
     * there is one — which is why `autoArrangeItems` is turned back on before the scroll is
     * computed: the rows need their final `y`.
     */
    // AS3: ChatlogCtrl.as::populateEvidence()
    private populateEvidence(record: ChatRecordData): void
    {
        const header = this.createHeaderLine();

        if(header === null || this._main === null) return;

        const text = header.findChildByName('text');
        const action = header.findChildByName('btnHeaderAction');
        const action2 = header.findChildByName('btnHeaderAction2');

        if(action2 !== null) action2.visible = false;

        this.buildHeaderActions(record, text, action, action2);

        this.addHeaderLineToList(header);

        let alternate = true;
        let firstHighlighted = -1;

        for(let index = 0; index < record.chatlog.length; index++)
        {
            const entry = record.chatlog[index];

            this.populateContentLine(entry, alternate);

            alternate = !alternate;

            if(entry.hasHighlighting && firstHighlighted === -1) firstHighlighted = index;
        }

        if(firstHighlighted === -1 || this._list === null) return;

        this._list.autoArrangeItems = true;

        const scrollable = this._list as unknown as IScrollableListWindow;

        if(scrollable.maxScrollV > 0)
        {
            const row = this._list.getListItemAt(firstHighlighted);

            if(row !== null) scrollable.scrollV = row.y / scrollable.maxScrollV;
        }
    }

    /** AS3 passes a null caller frame when embedded, so the room tool centres instead. */
    // AS3: ChatlogCtrl.as::populateEvidence()
    private buildHeaderActions(
        record: ChatRecordData, text: IWindow | null, action: IWindow | null, action2: IWindow | null
    ): void
    {
        if(this._main === null) return;

        const callerFrame = this._embedded ? null : (this._frame as unknown as IFrameWindow | null);

        switch(record.recordType)
        {
            case ChatlogCtrl.RECORD_TYPE_ROOM:
                if(record.roomId <= 0) break;

                if(action !== null)
                {
                    action.caption = 'Room tool';
                    new OpenRoomTool(callerFrame, this._main, action, record.roomId);
                }

                if(text !== null)
                {
                    text.caption = record.roomName == null
                        ? `Room #${record.roomId}`
                        : `Room: ${record.roomName}`;
                }

                if(action2 !== null)
                {
                    action2.visible = true;
                    action2.caption = 'View room';
                    new OpenRoomInSpectatorMode(this._main, action2, record.roomId);
                }
                break;

            case ChatlogCtrl.RECORD_TYPE_IM:
                if(text !== null) text.caption = 'IM session';
                break;

            case ChatlogCtrl.RECORD_TYPE_FORUM_THREAD:
                if(text !== null) text.caption = 'Forum thread';

                if(action2 !== null)
                {
                    action2.visible = true;
                    action2.caption = 'Open thread';
                    new OpenDiscussionThread(this._main, action2, record.groupId, record.threadId);
                }

                if(action !== null)
                {
                    action.caption = 'Delete';
                    new HideDiscussionThread(this._main, this, action, record.groupId, record.threadId);
                }
                break;

            case ChatlogCtrl.RECORD_TYPE_FORUM_MESSAGE:
                if(text !== null) text.caption = 'Forum message';

                if(action2 !== null)
                {
                    action2.visible = true;
                    action2.caption = 'Open Message';
                    new OpenDiscussionMessage(
                        this._main,
                        action2,
                        record.groupId,
                        record.threadId,
                        Number(record.context.get('messageIndex') ?? 0)
                    );
                }

                if(action !== null)
                {
                    action.caption = 'Delete';
                    new HideDiscussionMessage(
                        this._main, this, action, record.groupId, record.threadId, record.messageId
                    );
                }
                break;

            case ChatlogCtrl.RECORD_TYPE_SELFIE:
                if(text !== null) text.caption = 'Selfie report';

                if(action2 !== null)
                {
                    action2.visible = true;
                    action2.caption = 'View selfie';
                    new OpenExternalLink(this._main, action2, String(record.context.get('url') ?? ''));
                }

                if(action !== null)
                {
                    action.visible = true;
                    action.caption = 'Room tool';
                    new OpenRoomTool(callerFrame, this._main, action, record.roomId);
                }
                break;

            case ChatlogCtrl.RECORD_TYPE_PHOTO:
            {
                if(text !== null) text.caption = 'Photo report';

                let baseUrl = this._main.getProperty('stories.admin.tool.base.url');

                if(StringUtil.isEmpty(baseUrl)) baseUrl = ChatlogCtrl.STORIES_ADMIN_FALLBACK_URL;

                if(action2 !== null)
                {
                    action2.visible = true;
                    action2.caption = 'Moderate photo';
                    new OpenExternalLink(
                        this._main, action2, baseUrl + String(record.context.get('extraDataId') ?? '')
                    );
                }

                if(action !== null)
                {
                    action.visible = true;
                    action.caption = 'Room tool';
                    new OpenRoomTool(callerFrame, this._main, action, record.roomId);
                }
                break;
            }
        }
    }

    // AS3: ChatlogCtrl.as::addContentLineToList()
    private addContentLineToList(line: IWindowContainer): void
    {
        this._list?.addListItem(line as unknown as IWindow);
        this._contentLines.push(line);
    }

    // AS3: ChatlogCtrl.as::addHeaderLineToList()
    private addHeaderLineToList(header: IWindowContainer): void
    {
        this._list?.addListItem(header as unknown as IWindow);
        this._headers.push(header);
    }

    // AS3: ChatlogCtrl.as::createContentLine()
    private createContentLine(): IWindowContainer | null
    {
        const pooled = ChatlogCtrl.CHAT_LINE_POOL.pop() ?? null;

        if(pooled !== null) return pooled;

        return ((this._lineTemplate as unknown as IWindow | null)?.clone() ?? null) as unknown as IWindowContainer | null;
    }

    /** AS3 returns the row **10 px shorter** than the prototype; the height is recomputed on reuse. */
    // AS3: ChatlogCtrl.as::recycleContentLine()
    private recycleContentLine(line: IWindowContainer): void
    {
        if(ChatlogCtrl.CHAT_LINE_POOL.length >= ChatlogCtrl.CHAT_LINE_POOL_MAX_SIZE)
        {
            (line as unknown as IWindow).dispose();

            return;
        }

        const chatter = line.findChildByName('chatter_txt');

        chatter?.removeEventListener('WME_CLICK', this.onUserClick);

        const template = this._lineTemplate as unknown as IWindow | null;
        const lineWindow = line as unknown as IWindow;

        if(template !== null)
        {
            lineWindow.width = template.width;
            lineWindow.height = template.height - 10;
        }

        ChatlogCtrl.CHAT_LINE_POOL.push(line);
    }

    /** Headers are never pooled — they carry per-record buttons. */
    // AS3: ChatlogCtrl.as::createHeaderLine()
    private createHeaderLine(): IWindowContainer | null
    {
        return ((this._headerTemplate as unknown as IWindow | null)?.clone() ?? null) as unknown as IWindowContainer | null;
    }

    /**
     * Row height is driven by the message text: the message is measured, and the timestamp, name and
     * row are all stretched to match, so a wrapped line does not overlap the next.
     */
    // AS3: ChatlogCtrl.as::populateContentLine()
    private populateContentLine(entry: ChatEntryData, alternate: boolean): void
    {
        const line = this.createContentLine();

        if(line === null) return;

        const lineWindow = line as unknown as IWindow;
        const time = line.findChildByName('time_txt');
        const chatter = line.findChildByName('chatter_txt') as ITextWindow | null;
        const message = line.findChildByName('msg_txt') as ITextWindow | null;

        if(time !== null) time.caption = entry.timestamp;

        const highlight = this._hilitedUserIds?.get(entry.chatterId);

        if(highlight !== undefined)
        {
            lineWindow.color = highlight ? ChatlogCtrl.CHAT_REPORTEE_COLOUR : ChatlogCtrl.CHAT_REPORTED_USER_COLOUR;
        }
        else
        {
            lineWindow.color = alternate ? ChatlogCtrl.CHAT_ALTERNATE_COLOUR : ChatlogCtrl.CHAT_DEFAULT_COLOUR;
        }

        if(entry.hasHighlighting && message !== null)
        {
            const format = message.getTextFormat();

            format.bold = true;

            message.setTextFormat(format);
            message.bold = true;
        }

        if(chatter !== null)
        {
            const chatterWindow = chatter as unknown as IWindow;

            if(entry.chatterId > 0)
            {
                chatter.text = entry.chatterName;
                chatter.underline = true;

                chatterWindow.addEventListener('WME_CLICK', this.onUserClick);

                if(!this._chatterIdsByName.get(entry.chatterName))
                {
                    this._chatterIdsByName.set(entry.chatterName, entry.chatterId);
                }
            }
            else if(entry.chatterId === 0)
            {
                chatter.text = 'Bot / pet';
                chatter.underline = false;
            }
            else
            {
                chatter.text = '-';
                chatter.underline = false;
            }

            chatterWindow.color = lineWindow.color;
        }

        if(time !== null) time.color = lineWindow.color;

        if(message !== null)
        {
            const messageWindow = message as unknown as IWindow;

            messageWindow.color = lineWindow.color;
            message.text = entry.message;

            const height = Math.max(time?.height ?? 0, message.textHeight + 5);

            messageWindow.height = height;

            // AS3 has a block here that sets `align = "left"` and bumps `rightMargin` by 10 — but it
            // calls `getTextFormat()` three separate times and never passes the result to
            // `setTextFormat()`. In Flash each call returns a fresh copy, so all three writes land on
            // throwaway objects: the block is dead, and reproducing it would mean adding two fields
            // to `ITextFormat` that nothing reads. Left out deliberately, not overlooked.

            if(chatter !== null) (chatter as unknown as IWindow).height = height;
            if(time !== null) time.height = height;

            lineWindow.height = height;
        }

        this.addContentLineToList(line);
    }

    /** The clicked caption is the chatter's name; the map turns it back into an id. */
    // AS3: ChatlogCtrl.as::onUserClick()
    private onUserClick = (event: WindowMouseEvent): void =>
    {
        if(this._main === null) return;

        const name = event.target?.caption ?? '';
        const userId = this._chatterIdsByName.get(name) ?? 0;

        this._main.windowTracker?.show(
            new UserInfoFrameCtrl(this._main, userId, this._issue),
            this._frame as unknown as IFrameWindow | null,
            false,
            false,
            true
        );
    };

    // AS3: ChatlogCtrl.as::onClose()
    private onClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.dispose();
    };

    /** Unlike the two list windows this *restarts* the debounce on every resize. */
    // AS3: ChatlogCtrl.as::onWindow()
    private onWindow = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WE_RESIZED' || window !== (this._frame as unknown as IWindow)) return;

        if(this._resizeTimer !== null) clearTimeout(this._resizeTimer);

        this._resizeTimer = setTimeout(() =>
        {
            this._resizeTimer = null;

            this.onResizeTimer();
        }, ChatlogCtrl.RESIZE_DEBOUNCE_MS);
    };

    // AS3: ChatlogCtrl.as::onResizeTimer()
    private onResizeTimer(): void
    {
        this.refreshListDims();
        this.refreshScrollBarVisibility();
    }

    /** Re-wraps every chat line to the list's current width and re-measures its height. */
    // AS3: ChatlogCtrl.as::refreshListDims()
    private refreshListDims(): void
    {
        const list = this._list;

        if(list === null) return;

        list.autoArrangeItems = false;

        for(let index = 0; index < list.numListItems; index++)
        {
            const row = list.getListItemAt(index) as unknown as IWindowContainer | null;

            if(row === null || (row as unknown as IWindow).name !== 'chatline') continue;

            const message = row.findChildByName('msg_txt') as ITextWindow | null;

            if(message === null) continue;

            const messageWindow = message as unknown as IWindow;
            const rowWindow = row as unknown as IWindow;

            messageWindow.width = rowWindow.width - messageWindow.x;
            messageWindow.height = message.textHeight + 5;
            rowWindow.height = messageWindow.height;
        }

        list.autoArrangeItems = true;
    }

    // AS3: ChatlogCtrl.as::refreshScrollBarVisibility()
    private refreshScrollBarVisibility(): boolean
    {
        const listWindow = this._list as unknown as IWindow | null;
        const scrollable = this._list as unknown as IScrollableListWindow | null;

        if(listWindow === null || scrollable === null) return false;

        const parent = listWindow.parent as unknown as IWindowContainer | null;
        const scroller = parent?.getChildByName('scroller') ?? null;

        if(scroller === null) return false;

        const needsScroller = scrollable.scrollableRegion.height > listWindow.height;

        if(scroller.visible)
        {
            if(needsScroller) return false;

            scroller.visible = false;
            listWindow.width += ChatlogCtrl.SCROLLBAR_WIDTH;

            return true;
        }

        if(needsScroller)
        {
            scroller.visible = true;
            listWindow.width -= ChatlogCtrl.SCROLLBAR_WIDTH;

            return true;
        }

        return false;
    }

    /** An embedded instance leaves its rows alone — the issue handler owns the list they sit in. */
    // AS3: ChatlogCtrl.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._main = null;
        this._msg = null;
        this._issue = null;

        if(this._list !== null)
        {
            this._list.removeListItems();
            (this._list as unknown as IWindow).dispose();
            this._list = null;
        }

        if(this._frame !== null)
        {
            (this._frame as unknown as IWindow).destroy();
            this._frame = null;
        }

        this._rooms = [];
        this._hilitedUserIds = null;

        if(this._resizeTimer !== null)
        {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = null;
        }

        if(!this._embedded)
        {
            for(const line of this._contentLines) this.recycleContentLine(line);
            for(const header of this._headers) (header as unknown as IWindow).dispose();
        }

        this._contentLines = [];
        this._headers = [];

        if(this._lineTemplate !== null)
        {
            (this._lineTemplate as unknown as IWindow).dispose();
            this._lineTemplate = null;
        }

        if(this._headerTemplate !== null)
        {
            (this._headerTemplate as unknown as IWindow).dispose();
            this._headerTemplate = null;
        }
    }
}
