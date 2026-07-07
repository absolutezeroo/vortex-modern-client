import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IChatStyleLibrary} from '@habbo/freeflowchat/style/IChatStyleLibrary';
import type {ChatItem} from './data/ChatItem';

/**
 * Minimal shape for the room session manager as needed by the FreeFlowChat handlers.
 * Includes sessionEvents (the correct EventEmitter for session lifecycle events)
 * rather than the Component-inherited events getter, plus getSession() for
 * resolving a room's IUserData (ChatBubbleFactory's user/pet name & figure lookups).
 *
 * @see IRoomSessionManager in @habbo/session/IRoomSessionManager
 * @see IRoomHandlerListener in @habbo/session/IRoomHandlerListener
 */
export interface IFreeFlowChatRoomSessionManager
{
    readonly sessionEvents: EventEmitter;

    getSession(roomId: number): IRoomSession | null;
}

/**
 * Interface for the HabboFreeFlowChat component.
 *
 * Provides methods for chat management, room lifecycle, visibility control,
 * and user preference management for the free-flow chat system.
 *
 * @see source_as_win63/habbo/freeflowchat/class_1809.as
 */
export interface IHabboFreeFlowChat
{
    /**
	 * Whether free flow chat is disabled in user preferences
	 */
    isDisabledInPreferences: boolean;

    /**
	 * The user's preferred chat style ID
	 */
    preferedChatStyle: number;

    /**
	 * Reference to the room session manager (used by handlers).
	 * Uses IFreeFlowChatRoomSessionManager to access sessionEvents
	 * (the correct EventEmitter, not the Component.events getter).
	 */
    readonly roomSessionManager: IFreeFlowChatRoomSessionManager | null;

    /**
	 * Reference to the session data manager
	 */
    readonly sessionDataManager: ISessionDataManager | null;

    /**
	 * Asset library used to load chat style catalog/bitmap assets.
	 * Exposed by the Component base class the concrete HabboFreeFlowChat extends.
	 */
    readonly assets: IAssetLibrary | null;

    /**
	 * Room engine, used to resolve room objects for pet figures / room-user names.
	 */
    readonly roomEngine: IRoomEngine | null;

    /**
	 * Localization manager, used by ChatBubbleFactory to build the special
	 * system chat messages (respect, handitem, mutetime, ping, pet events...).
	 */
    readonly localizations: IHabboLocalizationManager | null;

    /**
	 * Whether the room chat text field should be width-limited/bordered.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get roomChatBorderLimited()
	 * TODO(AS3): AS3 derives this from `roomChatSettings.mode === 1` (an
	 * unported user-preference struct) — always false until that lands.
	 */
    readonly roomChatBorderLimited: boolean;

    /**
	 * The chat bubble style catalog, once the internal ChatBubbleFactory has built it.
	 */
    readonly chatStyleLibrary: IChatStyleLibrary | null;

    /**
	 * Clear the current chat flow stage
	 */
    clear(): void;

    /**
	 * Toggle the chat history visibility
	 */
    toggleVisibility(): void;

    /**
	 * Insert a chat item into the chat system.
	 * Adds to history buffer and (in VIEW layer) creates the visual bubble.
	 *
	 * @param item The chat item to insert
	 */
    insertChat(item: ChatItem): void;

    /**
	 * Called when a room session has been created/entered
	 */
    roomEntered(): void;

    /**
	 * Called when a room session has ended/left
	 */
    roomLeft(): void;
}
