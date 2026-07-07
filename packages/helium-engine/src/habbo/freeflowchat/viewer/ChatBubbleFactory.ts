import {Logger} from '@core/utils/Logger';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import {RoomSessionChatEvent} from '@habbo/session/events/RoomSessionChatEvent';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IHabboFreeFlowChat} from '../IHabboFreeFlowChat';
import {ChatItem} from '../data/ChatItem';
import type {IChatHistoryEntry} from '../history/visualization/entry/IChatHistoryEntry';
import {ChatHistoryEntryBitmapBubble} from '../history/visualization/entry/ChatHistoryEntryBitmapBubble';
import {ChatHistoryRoomChangeEntry, type RoomChangeData} from '../history/visualization/entry/ChatHistoryRoomChangeEntry';
import {ChatStyleLibrary} from './visualization/style/ChatStyleLibrary';
import {ChatStyle} from './visualization/style/ChatStyle';
import {BlankStyle} from './visualization/style/BlankStyle';
import type {IChatStyleInternal} from './visualization/style/IChatStyleInternal';
import {PooledChatBubble} from './visualization/PooledChatBubble';

const log = Logger.getLogger('ChatBubbleFactory');

const MAX_DISPOSABLE_BITMAPS = 30;

/**
 * ChatBubbleFactory
 *
 * Builds and pools the visible chat bubble (PooledChatBubble) and the
 * chat-history row (IChatHistoryEntry) for a ChatItem, resolving the
 * speaker's face image (avatar/pet), name, and the "special" system
 * messages (respect, handitem, mutetime, ping, pet events...) along the way.
 *
 * TODO(AS3): `getUserImage()`/`getPetImage()` always return null — same gap
 * documented in @habbo/ui/handler/ChatWidgetHandler.ts: avatar head-crop
 * needs a Texture→ImageBitmap conversion utility and a ported
 * HabboFaceFocuser, and `IRoomEngine.getPetImage()`/`PetFigureData` don't
 * exist yet. `PooledChatBubble`/`ChatHistoryEntryBitmapBubble`/
 * `ChatHistoryRoomChangeEntry` are structural stubs (visual composition —
 * `ChatBubble.as`, 511 lines — isn't ported); this factory resolves all the
 * real data (style, face, name, special content) and hands it to them.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as
 */
export class ChatBubbleFactory implements IGetImageListener, IAvatarImageListener
{
    private _chatFlow: IHabboFreeFlowChat | null;
    private _chatStyleLibrary: ChatStyleLibrary | null = null;

