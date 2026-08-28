/**
 * The five images the playlist editor loads by name. Class name DERIVED — obfuscated in every tree, named from its members.
 *
 * **Nothing in any source tree reads this class** — its values are written as literals wherever
 * they are needed, in AS3 and here alike. `MainWindowHandler` has all five as a bare array and
 * again in `assignWindowBitmapByAsset()` calls; this table records what they are called, and is not
 * something to refactor those into.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/_SafeCls_4090.as
 */
export const PlaylistEditorAssetEnum = {
    // AS3: _SafeCls_4090.as::MY_MUSIC_TITLE_LOADABLE_ASSET
    MY_MUSIC_TITLE_LOADABLE_ASSET: "title_mymusic",

    // AS3: _SafeCls_4090.as::PLAYLIST_TITLE_LOADABLE_ASSET
    PLAYLIST_TITLE_LOADABLE_ASSET: "title_playlist",

    // AS3: _SafeCls_4090.as::PREVIEW_BACKGROUND_LOADABLE_ASSET
    PREVIEW_BACKGROUND_LOADABLE_ASSET: "background_preview_playing",

    // AS3: _SafeCls_4090.as::GET_MORE_MUSIC_BACKGROUND_LOADABLE_ASSET
    GET_MORE_MUSIC_BACKGROUND_LOADABLE_ASSET: "background_get_more_music",

    // AS3: _SafeCls_4090.as::ADD_SONGS_BACKGROUND_LOADABLE_ASSET
    ADD_SONGS_BACKGROUND_LOADABLE_ASSET: "background_add_songs",
} as const;

export type PlaylistEditorAssetEnum = typeof PlaylistEditorAssetEnum[keyof typeof PlaylistEditorAssetEnum];
