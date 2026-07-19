import {EventEmitter} from 'eventemitter3';
import {NineSliceSprite, type Container, type Rectangle, Texture} from 'pixi.js';
import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import type {IAssetLibrary} from '@core/assets';
import {Logger} from '@core/utils/Logger';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {AccountPreferencesEvent} from '@habbo/communication/messages/incoming/preferences/AccountPreferencesEvent';
import type {AccountPreferencesParser} from '@habbo/communication/messages/parser/preferences/AccountPreferencesParser';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IChatStyleLibrary} from '@habbo/freeflowchat/style/IChatStyleLibrary';
import type {IVector3d} from '@room/utils/IVector3d';
import type {IPoint} from '@room/utils/IRoomGeometry';
import type {IFreeFlowChatRoomSessionManager, IHabboFreeFlowChat, IRoomChatSettings} from './IHabboFreeFlowChat';
import {ChatEventHandler} from './data/ChatEventHandler';
import {RoomSessionEventHandler} from './data/RoomSessionEventHandler';
import {ChatHistoryBuffer} from './history/ChatHistoryBuffer';
import type {ChatItem} from './data/ChatItem';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {ManualNineSliceSprite} from './viewer/visualization/ManualNineSliceSprite';
import {ChatBubbleFactory} from './viewer/ChatBubbleFactory';
import {ChatFlowViewer} from './viewer/ChatFlowViewer';
import {ChatFlowStage} from './viewer/simulation/ChatFlowStage';
import {ChatViewController} from './ChatViewController';
import {ChatMarkup} from './viewer/enum/ChatMarkup';
import type {IChatStyleInternal} from './viewer/visualization/style/IChatStyleInternal';

/* eslint-disable @typescript-eslint/no-explicit-any */

const log = Logger.getLogger('HabboFreeFlowChat');

/**
 * Events emitted by HabboFreeFlowChat for the UI layer.
 */