    private readonly _avatarImageCache: Map<string, ImageBitmap> = new Map();
    private readonly _petImageCache: Map<string, ImageBitmap> = new Map();
    private readonly _avatarColorCache: Map<string, number> = new Map();
    private readonly _petImageIdToFigureString: Map<number, string> = new Map();
    private readonly _disposableBitmaps: ImageBitmap[] = [];
    private _pool: PooledChatBubble[] = [];

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::ChatBubbleFactory()
    constructor(chatFlow: IHabboFreeFlowChat)
    {
        this._chatFlow = chatFlow;

        if(chatFlow.assets)
        {
            this._chatStyleLibrary = new ChatStyleLibrary(chatFlow.assets);
        }
        else
        {
            log.warn('No asset library available - chat styles unavailable');
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this.discardOldBitmaps();
        this._pool = [];
        this._chatStyleLibrary?.dispose();
        this._chatStyleLibrary = null;
        this._chatFlow = null;
    }

    get disposed(): boolean
    {
        return this._chatFlow === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::getNewChatBubble()
    getNewChatBubble(item: ChatItem, _isOwnChat: boolean = false): PooledChatBubble | null
    {
        if(!this._chatFlow) return null;

        const userData = this._chatFlow.roomSessionManager?.getSession(item.roomId)?.userDataManager.getUserDataByIndex(item.userId) ?? null;

        let name = '';

        if(item.forcedFigure || item.forcedUserName)
        {
            name = item.forcedUserName ?? '';
        }
        else if(userData)
        {
            name = userData.name;
        }

        this.applySpecialChatContent(item, name);

        const style: IChatStyleInternal = this._chatStyleLibrary?.getStyle(item.style) ?? new BlankStyle();
        let face: ImageBitmap | null = style instanceof ChatStyle ? style.iconImage : null;
        let color = 0;

        if(item.forcedFigure || item.forcedUserName)
        {
            if(!face)
            {
                face = this.getUserImage(item.forcedFigure ?? '');
            }
        }
        else if(userData)
        {
            const figure = userData.figure;

            color = this._avatarColorCache.get(figure) ?? 0;

            if(!face)
            {
                switch(userData.type - 1)
                {
                    case 0:
                        face = this.getUserImage(figure);
                        break;
                    case 1:
                    {
                        const roomObject = this._chatFlow.roomEngine?.getRoomObject(item.roomId, userData.roomObjectId, 100) ?? null;
                        const posture = roomObject?.getModel().getString('figure_posture') ?? null;

                        face = this.getPetImage(figure, 2, true, 32, posture);
                        break;
                    }
                }
            }
        }

        let bubble = this._pool.pop();

        if(!bubble)
        {
            bubble = new PooledChatBubble(this._chatFlow);
        }

        // AS3 saves/restores style.textFormat.color around recreate() — ChatStyle
        // instances are shared across every bubble of that style, and PooledChatBubble
        // temporarily reassigns textFormat.color while rendering this one bubble.
        const savedColor = style.textFormat.color;

        bubble.chatItem = item;
        bubble.style = style;
        bubble.face = face;
        bubble.recreate(name, item.forcedColor ? (item.forcedColor >>> 0) : color, this._chatFlow.roomChatBorderLimited);

        style.textFormat.color = savedColor;

        return bubble;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::getNewEmptySpace()
    getNewEmptySpace(_chatType: number): PooledChatBubble | null
    {
        if(!this._chatFlow) return null;

        const style = new BlankStyle();
        // AS3 passes a null session here; ChatItem already guards `if(event.session)`.
        const event = new RoomSessionChatEvent(RoomSessionChatEvent.RSCE_CHAT_EVENT, null as unknown as IRoomSession, -1, '', 1, 0);
        const item = new ChatItem(event, performance.now());

        let bubble = this._pool.pop();

        if(!bubble)
        {
            bubble = new PooledChatBubble(this._chatFlow);
        }

        bubble.chatItem = item;
        bubble.style = style;
        bubble.face = null;
        bubble.recreate('', 0, false, 19);

        return bubble;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::getHistoryLineEntry()
    getHistoryLineEntry(item: ChatItem): IChatHistoryEntry | null
    {
        if(!this._chatFlow) return null;

        const userData = this._chatFlow.roomSessionManager?.getSession(item.roomId)?.userDataManager.getUserDataByIndex(item.userId) ?? null;

        let name = '';
        let webId = -1;
        let canIgnore = false;

        if(item.forcedFigure || item.forcedUserName)
        {
            name = item.forcedUserName ?? '';
        }
        else if(userData)
        {
            name = userData.name;
        }

        this.applySpecialChatContent(item, name);

        const style: IChatStyleInternal = this._chatStyleLibrary?.getStyle(item.style) ?? new BlankStyle();

        if(userData && !style.isNotification && userData.type === 1 && userData.webID > 0 && userData.webID !== this._chatFlow.sessionDataManager?.userId)
        {
            webId = userData.webID;
            canIgnore = true;
        }

        if(this.isSystemNotificationChat(item.chatType))
        {
            canIgnore = false;
        }

        // TODO(AS3): AS3 also resolves a `face` image here (identical to
        // getNewChatBubble()'s forcedFigure/avatar/pet switch above) and renders
        // `new ChatBubble(item, style, face, name, color, chatFlow, 1)`, then
        // rasterizes it via `drawToBitmap()` into the bitmap passed below.
        // ChatBubble.as (511 lines) isn't ported yet, so that resolution would be
        // dead work right now — restore it here once ChatBubble exists.
        return new ChatHistoryEntryBitmapBubble(item, canIgnore, webId, name, null, style.overlap);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::getHistoryRoomChangeEntry()
    getHistoryRoomChangeEntry(roomData: RoomChangeData | null): IChatHistoryEntry
    {
        return new ChatHistoryRoomChangeEntry(roomData, this._chatFlow);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::recycle()
    recycle(bubble: PooledChatBubble): void
    {
        this._pool.push(bubble);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::getUserImage()
    // TODO(AS3): avatar head-crop for chat bubbles isn't wired — same gap documented in
    // @habbo/ui/handler/ChatWidgetHandler.ts (IAvatarImage.getCroppedImage() returns a
    // PixiJS Texture, not ImageBitmap; there's no conversion utility, and HabboFaceFocuser isn't ported).
    getUserImage(_figureString: string): ImageBitmap | null
    {
        return null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::getPetImage()
    // TODO(AS3): same gap as ChatWidgetHandler's getPetImage() — IRoomEngine.getPetImage()
    // and PetFigureData aren't ported yet.
    private getPetImage(_figureString: string, _direction: number, _sitting: boolean, _size: number, _posture: string | null): ImageBitmap | null
    {
        return null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::imageReady()
    imageReady(id: number, data: ImageBitmap | null): void
    {
        const figureString = this._petImageIdToFigureString.get(id);

        if(figureString !== undefined)
        {
            this._petImageIdToFigureString.delete(id);
            this.petImageReady(figureString);

            if(data)
            {
                this._petImageCache.set(figureString, data);
            }
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::imageFailed()
    imageFailed(_id: number): void
    {
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::petImageReady()
    private petImageReady(figureString: string): void
    {
        const cached = this._petImageCache.get(figureString);

        if(cached)
        {
            this._petImageCache.delete(figureString);
            this._disposableBitmaps.push(cached);
        }

        if(this._disposableBitmaps.length > MAX_DISPOSABLE_BITMAPS)
        {
            this.discardOldBitmaps();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::avatarImageReady()
    avatarImageReady(figureString: string): void
    {
        const cached = this._avatarImageCache.get(figureString);

        if(cached)
        {
            this._avatarImageCache.delete(figureString);
            this._disposableBitmaps.push(cached);
        }

        if(this._disposableBitmaps.length > MAX_DISPOSABLE_BITMAPS)
        {
            this.discardOldBitmaps();
        }
    }

    get chatStyleLibrary(): ChatStyleLibrary | null
    {
        return this._chatStyleLibrary;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::discardOldBitmaps()
    // AS3 disposes every entry but never clears the array (only dispose() does) — kept as-is.
    private discardOldBitmaps(): void
    {
        for(const bitmap of this._disposableBitmaps)
        {
            bitmap?.close();
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::applySpecialChatContent()
    private applySpecialChatContent(item: ChatItem, name: string): void
    {
        if(item.chatType === 12)
        {
            switch(item.extraParam - 67)
            {
                case 0:
                    item.text = '<b>6666666...  77777777777777...</b>';
                    item.style = 1;
                    return;
            }
        }

        const localizations = this._chatFlow?.localizations;

        if(!localizations) return;

        if(item.chatType === 3)
        {
            item.text = localizations.getLocalizationWithParams('widgets.chatbubble.respect', '', 'username', name);
            return;
        }

        if(item.chatType === 4)
        {
            item.text = localizations.getLocalizationWithParams('widget.chatbubble.petrespect', '', 'petname', name);
            return;
        }

        if(item.chatType === 6)
        {
            item.text = localizations.getLocalizationWithParams('widget.chatbubble.pettreat', '', 'petname', name);
            return;
        }

        if(item.chatType === 11)
        {
            item.text = item.extraParam >= 0 ? `Ping: ${item.extraParam} ms` : 'Ping: measuring...';
            return;
        }

        if(item.chatType === 5)
        {
            const key = 'widget.chatbubble.handitem';
            const handItem = localizations.getLocalization(`handitem${item.extraParam}`, `handitem${item.extraParam}`);

            localizations.registerParameter(key, 'username', name);
            localizations.registerParameter(key, 'handitem', handItem);
            item.text = localizations.getLocalizationRaw(key)?.value ?? '';
            item.style = 1;
            return;
        }

        if(item.chatType === 10)
        {
            const key = 'widget.chatbubble.mutetime';
            const seconds = String(item.extraParam % 60);
            const minutes = String(item.extraParam > 0 ? Math.floor((item.extraParam % 3600) / 60) : 0);
            const hours = String(item.extraParam > 0 ? Math.floor(item.extraParam / 3600) : 0);

            localizations.registerParameter(key, 'hours', hours);
            localizations.registerParameter(key, 'minutes', minutes);
            localizations.registerParameter(key, 'seconds', seconds);
            item.text = localizations.getLocalizationRaw(key)?.value ?? '';
            item.style = 1;
            return;
        }

        if(item.chatType === 7 || item.chatType === 8 || item.chatType === 9)
        {
            let key = 'widget.chatbubble.petrevived';

            if(item.chatType === 8)
            {
                key = 'widget.chatbubble.petrefertilized';
            }
            else if(item.chatType === 9)
            {
                key = 'widget.chatbubble.petspeedfertilized';
            }

            localizations.registerParameter(key, 'petName', name);
            localizations.registerParameter(key, 'userName', this.resolveRoomUserName(item.roomId, item.extraParam));
            item.text = localizations.getLocalizationRaw(key)?.value ?? '';
            item.style = 1;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::isSystemNotificationChat()
    private isSystemNotificationChat(chatType: number): boolean
    {
        switch(chatType - 3)
        {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 9:
                return true;
            default:
                return false;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/ChatBubbleFactory.as::resolveRoomUserName()
    private resolveRoomUserName(roomId: number, objectId: number): string
    {
        const roomObject = this._chatFlow?.roomEngine?.getRoomObject(roomId, objectId, 100) ?? null;

        if(!roomObject) return '';

        const userData = this._chatFlow?.roomSessionManager?.getSession(roomId)?.userDataManager.getUserDataByIndex(roomObject.getId()) ?? null;

        return userData?.name ?? '';
    }
}
