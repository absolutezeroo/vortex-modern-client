import {EventEmitter} from 'eventemitter3';
import {NineSliceSprite, type Container, type Rectangle, Texture} from 'pixi.js';
import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import type {IAssetLibrary} from '@core/assets';
import {Logger} from '@core/utils/Logger';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IChatStyleLibrary} from '@habbo/freeflowchat/style/IChatStyleLibrary';
import type {IFreeFlowChatRoomSessionManager, IHabboFreeFlowChat} from './IHabboFreeFlowChat';
import {ChatEventHandler} from './data/ChatEventHandler';
import {RoomSessionEventHandler} from './data/RoomSessionEventHandler';
import {ChatHistoryBuffer} from './history/ChatHistoryBuffer';
import type {ChatItem} from './data/ChatItem';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {ManualNineSliceSprite} from './viewer/visualization/ManualNineSliceSprite';
import {ChatBubbleFactory} from './viewer/ChatBubbleFactory';

/* eslint-disable @typescript-eslint/no-explicit-any */

const log = Logger.getLogger('HabboFreeFlowChat');

/**
 * Events emitted by HabboFreeFlowChat for the UI layer.
 */
export interface HabboFreeFlowChatEvents
{
    'chatInserted': (item: ChatItem) => void;
    'roomEntered': () => void;
    'roomLeft': () => void;
    'cleared': () => void;
    'visibilityToggled': () => void;
}

/**
 * Main free flow chat component. Extends Component and implements IHabboFreeFlowChat.
 *
 * Manages the chat history buffer, event handlers for room chat and session lifecycle,
 * and user chat preferences. The VIEW layer (SolidJS) listens to the chatEvents emitter
 * for reactive UI updates.
 *
 * Dependencies:
 * - IHabboCommunicationManager (required)
 * - ISessionDataManager (optional)
 * - IRoomSessionManager (optional - accessed as IFreeFlowChatRoomSessionManager for sessionEvents)
 *
 * @see source_as_win63/habbo/freeflowchat/HabboFreeFlowChat.as
 */
export class HabboFreeFlowChat extends Component implements IHabboFreeFlowChat
{
    private _communication: IHabboCommunicationManager | null = null;
    private _chatEventHandler: ChatEventHandler | null = null;
    private _roomSessionEventHandler: RoomSessionEventHandler | null = null;
    private _isInRoom: boolean = false;
    private _isInitialized: boolean = false;

    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    private _sessionDataManager: ISessionDataManager | null = null;

    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    private _roomSessionManager: IFreeFlowChatRoomSessionManager | null = null;

    get roomSessionManager(): IFreeFlowChatRoomSessionManager | null
    {
        return this._roomSessionManager;
    }

    private _chatHistory: ChatHistoryBuffer | null = null;

    get chatHistory(): ChatHistoryBuffer | null
    {
        return this._chatHistory;
    }

    private _roomEngine: IRoomEngine | null = null;

    get roomEngine(): IRoomEngine | null
    {
        return this._roomEngine;
    }

    private _localizations: IHabboLocalizationManager | null = null;

    get localizations(): IHabboLocalizationManager | null
    {
        return this._localizations;
    }

    private _chatBubbleFactory: ChatBubbleFactory | null = null;