export interface IHabboFreeFlowChatEvents
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::HabboFreeFlowChat()
    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);

        this.refreshEffectiveChatSettings();
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

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get avatarRenderManager()
    private _avatarRenderManager: IAvatarRenderManager | null = null;

    get avatarRenderManager(): IAvatarRenderManager | null
    {
        return this._avatarRenderManager;
    }

    private _chatBubbleFactory: ChatBubbleFactory | null = null;

    get chatStyleLibrary(): IChatStyleLibrary | null
    {
        return this._chatBubbleFactory?.chatStyleLibrary ?? null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get chatBubbleFactory()
    get chatBubbleFactory(): ChatBubbleFactory | null
    {
        return this._chatBubbleFactory;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get roomChatBorderLimited()
    get roomChatBorderLimited(): boolean
    {
        return this._roomChatSettings?.mode === 1;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::_chatMode
    private _chatMode: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::_chatBubbleWidth
    private _chatBubbleWidth: number = 1;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get/set chatScrollSpeed() (backing field, "_-51u")
    private _chatScrollSpeed: number = 1;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get roomChatSettings()
    // Built by refreshEffectiveChatSettings() from _chatMode/_chatBubbleWidth/_chatScrollSpeed,
    // which the constructor already calls once (matching AS3's own constructor) - so this is
    // never actually null in practice, same as AS3. onAccountPreferences() (below) is the only
    // thing that ever changes these three away from their built-in defaults (mode=0/free-flow,
    // bubbleWidth=1/normal, scrollSpeed=1/normal -> ChatFlowStage's 6000ms tier, not the
    // 10000ms "no settings at all" fallback ChatFlowStage.ts falls back to if this were null).
    private _roomChatSettings: IRoomChatSettings | null = null;

    get roomChatSettings(): IRoomChatSettings | null
    {
        return this._roomChatSettings;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::refreshEffectiveChatSettings()
    private refreshEffectiveChatSettings(): void
    {
        this._roomChatSettings = {
            mode: this._chatMode,
            bubbleWidth: this._chatBubbleWidth,
            scrollSpeed: this._chatScrollSpeed,
        };
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::sanitizeChatMode()
    private sanitizeChatMode(value: number): number
    {
        return value === 0 || value === 1 ? value : 0;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::sanitizeChatBubbleWidth()
    private sanitizeChatBubbleWidth(value: number): number
    {
        return value === 0 || value === 1 || value === 2 ? value : 1;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::sanitizeChatScrollSpeed()
    private sanitizeChatScrollSpeed(value: number): number
    {
        return value === 0 || value === 1 || value === 2 ? value : 1;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::clampChatFontSizeMode()
    private clampChatFontSizeMode(value: number): number
    {
        return value < 0 ? 0 : (value > 4 ? 4 : value);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::onAccountPreferences()
    // TODO(AS3): onRoomChatSettings()/onGuestRoomData() (the two other AS3 call sites that
    // also touch refreshEffectiveChatSettings()) aren't wired - both only ever update
    // floodSensitivity, a field this port's roomChatSettings doesn't expose yet (nothing
    // reads it - ChatFlowStage only needs mode/bubbleWidth/scrollSpeed, which only
    // onAccountPreferences ever changes). See IRoomChatSettings for the same note.
    private onAccountPreferences(event: IMessageEvent): void
    {
        if(!event) return;

        const parser = event.parser as AccountPreferencesParser;

        if(!parser) return;

        this._preferedChatStyle = parser.preferedChatStyle;
        this._chatFontSizeMode = this.clampChatFontSizeMode(parser.chatSizePreference);
        this._chatMode = this.sanitizeChatMode(parser.chatMode);
        this._chatBubbleWidth = this.sanitizeChatBubbleWidth(parser.chatBubbleWidth);
        this._chatScrollSpeed = this.sanitizeChatScrollSpeed(parser.chatScrollSpeed);

        this.refreshEffectiveChatSettings();

        if(this._isInRoom) this._chatFlowStage?.refreshSettings();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::_chatFontSizeMode
    private _chatFontSizeMode: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get chatFontSizeMode()
    get chatFontSizeMode(): number
    {
        return this._chatFontSizeMode;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::set chatFontSizeMode()
    // TODO(AS3): AS3 sends `new SetChatStylePreferenceComposer(preferedChatStyle,
    // chatFontSizeMode)` here to persist the choice server-side - that composer isn't
    // ported yet (2-arg form, evolved from the older single-styleId version - see
    // preferedChatStyle's setter below for the same gap). The in-memory value still drives
    // rendering (chatFontSizeScale), only server persistence is missing.
    set chatFontSizeMode(value: number)
    {
        this._chatFontSizeMode = this.clampChatFontSizeMode(value);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get chatFontSizeScale()
    get chatFontSizeScale(): number
    {
        switch(this._chatFontSizeMode - 1)
        {
            case 0: return 1.15;
            case 1: return 1.3;
            case 2: return 1.5;
            case 3: return 1.75;
            default: return 1;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::get displayObject()
    // Set by roomEntered() once the ChatViewController exists (see viewer/ChatViewController.ts).
    private _displayObject: Container | null = null;

    get displayObject(): Container | null
    {
        return this._displayObject;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::getScreenPointFromRoomLocation()
    // `geometry.getScreenPoint()` returns a point relative to the isometric
    // camera's own centre, not the canvas's top-left - AS3 recentres it onto
    // the Flash stage (stage.stageWidth/stageHeight / 2) before adding the
    // scaled raw point and the pan offset. An earlier version of this method
    // dropped that recentring term, reasoning that ChatFlowViewer.rootDisplayObject
    // shares the room's own coordinate space directly - wrong: it's mounted
    // into a window-system container (RoomDesktopLayoutManager.getChatContainer()),
    // a *separate* display tree from the room canvas, exactly like AS3's
    // "separate DisplayObject tree" case this method exists to handle. Confirmed
    // via live diagnostic: every bubble was landing at a large negative x/y
    // (e.g. x=-534 for a valid, on-screen avatar position) until this term was
    // restored. `stage.stageWidth/stageHeight` has no direct equivalent here
    // (this port has one PixiJS canvas, not per-room Flash sub-stages); using
    // window.innerWidth/innerHeight instead, matching the same stand-in
    // PooledChatBubble.ts already uses for AS3's stage.stageWidth elsewhere in
    // this same feature (the canvas is resized to the window by default - see
    // Vortex.ts's `resizeTo: config?.resizeTo ?? window`).
    getScreenPointFromRoomLocation(roomId: number, location: IVector3d): IPoint
    {
        const zero: IPoint = {x: 0, y: 0};

        if(!this._roomEngine) return zero;

        const geometry = this._roomEngine.getRoomCanvasGeometry(roomId);
        const canvasScale = this._roomEngine.getRoomCanvasScale(roomId);
        const stageWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
        const stageHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

        let x = (stageWidth * canvasScale) / 2;
        let y = (stageHeight * canvasScale) / 2;

        if(geometry)
        {
            const point = geometry.getScreenPoint(location);

            if(point)
            {
                x += point.x * canvasScale;
                y += point.y * canvasScale;

                const offset = this._roomEngine.getRoomCanvasScreenOffset(roomId);

                if(offset)
                {
                    x += offset.x;
                    y += offset.y;
                }
            }
        }

        return {x, y};
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::clickHasToPropagate()
    // TODO(AS3): always false — roomUI.mouseEventPositionHasContextMenu() isn't ported
    // (RoomUI has no context-menu hit-testing yet, and HabboFreeFlowChat has no roomUI
    // dependency wired in — see IHabboFreeFlowChat.ts's doc comment on this method).
    clickHasToPropagate(_event: unknown): boolean
    {
        return false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::selectAvatarWithChatItem()
    // TODO(AS3): no-op — AS3 delegates to roomEngine.selectAvatar(roomId, userId), which
    // isn't ported (same room-object-selection gap ChatInputWidgetHandler.ts's "@Name"
    // mention-autocomplete TODO already flags); moderation reporting and the
    // RWROM_GET_OBJECT_INFO widget message aren't ported either.
    selectAvatarWithChatItem(_item: ChatItem): void
    {
    }

    private _preferedChatStyle: number = 1;

    get preferedChatStyle(): number
    {
        return this._preferedChatStyle;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::set preferedChatStyle()
    // TODO(AS3): AS3 sends `new SetChatStylePreferenceComposer(preferedChatStyle,
    // chatFontSizeMode)` here — a 2-arg form combining both preferences in one message,
    // evolved from the older single-styleId composer (still what's referenced below in
    // the commented-out send). Neither the composer's real (2026) field layout nor its
    // older 1-arg version is ported yet; the per-message styleId sent with every chat
    // (RoomChatInputView's future selectedStyleId -> sendChat()) doesn't depend on this.
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
    private _chatEvents: EventEmitter<IHabboFreeFlowChatEvents> = new EventEmitter();

    /**
	 * Event emitter for the UI layer to listen to chat events.
	 * Named chatEvents to avoid conflicting with Component.events.
	 */
    get chatEvents(): EventEmitter<IHabboFreeFlowChatEvents>
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
            // AS3 (HabboFreeFlowChat.as:200) passes no required flag, so this defaults to required.
            // It has to be: initComponent() builds ChatEventHandler, whose constructor subscribes to
            // roomSessionManager's RSCE_CHAT_EVENT straight away. Optional here means initComponent()
            // can run before the manager lands, and the subscription is then never made at all.
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: any | null) =>
                {
                    // Cast to IFreeFlowChatRoomSessionManager to access sessionEvents
                    // (the correct EventEmitter for session lifecycle events, not Component.events)
                    this._roomSessionManager = manager as IFreeFlowChatRoomSessionManager | null;
                },
                true
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
            new ComponentDependency(
                IID_AvatarRenderManager,
                (manager: IAvatarRenderManager | null) =>
                {
                    this._avatarRenderManager = manager;
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

    private _chatFlowStage: ChatFlowStage | null = null;
    private _chatFlowViewer: ChatFlowViewer | null = null;
    private _chatViewController: ChatViewController | null = null;

    get chatFlowViewer(): ChatFlowViewer | null
    {
        return this._chatFlowViewer;
    }

    /**
	 * Called when a room session is created/entered.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::roomEntered()
	 * TODO(AS3): ChatHistoryScrollView/ChatHistoryTray (the drag-down history panel) are
	 * not built here — see ChatViewController.ts's header. displayObject/chatFlowViewer
	 * still work without them; the history toggle button stays a no-op.
	 */
    roomEntered(): void
    {
        this._isInRoom = true;

        if(this._isInitialized && this._chatBubbleFactory)
        {
            this._chatFlowStage = new ChatFlowStage(this);
            this._chatFlowViewer = new ChatFlowViewer(this, this._chatFlowStage);
            this._chatViewController = new ChatViewController(this._chatFlowViewer);

            const rootDisplayObject = this._chatViewController.rootDisplayObject;

            this._displayObject = rootDisplayObject;

            // TS-only, see RoomEngine.ts::addStageChild(). RoomUI.ts also calls
            // getChatContainer()?.setDisplayObject(this._displayObject) so
            // WindowComposite punches a transparent hole for it at the right
            // screen rect, but that alone never puts this container on the
            // actual PixiJS stage - it's only bookkeeping for the window
            // system's own (separately Canvas2D-composited) tree. Without this
            // call every bubble renders into a display object that's never
            // part of any rendered scene at all.
            if(rootDisplayObject) this._roomEngine?.addStageChild(rootDisplayObject);

            this._chatEvents.emit('roomEntered');

            log.debug('Room entered');
        }
    }

    /**
	 * Called when a room session has ended/left.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::roomLeft()
	 */
    roomLeft(): void
    {
        if(this._displayObject) this._roomEngine?.removeStageChild(this._displayObject);

        this._chatViewController?.dispose();
        this._chatViewController = null;

        this._chatFlowViewer?.dispose();
        this._chatFlowViewer = null;

        this._chatFlowStage?.dispose();
        this._chatFlowStage = null;

        this._displayObject = null;
        this._isInRoom = false;
        this._chatEvents.emit('roomLeft');
        log.debug('Room left');
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::fixHtml()
    // Escapes raw HTML if the style doesn't allow it, then applies ChatMarkup's
    // [tag]/@color@ shorthand - see ChatTextLayout.ts's parseInlineMarkup() for how the
    // resulting <b>/<i>/<u>/<font color> tags get turned into styled runs (no real HTML
    // text component in this port).
    private fixHtml(item: ChatItem, style: IChatStyleInternal): void
    {
        if(!style.allowHTML)
        {
            item.text = item.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            item.text = item.text.replace(/&#[0-9]+;/g, '');
            item.text = item.text.replace(/&#x[0-9]+;/g, '');
        }

        const color = style.textFormat?.color ?? 0;

        if(style.isNotification)
        {
            item.text = ChatMarkup.applyToElements(item.text, color);
        }

        item.text = ChatMarkup.applyColourToChat(item.text, color);
    }

    /**
	 * Insert a chat item into the chat system: adds it to the history buffer,
	 * builds a live PooledChatBubble for it, places it via the (currently
	 * minimal - see ChatFlowStage.ts) chat flow stage, and hands it to the
	 * viewer to display.
	 *
	 * AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/HabboFreeFlowChat.as::insertChat()
	 *
	 * @param item The chat item to insert
	 */
    insertChat(item: ChatItem): void
    {
        if(!this._isInitialized || !this._chatHistory || this._isDisabledInPreferences || !this._chatFlowStage || !this._chatFlowViewer || !this._chatBubbleFactory)
        {
            return;
        }

        const style = this._chatBubbleFactory.chatStyleLibrary?.getStyle(item.style);

        if(style) this.fixHtml(item, style);

        this._chatHistory.insertChat(item);
        this._chatEvents.emit('chatInserted', item);

        const bubble = this._chatBubbleFactory.getNewChatBubble(item);

        if(!bubble) return;

        const position = this._chatFlowStage.insertBubble(bubble);

        this._chatFlowViewer.insertBubble(bubble, position);
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

        this._communication?.addHabboConnectionMessageEvent(new AccountPreferencesEvent(this.onAccountPreferences.bind(this)));

        log.info('HabboFreeFlowChat initialized');

        // If we were already in a room when initialization completed, enter now
        if(this._isInRoom)
        {
            this.roomEntered();
        }
    }
}
