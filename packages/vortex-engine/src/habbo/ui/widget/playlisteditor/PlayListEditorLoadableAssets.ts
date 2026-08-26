/**
 * PlayListEditorLoadableAssets
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/playlisteditor/_SafeCls_4090.as
 *
 * Unreferenced in every available AS3 tree — grepping the whole primary tree for `_SafeCls_4090`
 * turns up nothing but this file's own declaration. `MainWindowHandler` needs the exact same five
 * strings (for the "is this image already loaded" check in its constructor, and again in
 * `refreshLoadableAsset()`) but hardcodes them as an inline array rather than importing this
 * class — so this is ported as a pure, still-unreferenced constants holder, faithfully matching
 * AS3's own dead code rather than wiring it up on this port's own initiative.
 *
 * The class name is DERIVED — it exists in no tree at all, not even as an obfuscated identifier
 * with a readable member; `win63_version`'s copy (`class_3980.as`) is numbered, not named, and its
 * members are unobfuscated but the class itself has no source anywhere to recover from.
 */
export class PlayListEditorLoadableAssets
{
    // AS3: .../_SafeCls_4090.as::MY_MUSIC_TITLE_LOADABLE_ASSET
    static readonly MY_MUSIC_TITLE_LOADABLE_ASSET: string = 'title_mymusic';

    // AS3: .../_SafeCls_4090.as::PLAYLIST_TITLE_LOADABLE_ASSET
    static readonly PLAYLIST_TITLE_LOADABLE_ASSET: string = 'title_playlist';

    // AS3: .../_SafeCls_4090.as::PREVIEW_BACKGROUND_LOADABLE_ASSET
    static readonly PREVIEW_BACKGROUND_LOADABLE_ASSET: string = 'background_preview_playing';

    // AS3: .../_SafeCls_4090.as::GET_MORE_MUSIC_BACKGROUND_LOADABLE_ASSET
    static readonly GET_MORE_MUSIC_BACKGROUND_LOADABLE_ASSET: string = 'background_get_more_music';

    // AS3: .../_SafeCls_4090.as::ADD_SONGS_BACKGROUND_LOADABLE_ASSET
    static readonly ADD_SONGS_BACKGROUND_LOADABLE_ASSET: string = 'background_add_songs';
}
