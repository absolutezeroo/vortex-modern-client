import {Rectangle} from 'pixi.js';
import type {IChatHistoryEntry} from './IChatHistoryEntry';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import {ChatHistoryVisualizationEnum} from '../enum/ChatHistoryVisualizationEnum';
import {HabboFreeFlowChat} from '@habbo/freeflowchat/HabboFreeFlowChat';

/**
 * IRoomChangeData
 *
 * The AS3 parameter type here (imported as `_SafePkg_2008._SafeCls_2172` in
 * the primary source, `package_11.class_1569` in win63_version) is an
 * obfuscated identifier that doesn't resolve to a readable name in any of
 * the three source trees — `_SafeCls_2172`'s own file lives under
 * `src/unknowns/_SafePkg_2008/`, which CLAUDE.md documents as an unrelated,
 * fully-obfuscated bundle not part of the Habbo client, so it can't be
 * cross-referenced either. Only its `roomName` field is actually read by
 * ChatHistoryRoomChangeEntry, so that's all this local shape carries.
 */
export interface IRoomChangeData
{
    roomName: string | null;
}

/**
 * ChatHistoryRoomChangeEntry
 *
 * The separator drawn where the history crosses from one room into the next: a timestamp in the
 * same 62px column every other row uses, the `room_change` artwork behind it, and the room's name
 * on top.
 *
 * The row is always MAX_ENTRY_WIDTH wide, unlike a bubble row, which is as wide as its bubble.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as
 */
export class ChatHistoryRoomChangeEntry implements IChatHistoryEntry
{
    // AS3: .../ChatHistoryRoomChangeEntry.as::TOP_MARGIN_HEIGHT
    private static readonly TOP_MARGIN_HEIGHT: number = 4;

    // AS3: .../ChatHistoryRoomChangeEntry.as::_bitmap
    private readonly _bitmap: ImageBitmap | null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::ChatHistoryRoomChangeEntry()
    constructor(roomData: IRoomChangeData | null, chatFlow: IHabboFreeFlowChat | null)
    {
        this._bitmap = ChatHistoryRoomChangeEntry.compose(roomData?.roomName ?? '', chatFlow);
    }

    /**
     * The row's height follows the room name's, so a name that wraps to two lines would grow it —
     * it never does, because nothing wraps here, but the arithmetic is AS3's and is left alone.
     *
     * The name is indented a further 20px past the timestamp column so it clears the artwork's
     * left edge.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::ChatHistoryRoomChangeEntry()
    private static compose(roomName: string, chatFlow: IHabboFreeFlowChat | null): ImageBitmap | null
    {
        const top = ChatHistoryRoomChangeEntry.TOP_MARGIN_HEIGHT;
        const nameFormat = ChatHistoryVisualizationEnum.TEXT_FORMAT;
        // AS3 reads `TextField.textHeight`, which for one line is the format's own size plus the
        // field's 2px gutters.
        const nameHeight = nameFormat.size + 4;
        const height = nameHeight + 5 + ChatHistoryVisualizationEnum.ROOM_CHANGE_ROW_PADDING + top;
        const canvas = new OffscreenCanvas(ChatHistoryVisualizationEnum.MAX_ENTRY_WIDTH, height);
        const ctx = canvas.getContext('2d');

        if(ctx === null) return null;

        const background = chatFlow?.getRoomChangeBitmap() ?? null;

        if(background !== null) ctx.drawImage(background, ChatHistoryVisualizationEnum.TIMESTAMP_FIXED_WIDTH, 1 + top);

        ChatHistoryVisualizationEnum.drawText(
            ctx,
            HabboFreeFlowChat.getTimeStampNow(),
            ChatHistoryVisualizationEnum.TEXT_FORMAT_TIMESTAMP,
            0,
            top
        );
        ChatHistoryVisualizationEnum.drawText(
            ctx,
            roomName,
            nameFormat,
            ChatHistoryVisualizationEnum.TIMESTAMP_FIXED_WIDTH + 20,
            top
        );

        return canvas.transferToImageBitmap();
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::get bitmap()
    get bitmap(): ImageBitmap | null
    {
        return this._bitmap;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::get overlap()
    get overlap(): Rectangle
    {
        return new Rectangle(0, 0, 0, 0);
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::get userIndex()
    get userIndex(): number
    {
        return -1;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::get webId()
    get webId(): number
    {
        return -1;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::get roomId()
    get roomId(): number
    {
        return -1;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::get canIgnore()
    get canIgnore(): boolean
    {
        return false;
    }

    // AS3: .../src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::get userName()
    get userName(): string
    {
        return '';
    }
}
