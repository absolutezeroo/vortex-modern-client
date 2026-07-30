import type {ISearchView} from '../ISearchView';

/**
 * IAvatarSearchDeps
 *
 * The search tab's view, as `AvatarSearchResults` reaches it.
 *
 * The primary tree obfuscates this interface to `_SafeCls_2216` and no tree recovers
 * it. **The name `IAvatarSearchDeps` is derived**, from its sole implementor
 * `AvatarSearchDeps` (unobfuscated).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/_SafeCls_2216.as
 */
export interface IAvatarSearchDeps
{
    // AS3: .../domain/_SafeCls_2216.as::get view()
    readonly view: ISearchView;
}
