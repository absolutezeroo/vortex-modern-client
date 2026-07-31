/**
 * ISearchView
 *
 * The search tab as `AvatarSearchResults` sees it — refresh when results land, and
 * the two entry points the manager uses to open the tab on a pre-filled query.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/ISearchView.as
 */
export interface ISearchView
{
    // AS3: .../ISearchView.as::refreshList()
    refreshList(): void;

    // AS3: .../ISearchView.as::setSearchStr()
    setSearchStr(searchStr: string): void;

    // AS3: .../ISearchView.as::focus()
    focus(): void;
}