    get chatStyleLibrary(): IChatStyleLibrary | null
    {
        return this._chatBubbleFactory?.chatStyleLibrary ?? null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get roomChatBorderLimited()
    // TODO(AS3): AS3 derives this from `roomChatSettings.mode === 1` (an unported
    // user-preference struct) — always false until that lands.
    get roomChatBorderLimited(): boolean
    {
        return false;
    }

    private _preferedChatStyle: number = 1;

    get preferedChatStyle(): number
    {
        return this._preferedChatStyle;
    }

    set preferedChatStyle(value: number)
    {
        this._preferedChatStyle = value;

        // TODO: Send SetChatStylePreferenceComposer when composer is implemented
        // if (this._communication?.connection)
        // {
        //     this._communication.connection.send(new SetChatStylePreferenceComposer(value));
        // }
    }

    private _isDisabledInPreferences: boolean = false;

    get isDisabledInPreferences(): boolean
    {
        return this._isDisabledInPreferences;
    }

    set isDisabledInPreferences(value: boolean)
    {
        this._isDisabledInPreferences = value;

        // TODO: Send SetChatPreferencesMessageComposer when composer is implemented
        // if (this._communication?.connection)
        // {
        //     this._communication.connection.send(new SetChatPreferencesMessageComposer(value));
        // }
    }

    /**
	 * Event emitter for UI bridge. Uses a separate emitter name (_chatEvents)
	 * to avoid conflicting with the Component base class's _events / events getter.
	 *
	 * @see MEMORY.md - NEVER override the events getter in Component subclasses
	 */
    private _chatEvents: EventEmitter<HabboFreeFlowChatEvents> = new EventEmitter();

    /**
	 * Event emitter for the UI layer to listen to chat events.
	 * Named chatEvents to avoid conflicting with Component.events.
	 */
    get chatEvents(): EventEmitter<HabboFreeFlowChatEvents>
    {
        return this._chatEvents;
    }

    /**
	 * Component dependencies.
	 */
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communication = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) =>
                {
                    this._sessionDataManager = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: any | null) =>
                {
                    // Cast to IFreeFlowChatRoomSessionManager to access sessionEvents
                    // (the correct EventEmitter for session lifecycle events, not Component.events)
                    this._roomSessionManager = manager as IFreeFlowChatRoomSessionManager | null;
                },
                false
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (manager: IRoomEngine | null) =>
                {
                    this._roomEngine = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizations = manager;
                },
                false
            ),
        ];
    }

    /**
	 * Get a formatted timestamp string for the current time.
	 *
	 * @returns A string in HH:MM:SS format
	 */
    static getTimeStampNow(): string
    {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const hStr = hours < 10 ? '0' + hours : hours.toString();
        const mStr = minutes < 10 ? '0' + minutes : minutes.toString();
        const sStr = seconds < 10 ? '0' + seconds : seconds.toString();

        return hStr + ':' + mStr + ':' + sStr;
    }

    /**
	 * Builds a resizable nine-slice display object from a background bitmap and
	 * its scale9 grid — the "live" variant (AS3 built this via a real Flash
	 * `Sprite.scale9Grid`, which PixiJS's own `NineSliceSprite` reproduces
	 * natively on the GPU without needing a per-resize CPU bake).
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::create9SliceSprite()
	 */
    static createNineSliceSprite(scale9Grid: Rectangle, background: ImageBitmap): Container
    {
        return new NineSliceSprite({
            texture: Texture.from(background),
            leftWidth: scale9Grid.x,
            topHeight: scale9Grid.y,
            rightWidth: background.width - scale9Grid.right,
            bottomHeight: background.height - scale9Grid.bottom,
            width: background.width,
            height: background.height,
        });
    }

    /**
	 * AS3's "pixel perfect" variant delegated to `ManualNineSliceSprite`, which
	 * manually re-composited BitmapData patches into a single bitmap on every
	 * resize instead of relying on Flash's live `scale9Grid` — a CPU-side
	 * optimization for a renderer that had to recompute it on the fly.
	 * PixiJS's `NineSliceSprite` above already renders both variants
	 * identically on the GPU, but `ManualNineSliceSprite` is ported as-is for
	 * fidelity in case a caller depends on its baked-bitmap semantics.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::createPixelPerfect9SliceSprite()
	 */
    static createPixelPerfectNineSliceSprite(scale9Grid: Rectangle, background: ImageBitmap): Container
    {
        return new ManualNineSliceSprite(scale9Grid, background);
    }

    /**
	 * Called when a room session is created/entered.
	 * Sets the in-room flag and emits a roomEntered event for the UI.
	 */
    roomEntered(): void
    {
        this._isInRoom = true;

        if(this._isInitialized)
        {
            this._chatEvents.emit('roomEntered');

            log.debug('Room entered');
        }
    }

    /**
	 * Called when a room session has ended/left.
	 * Clears the in-room flag and emits a roomLeft event for the UI.
	 */
    roomLeft(): void
    {
        this._isInRoom = false;
        this._chatEvents.emit('roomLeft');
        log.debug('Room left');
    }

    /**
	 * Insert a chat item into the chat system.
	 * Adds to the history buffer and emits a chatInserted event for the UI layer.
	 *
	 * @param item The chat item to insert
	 */
    insertChat(item: ChatItem): void
    {
        if(!this._isInitialized || !this._chatHistory || this._isDisabledInPreferences)
        {
            return;
        }

        this._chatHistory.insertChat(item);
        this._chatEvents.emit('chatInserted', item);
    }

    /**
	 * Clear the current chat flow.
	 */
    clear(): void
    {
        this._chatEvents.emit('cleared');
    }

    /**
	 * Toggle the chat history visibility.
	 */
    toggleVisibility(): void
    {
        if(this._isDisabledInPreferences || !this._isInitialized)
        {
            return;
        }

        this._chatEvents.emit('visibilityToggled');
    }

    /**
	 * Dispose of the component, all handlers, and the chat history.
	 */
    override dispose(): void
    {
        if(this.disposed) return;

        if(this._chatEventHandler)
        {
            this._chatEventHandler.dispose();
            this._chatEventHandler = null;
        }

        if(this._roomSessionEventHandler)
        {
            this._roomSessionEventHandler.dispose();
            this._roomSessionEventHandler = null;
        }

        if(this._chatHistory)
        {
            this._chatHistory.dispose();
            this._chatHistory = null;
        }

        if(this._chatBubbleFactory)
        {
            this._chatBubbleFactory.dispose();
            this._chatBubbleFactory = null;
        }

        this._chatEvents.removeAllListeners();

        this._communication = null;
        this._sessionDataManager = null;
        this._roomSessionManager = null;
        this._roomEngine = null;
        this._localizations = null;
        this._isInitialized = false;

        super.dispose();
    }

    /**
	 * Called when all required dependencies have been injected.
	 * Creates the chat event handler and room session event handler.
	 *
	 * In the AS3 version, initialization is deferred until onPerkAllowances fires.
	 * Here, we initialize immediately when dependencies resolve, since the perk
	 * system can be checked later.
	 */
    protected override initComponent(): void
    {
        this._chatHistory = new ChatHistoryBuffer();
        this._chatEventHandler = new ChatEventHandler(this);
        this._roomSessionEventHandler = new RoomSessionEventHandler(this);
        this._chatBubbleFactory = new ChatBubbleFactory(this);
        this._isInitialized = true;

        log.info('HabboFreeFlowChat initialized');

        // If we were already in a room when initialization completed, enter now
        if(this._isInRoom)
        {
            this.roomEntered();
        }
    }
}
