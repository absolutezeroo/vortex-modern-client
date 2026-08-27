/**
 * YoutubePlayerStateEnum
 *
 * The YouTube display's player-state codes, read off `showVideo()`'s `state` parameter (from
 * `YoutubeDisplayVideoMessageEventParser.state`) and off the embedded player's own state reports.
 *
 * `PLAYING`, `PAUSED`, `BUFFERING` and `CUED` are recovered verbatim — the primary tree leaves
 * those four identifiers unobfuscated. `UNSTARTED` and `ENDED` are **derived**: every tree
 * obfuscates them (`_SafeStr_11186` / `_SafeStr_11051` in the primary tree, `_Str_20501` /
 * `_Str_20135` in PRODUCTION's `YoutubeVideoPlaybackStateEnum.as`, still member-level obfuscated
 * there despite the class name being readable). The values `-1`/`0` alongside `1`/`2`/`3`/`5` are
 * exactly the YouTube IFrame Player API's own `onStateChange` codes
 * (`UNSTARTED`/`ENDED`/`PLAYING`/`PAUSED`/`BUFFERING`/`CUED`), which is what the two derived names
 * are taken from — not a guess at the AS3 identifier, which is unrecoverable.
 *
 * The class name itself is also derived: no tree gives this enum a readable class name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/video/_SafeCls_3218.as
 */
export class YoutubePlayerStateEnum
{
    // Name DERIVED — see class header.
    // AS3: .../video/_SafeCls_3218.as::_SafeStr_11186
    public static readonly UNSTARTED: number = -1;

    // Name DERIVED — see class header.
    // AS3: .../video/_SafeCls_3218.as::_SafeStr_11051
    public static readonly ENDED: number = 0;

    // AS3: .../video/_SafeCls_3218.as::PLAYING
    public static readonly PLAYING: number = 1;

    // AS3: .../video/_SafeCls_3218.as::PAUSED
    public static readonly PAUSED: number = 2;

    // AS3: .../video/_SafeCls_3218.as::BUFFERING
    public static readonly BUFFERING: number = 3;

    // AS3: .../video/_SafeCls_3218.as::CUED
    public static readonly CUED: number = 5;
}
