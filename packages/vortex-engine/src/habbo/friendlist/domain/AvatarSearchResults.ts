import type {HabboSearchResultData} from '@habbo/communication/messages/parser/friendlist/HabboSearchResultData';
import type {IAvatarSearchDeps} from './IAvatarSearchDeps';

/**
 * AvatarSearchResults
 *
 * The last search's two result buckets — people already on the friend list, and
 * everyone else — plus a memo of which of them a request has been sent to, so the row
 * can grey its button out without waiting for the list to update.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/AvatarSearchResults.as
 */
export class AvatarSearchResults
{
    // AS3: .../domain/AvatarSearchResults.as::AvatarSearchResults()
    constructor(deps: IAvatarSearchDeps)
    {
        this._deps = deps;
    }

    // AS3: .../domain/AvatarSearchResults.as::_SafeStr_5299
    private _deps: IAvatarSearchDeps;

    // AS3: .../domain/AvatarSearchResults.as::_SafeStr_5023
    private _friends: HabboSearchResultData[] | null = null;

    // AS3: .../domain/AvatarSearchResults.as::get friends()
    get friends(): HabboSearchResultData[] | null
    {
        return this._friends;
    }

    // AS3: .../domain/AvatarSearchResults.as::_others
    private _others: HabboSearchResultData[] | null = null;

    // AS3: .../domain/AvatarSearchResults.as::get others()
    get others(): HabboSearchResultData[] | null
    {
        return this._others;
    }

    // AS3: .../domain/AvatarSearchResults.as::_SafeStr_8584
    private _requestsSent: Set<number> = new Set<number>();

    // AS3: .../domain/AvatarSearchResults.as::getResult()
    getResult(avatarId: number): HabboSearchResultData | null
    {
        for(const result of this._friends ?? [])
        {
            if(result.avatarId === avatarId)
            {
                return result;
            }
        }

        for(const result of this._others ?? [])
        {
            if(result.avatarId === avatarId)
            {
                return result;
            }
        }

        return null;
    }

    // AS3: .../domain/AvatarSearchResults.as::searchReceived()
    searchReceived(friends: HabboSearchResultData[], others: HabboSearchResultData[]): void
    {
        this._friends = friends;
        this._others = others;
        this._deps.view.refreshList();
    }

    /**
     * AS3 stores the string "yes" in a Dictionary and tests it for non-null; a Set of
     * ids says the same thing.
     */
    // AS3: .../domain/AvatarSearchResults.as::setFriendRequestSent()
    setFriendRequestSent(avatarId: number): void
    {
        this._requestsSent.add(avatarId);
    }

    // AS3: .../domain/AvatarSearchResults.as::isFriendRequestSent()
    isFriendRequestSent(avatarId: number): boolean
    {
        return this._requestsSent.has(avatarId);
    }
}
