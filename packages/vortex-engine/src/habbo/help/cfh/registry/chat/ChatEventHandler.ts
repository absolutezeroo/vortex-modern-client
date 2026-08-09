import type {RoomSessionChatEvent} from '@habbo/session/events/RoomSessionChatEvent';
import type {IChatStyleInternal} from '@habbo/freeflowchat/viewer/visualization/style/IChatStyleInternal';
import {Logger} from '@core/utils/Logger';

import type {HabboHelp} from '../../../HabboHelp';

const log = Logger.getLogger('habbo.help.cfh.registry.chat.ChatEventHandler');

/**
 * Room chat event listener for CFH reports
 *
 * Captures chat messages from room sessions and stores them
 * in the ChatRegistry for later use in Call For Help reports.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/cfh/registry/chat/ChatEventHandler.as
 */
export class ChatEventHandler
{
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatEventHandler.as::_help
    private _help: HabboHelp | null;
    private _onRoomChatBound: (event: RoomSessionChatEvent) => void;

    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatEventHandler.as::ChatEventHandler()
    constructor(help: HabboHelp)
    {
        this._help = help;

        this._onRoomChatBound = this.onRoomChat.bind(this);

        // AS3 dereferences `roomSessionManager` with no null check: `HabboHelp` declares that
        // dependency as required, so initComponent() — which builds this handler — cannot run
        // before it resolves. `sessionEvents`, not `events`: IRoomSessionManager keeps the
        // session emitter under its own name (see the note on IRoomSessionManager).
        this._help.roomSessionManager!.sessionEvents.on('RSCE_CHAT_EVENT', this._onRoomChatBound);

        log.debug('ChatEventHandler initialized');
    }

    /**
	 * Whether this handler has been disposed
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatEventHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._help === null;
    }

    /**
	 * Store a room chat line in the CFH chat registry
	 *
	 * Skipped for anything that is not a real user, for blocked users, and for
	 * notification-style bubbles (server/system lines, which are not reportable).
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatEventHandler.as::onRoomChat()
    private onRoomChat(event: RoomSessionChatEvent): void
    {
        if(!this._help) return;

        const userData = this._help.roomSessionManager
            ?.getSession(event.session.roomId)
            ?.userDataManager.getUserDataByIndex(event.userId) ?? null;

        const guestRoomData = this._help.navigator?.enteredGuestRoomData ?? null;

        if(!userData || userData.type !== 1 || !guestRoomData) return;

        if(this._help.sessionDataManager?.isBlocked(userData.webID)) return;

        const roomName = guestRoomData.roomName;

        // AS3 reads `event.style`; this port names the same field `styleId`. AS3 also
        // dereferences the style unconditionally — here a missing style keeps the line
        // rather than dropping it, since only `isNotification` would have excluded it.
        const style = this._help.freeFlowChat?.chatStyleLibrary?.getStyle(event.styleId) as IChatStyleInternal | null;

        if(style?.isNotification) return;

        this._help.chatRegistry.addItem(
            event.session.roomId,
            roomName,
            userData.webID,
            userData.name,
            event.text
        );
    }

    /**
	 * Dispose of this handler
	 */
    // AS3: .../src/com/sulake/habbo/help/cfh/registry/chat/ChatEventHandler.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._help?.roomSessionManager?.sessionEvents.off('RSCE_CHAT_EVENT', this._onRoomChatBound);

        this._help = null;
    }
}
