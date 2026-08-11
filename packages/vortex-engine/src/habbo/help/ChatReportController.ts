import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

import type {ChatRegistryItem} from './cfh/registry/chat/ChatRegistryItem';
import type {InstantMessageRegistryItem} from './cfh/registry/instantmessage/InstantMessageRegistryItem';
import type {HabboHelp} from './HabboHelp';

const log = Logger.getLogger('habbo.help.ChatReportController');

/**
 * The chat-line picker a report is filed against
 *
 * Opens `chat_report`, fills it with what the reported user said — grouped by room for room chat,
 * flat for instant messages — and lets the reporter click the lines that matter. Selection lives
 * on the registry items themselves, not on the windows, which is why the two `refresh*` passes
 * re-read it rather than tracking state here.
 *
 * While the window is open both registries have `holdPurges` set: they trim themselves as new
 * chat arrives, and a line disappearing out from under a half-finished report would silently
 * change what gets submitted.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/ChatReportController.as
 */
export class ChatReportController
{
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::COLOR_ITEM_SELECTED
    private static readonly COLOR_ITEM_SELECTED: number = 4282169599;

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::COLOR_ITEM_NORMAL
    private static readonly COLOR_ITEM_NORMAL: number = 4293848814;

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::_habboHelp
    private _habboHelp: HabboHelp | null;

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::_procedure
    // Name derived (`_SafeStr_9831`): the window procedure the owner hands in, so that the
    // submit/close buttons of `chat_report` are handled by `CallForHelpManager` rather than here.
    private _procedure: ((event: WindowEvent, window: IWindow) => void) | null;

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::_reportedRoomId
    private _reportedRoomId: number = 0;

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::_reportedUserId
    private _reportedUserId: number = 0;

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::ChatReportController()
    constructor(habboHelp: HabboHelp, procedure: ((event: WindowEvent, window: IWindow) => void) | null)
    {
        this._habboHelp = habboHelp;
        this._procedure = procedure;
    }

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * The room the selected chat lines came from
	 *
	 * Latched by the first selection and used by the submit path, which prefers it over the
	 * manager's own reported room id.
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::get reportedRoomId()
    get reportedRoomId(): number
    {
        return this._reportedRoomId;
    }

