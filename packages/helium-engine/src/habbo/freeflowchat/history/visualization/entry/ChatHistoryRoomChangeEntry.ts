import {Rectangle} from 'pixi.js';
import type {IChatHistoryEntry} from './IChatHistoryEntry';

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
 * TODO(AS3): AS3 renders the room name + a "HH:MM:SS" timestamp as
 * `TextField`s composited onto `HabboFreeFlowChat.getRoomChangeBitmap()`
 * (a background asset) into one final `BitmapData`. Neither
 * `getRoomChangeBitmap()` nor the `_SafeCls_2520.TEXT_FORMAT*` text formats
 * are ported yet, so `bitmap` returns null here instead of a composited image.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as
 */
export class ChatHistoryRoomChangeEntry implements IChatHistoryEntry
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/history/visualization/entry/ChatHistoryRoomChangeEntry.as::ChatHistoryRoomChangeEntry()
    // TODO(AS3): see class header — bitmap compositing not ported, `roomData`/`chatFlow` unused for now.
    constructor(_roomData: IRoomChangeData | null, _chatFlow: unknown)
    {
    }

    get bitmap(): ImageBitmap | null
    {
        return null;
    }

    get overlap(): Rectangle
    {
        return new Rectangle(0, 0, 0, 0);
    }

    get userIndex(): number
    {
        return -1;
    }

    get webId(): number
    {
        return -1;
    }

    get roomId(): number
    {
        return -1;
    }

    get canIgnore(): boolean
    {
        return false;
    }

    get userName(): string
    {
        return '';
    }
}
