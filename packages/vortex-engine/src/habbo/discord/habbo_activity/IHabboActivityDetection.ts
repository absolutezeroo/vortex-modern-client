import type {HabboActivityState} from './HabboActivityState';

/**
 * What `HabboDiscordManager` asks the activity detector for when it builds a presence payload.
 *
 * The interface is `_SafeCls_1964` in the primary tree — no other tree carries the Discord package,
 * so this name is **derived** from its sole implementor, `HabboActivityDetection`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/discord/habbo_activity/_SafeCls_1964.as
 */
export interface IHabboActivityDetection
{
    // AS3: .../habbo_activity/_SafeCls_1964.as::isInRoom()
    isInRoom(): boolean;

    // AS3: .../habbo_activity/_SafeCls_1964.as::isInHiddenRoom()
    isInHiddenRoom(): boolean;

    // AS3: .../habbo_activity/_SafeCls_1964.as::get roomId()
    readonly roomId: number;

    // AS3: .../habbo_activity/_SafeCls_1964.as::getCurrentRoomActivity()
    getCurrentRoomActivity(): HabboActivityState | null;

    // AS3: .../habbo_activity/_SafeCls_1964.as::getCurrentRoomName()
    getCurrentRoomName(): string | null;
}