    /**
	 * Open the picker
	 *
	 * @param ownUserId The reporter, whose own lines are left out of the room-chat list
	 * @param reportedUserId The reported user
	 * @param reportType The `REPORT_TYPE_*` being filed — 3 (IM) switches to the IM list
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::show()
    show(ownUserId: number, reportedUserId: number, reportType: number): void
    {
        const window = this._habboHelp?.getXmlWindow('chat_report') as IWindowContainer | null;

        if(!window)
        {
            log.error('show: getXmlWindow("chat_report") returned null - layout not registered?');

            return;
        }

        this._window = window;
        this._window.procedure = this._procedure;
        this._window.center();

        this._reportedUserId = reportedUserId;
        this._reportedRoomId = -1;

        if(reportType === 3)
        {
            this.deselectInstantMessageEntries();
            this.populateInstantMessageList(ownUserId, reportedUserId);
        }
        else
        {
            this.deselectChatEntries();
            this.populateChatMessageList(ownUserId, reportedUserId);
        }
    }

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::closeWindow()
    closeWindow(): void
    {
        // Let both registries resume trimming now that nothing is being picked from them.
        if(this._habboHelp?.chatRegistry) this._habboHelp.chatRegistry.holdPurges = false;
        if(this._habboHelp?.instantMessageRegistry) this._habboHelp.instantMessageRegistry.holdPurges = false;

        this._window?.dispose();
        this._window = null;
    }

    /**
	 * Flatten the picked lines into the `[userId, text, userId, text, …]` pairs the wire wants
	 *
	 * @param reportType 3 reads the IM registry, anything else the room-chat one
	 * @param userId Overrides the reported user for the IM case when positive
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::collectSelectedEntries()
    collectSelectedEntries(reportType: number, userId: number): Array<number | string>
    {
        const entries: Array<number | string> = [];

        if(reportType === 3)
        {
            const targetId = userId > 0 ? userId : this._reportedUserId;
            const items = this._habboHelp?.instantMessageRegistry.getItemsByUser(targetId) ?? [];

            for(const item of items)
            {
                if(!item.selected) continue;

                // A negative user id marks a group/thread message, whose real sender is packed
                // into the name as "<id>:<name>".
                if(item.userId < 0) entries.push(Number(item.userName.split(':')[0]));
                else entries.push(item.userId);

                entries.push(item.text);
            }

            return entries;
        }

        for(const item of this._habboHelp?.chatRegistry.getItems() ?? [])
        {
            if(!item.selected) continue;

            entries.push(item.userId);
            entries.push(item.text);
        }

        return entries;
    }

    /**
	 * Fill the list with the reported user's instant messages
	 *
	 * One room group holding every line, since IMs have no room.
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::populateInstantMessageList()
    private populateInstantMessageList(_ownUserId: number, reportedUserId: number): void
    {
        if(!this._window || !this._habboHelp) return;

        const roomItems = this._window.findChildByName('room_items') as IItemListWindow | null;

        if(!roomItems) return;

        const groupTemplate = roomItems.getListItemAt(0) as IWindowContainer | null;
        const entryTemplate = this._habboHelp.getXmlWindow('chat_report_item') as IWindowContainer | null;

        if(!groupTemplate || !entryTemplate) return;

        roomItems.removeListItems();

        const group = groupTemplate.clone() as IWindowContainer;

        roomItems.addListItemAt(group, 0);

        const chatItems = group.findChildByName('chat_items') as IItemListWindow | null;

        if(!chatItems) return;

        chatItems.removeListItems();

        this._habboHelp.instantMessageRegistry.holdPurges = true;

        const items = this._habboHelp.instantMessageRegistry.getItemsByUser(reportedUserId) ?? [];

        for(const item of items)
        {
            const entry = entryTemplate.clone() as IWindowContainer;
            const text = entry.getChildByName('text') as ITextWindow | null;

            if(text)
            {
                text.caption = item.userId < 0
                    ? `${item.userName.split(':')[1]}: ${item.text}`
                    : `${item.userName}: ${item.text}`;
            }

            entry.id = item.index;
            entry.procedure = this.onInstantMessageEntryEvent;
            entry.color = ChatReportController.COLOR_ITEM_NORMAL;

            chatItems.addListItem(entry);
        }
    }

    /**
	 * Fill the list with room chat, grouped by room
	 *
	 * A new group is opened each time the room id changes as the registry is walked, and each is
	 * inserted at the top, so the most recent room ends up first. The reporter's own lines are
	 * skipped — you cannot report yourself.
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::populateChatMessageList()
    private populateChatMessageList(ownUserId: number, reportedUserId: number): void
    {
        if(!this._window || !this._habboHelp) return;

        const roomItems = this._window.findChildByName('room_items') as IItemListWindow | null;

        if(!roomItems) return;

        const groupTemplate = roomItems.getListItemAt(0) as IWindowContainer | null;
        const entryTemplate = this._habboHelp.getXmlWindow('chat_report_item') as IWindowContainer | null;

        if(!groupTemplate || !entryTemplate) return;

        roomItems.removeListItems();

        this._habboHelp.chatRegistry.holdPurges = true;

        const items = reportedUserId > 0
            ? this._habboHelp.chatRegistry.getItemsByUser(reportedUserId)
            : this._habboHelp.chatRegistry.getItems();

        let currentRoomId = 0;
        let chatItems: IItemListWindow | null = null;

        for(const item of items)
        {
            if(item.userId === ownUserId) continue;

            if(item.roomId !== currentRoomId)
            {
                currentRoomId = item.roomId;

                const group = groupTemplate.clone() as IWindowContainer;
                const roomName = group.findChildByName('room_name');

                // AS3 writes the literal "Room: " prefix here rather than a localization key.
                if(roomName) roomName.caption = `Room: ${item.roomName}`;

                roomItems.addListItemAt(group, 0);

                chatItems = group.findChildByName('chat_items') as IItemListWindow | null;
                chatItems?.removeListItems();
            }

            if(!chatItems) continue;

            const entry = entryTemplate.clone() as IWindowContainer;
            const text = entry.getChildByName('text') as ITextWindow | null;

            if(text) text.caption = `${item.userName}: ${item.text}`;

            entry.id = item.index;
            entry.procedure = this.onChatEntryEvent;
            entry.color = ChatReportController.COLOR_ITEM_NORMAL;

            chatItems.addListItem(entry);
        }
    }

    /**
	 * Toggle one room-chat line
	 *
	 * Selecting a line from a different room than the one already being reported clears the
	 * previous selection: a report is filed against a single room.
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::onChatEntryEvent()
    private onChatEntryEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const item: ChatRegistryItem | null = this._habboHelp?.chatRegistry.getItem(window.id) ?? null;

        if(!item) return;

        if(!item.selected && item.roomId !== this._reportedRoomId)
        {
            this._reportedRoomId = item.roomId;
            this.deselectChatEntries();
        }

        item.selected = !item.selected;
        window.color = item.selected ? ChatReportController.COLOR_ITEM_SELECTED : ChatReportController.COLOR_ITEM_NORMAL;
    };

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::onInstantMessageEntryEvent()
    private onInstantMessageEntryEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const item: InstantMessageRegistryItem | null =
            this._habboHelp?.instantMessageRegistry.getItem(this._reportedUserId, window.id) ?? null;

        if(!item) return;

        item.selected = !item.selected;
        window.color = item.selected ? ChatReportController.COLOR_ITEM_SELECTED : ChatReportController.COLOR_ITEM_NORMAL;
    };

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::deselectInstantMessageEntries()
    private deselectInstantMessageEntries(): void
    {
        this.deselectAllEntries();
        this.refreshInstantMessageEntries();
    }

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::deselectChatEntries()
    private deselectChatEntries(): void
    {
        this.deselectAllEntries();
        this.refreshChatEntries();
    }

    /**
	 * Clear selection across both registries
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::deselectAllEntries()
    private deselectAllEntries(): void
    {
        if(!this._habboHelp) return;

        for(const items of this._habboHelp.instantMessageRegistry.getItems().values())
        {
            for(const item of items) item.selected = false;
        }

        for(const item of this._habboHelp.chatRegistry.getItems()) item.selected = false;
    }

    /**
	 * Repaint every room-chat row from the registry's current selection
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::refreshChatEntries()
    private refreshChatEntries(): void
    {
        this.forEachEntryWindow((entry) =>
        {
            const item = this._habboHelp?.chatRegistry.getItem(entry.id) ?? null;

            if(item) entry.color = item.selected ? ChatReportController.COLOR_ITEM_SELECTED : ChatReportController.COLOR_ITEM_NORMAL;
        });
    }

    /**
	 * Repaint every instant-message row from the registry's current selection
	 */
    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::refreshInstantMessageEntries()
    refreshInstantMessageEntries(): void
    {
        this.forEachEntryWindow((entry) =>
        {
            const item = this._habboHelp?.instantMessageRegistry.getItem(this._reportedUserId, entry.id) ?? null;

            if(item) entry.color = item.selected ? ChatReportController.COLOR_ITEM_SELECTED : ChatReportController.COLOR_ITEM_NORMAL;
        });
    }

    /**
	 * Walk every chat row in every room group
	 */
    // TS-only: the two `refresh*` methods above are the same nested walk in AS3, written twice.
    // Factored so the traversal exists once; each caller keeps its own registry lookup.
    private forEachEntryWindow(visit: (entry: IWindow) => void): void
    {
        const roomItems = this._window?.findChildByName('room_items') as IItemListWindow | null;

        if(!roomItems) return;

        for(let i = 0; i < roomItems.numListItems; i++)
        {
            const group = roomItems.getListItemAt(i) as IWindowContainer | null;
            const chatItems = group?.findChildByName('chat_items') as IItemListWindow | null;

            if(!chatItems) continue;

            for(let j = 0; j < chatItems.numListItems; j++)
            {
                const entry = chatItems.getListItemAt(j);

                if(entry) visit(entry);
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/help/ChatReportController.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.closeWindow();

        this._habboHelp = null;
        this._procedure = null;
        this._disposed = true;
    }
}
