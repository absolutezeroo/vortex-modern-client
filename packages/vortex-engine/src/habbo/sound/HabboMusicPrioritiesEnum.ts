/**
 * Which music source wins when several want to play at once — the music controller keeps
 * one slot per priority and plays the highest occupied one.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/HabboMusicPrioritiesEnum.as
 */
export class HabboMusicPrioritiesEnum
{
    // AS3: .../sound/HabboMusicPrioritiesEnum.as::PRIORITY_ROOM_PLAYLIST
    static readonly PRIORITY_ROOM_PLAYLIST: number = 0;

    // AS3: .../sound/HabboMusicPrioritiesEnum.as::PRIORITY_USER_PLAYLIST
    static readonly PRIORITY_USER_PLAYLIST: number = 1;

    // AS3: .../sound/HabboMusicPrioritiesEnum.as::PRIORITY_SONG_PLAY
    static readonly PRIORITY_SONG_PLAY: number = 2;

    // AS3: .../sound/HabboMusicPrioritiesEnum.as::PRIORITY_PURCHASE_PREVIEW
    static readonly PRIORITY_PURCHASE_PREVIEW: number = 3;

    // AS3: .../sound/HabboMusicPrioritiesEnum.as::PRIORITY_COUNT
    static readonly PRIORITY_COUNT: number = 4;
}
