import type {Container} from 'pixi.js';
import type {EventEmitter} from 'eventemitter3';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IChatStyleLibrary} from '@habbo/freeflowchat/style/IChatStyleLibrary';
import type {IVector3d} from '@room/utils/IVector3d';
import type {IPoint} from '@room/utils/IRoomGeometry';
import type {IUpdateReceiver} from '@core/runtime';
import type {ChatItem} from './data/ChatItem';
import type {ChatBubbleFactory} from './viewer/ChatBubbleFactory';
import type {ChatFlowViewer} from './viewer/ChatFlowViewer';

/**
 * Mirrors AS3's roomChatSettings struct (a server-synced preference bundle:
 * bubble display mode, width, scroll speed). Not ported from a real incoming
 * message parser yet - defaults to null (AS3-faithful: every reader already
 * null-checks it) until that preferences message lands.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get roomChatSettings()
 */
export interface IRoomChatSettings
{
    readonly mode: number;
    readonly bubbleWidth: number;
    readonly scrollSpeed: number;
}

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
	 */
    readonly roomChatBorderLimited: boolean;

    /**
	 * The chat bubble style catalog, once the internal ChatBubbleFactory has built it.
	 */
    readonly chatStyleLibrary: IChatStyleLibrary | null;

    /**
	 * The bubble/history-entry factory (also owns the recycle pool consumed by
	 * ChatFlowViewer once a bubble is flagged readyToRecycle).
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get chatBubbleFactory()
	 */
    readonly chatBubbleFactory: ChatBubbleFactory | null;

    /**
	 * The live bubble display-list owner - null until roomEntered() builds it.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get chatFlowViewer()
	 */
    readonly chatFlowViewer: ChatFlowViewer | null;

    /**
	 * The server-synced chat display preferences (bubble mode/width/scroll speed).
	 * Null until a real preferences message populates it - see IRoomChatSettings.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get roomChatSettings()
	 */
    readonly roomChatSettings: IRoomChatSettings | null;

    /**
	 * The user's font-size preference for chat bubbles (0-4, S/M/L/XL/XXL).
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get/set chatFontSizeMode()
	 */
    chatFontSizeMode: number;

    /**
	 * The text-scale multiplier for chatFontSizeMode's current value.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get chatFontSizeScale()
	 */
    readonly chatFontSizeScale: number;

    /**
	 * The root display object every chat bubble/history element is mounted
	 * into - RoomUI mounts this into the room's "room_new_chat" layout slot.
	 * Null until roomEntered() has built the ChatViewController.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get displayObject()
	 */
    readonly displayObject: Container | null;

    /**
	 * Converts a room-space location to absolute stage/screen coordinates -
	 * how a chat bubble's pointer tracks its speaker's on-screen position.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::getScreenPointFromRoomLocation()
	 */
    getScreenPointFromRoomLocation(roomId: number, location: IVector3d): IPoint;

    /**
	 * Whether a click on a chat bubble should propagate to a context menu
	 * instead of selecting the speaker's avatar.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::clickHasToPropagate()
	 * TODO(AS3): always returns false - roomUI.mouseEventPositionHasContextMenu()
	 * isn't ported (RoomUI has no context-menu hit-testing yet).
	 */
    clickHasToPropagate(event: unknown): boolean;

    /**
	 * Selects the avatar that sent a chat item (bubble click handler).
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::selectAvatarWithChatItem()
	 * TODO(AS3): only calls roomEngine.selectAvatar() - the moderation
	 * (userSelected webID/name reporting) and RWROM_GET_OBJECT_INFO widget
	 * message AS3 also sends aren't ported (roomUI/moderation not wired in).
	 */
    selectAvatarWithChatItem(item: ChatItem): void;

    /**
	 * Per-frame tick registration (Component's own, inherited in AS3 via the
	 * same `_SafeCls_47`/IUpdateOwner-equivalent interface HabboFreeFlowChat
	 * implements there) - ChatFlowViewer/ChatFlowStage register themselves
	 * through the chatFlow reference they're constructed with rather than
	 * needing their own direct Component/context access.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/core/runtime/_SafeCls_47.as (IUpdateOwner-equivalent)
	 */
    registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void;

    removeUpdateReceiver(receiver: IUpdateReceiver): void;

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
