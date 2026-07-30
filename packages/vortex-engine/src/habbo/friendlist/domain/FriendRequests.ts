import {Logger} from '@core/utils/Logger';
import {Util} from '../Util';
import {FriendRequest} from './FriendRequest';
import type {IFriendRequestsDeps} from './IFriendRequestsDeps';

const logger = Logger.getLogger('habbo.friendlist.FriendRequests');

/**
 * FriendRequests
 *
 * The pending-request list and the two limits the server imposes on it (the plain one
 * and the club one — the view picks which to show against the count).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendRequests.as
 */
export class FriendRequests
{
    // AS3: .../domain/FriendRequests.as::FriendRequests()
    constructor(deps: IFriendRequestsDeps, limit: number, clubLimit: number)
    {
        this._deps = deps;
        this._limit = limit;
        this._clubLimit = clubLimit;
    }

    // AS3: .../domain/FriendRequests.as::_SafeStr_5299
    private _deps: IFriendRequestsDeps;

    // AS3: .../domain/FriendRequests.as::_SafeStr_5001
    private _requests: FriendRequest[] = [];

    // AS3: .../domain/FriendRequests.as::get requests()
    get requests(): FriendRequest[]
    {
        return this._requests;
    }

    // AS3: .../domain/FriendRequests.as::_limit
    private _limit: number;

    // AS3: .../domain/FriendRequests.as::get limit()
    get limit(): number
    {
        return this._limit;
    }

    // AS3: .../domain/FriendRequests.as::set limit()
    set limit(value: number)
    {
        this._limit = value;
    }

    // AS3: .../domain/FriendRequests.as::_clubLimit
    private _clubLimit: number;

    // AS3: .../domain/FriendRequests.as::get clubLimit()
    get clubLimit(): number
    {
        return this._clubLimit;
    }

    /**
     * Drop requests and their rows. With `keepOpen` set, still-open requests survive
     * and only the resolved ones (accepted, declined, failed) are swept — that is the
     * sweep the tab runs when it reopens.
     */
    // AS3: .../domain/FriendRequests.as::clearAndUpdateView()
    clearAndUpdateView(keepOpen: boolean): void
    {
        const removed: FriendRequest[] = [];

        for(const request of this._requests)
        {
            if(!keepOpen || request.state !== FriendRequest.STATE_OPEN)
            {
                removed.push(request);
            }
        }

        for(const request of removed)
        {
            Util.remove(this._requests, request);

            if(this._deps.view !== null)
            {
                this._deps.view.removeRequest(request);
            }

            request.dispose();
        }

        this.refreshShading();
    }

    // AS3: .../domain/FriendRequests.as::acceptFailed()
    acceptFailed(requesterId: number): void
    {
        const request = this.getRequestByRequesterId(requesterId);

        if(request === null)
        {
            logger.warn(`Failed to accept friend request from ${requesterId}, error retrieving the friendrequest.`);

            return;
        }

        request.state = FriendRequest.STATE_FAILED;
        this._deps.view?.refreshRequestEntry(request);
    }

    // AS3: .../domain/FriendRequests.as::addRequest()
    addRequest(request: FriendRequest): void
    {
        this._requests.push(request);
    }

    // AS3: .../domain/FriendRequests.as::addRequestAndUpdateView()
    addRequestAndUpdateView(request: FriendRequest): void
    {
        this._requests.push(request);
        this._deps.view?.addRequest(request);
    }

    // AS3: .../domain/FriendRequests.as::getRequest()
    getRequest(requestId: number): FriendRequest | null
    {
        for(const request of this._requests)
        {
            if(request.requestId === requestId)
            {
                return request;
            }
        }

        return null;
    }

    // AS3: .../domain/FriendRequests.as::getRequestByRequesterId()
    getRequestByRequesterId(requesterUserId: number): FriendRequest | null
    {
        for(const request of this._requests)
        {
            if(request.requesterUserId === requesterUserId)
            {
                return request;
            }
        }

        return null;
    }

    /**
     * Repaints the alternating row background over the whole list. The flag starts at
     * `true` and is inverted *before* the first row, so row 0 is the unshaded one.
     */
    // AS3: .../domain/FriendRequests.as::refreshShading()
    refreshShading(): void
    {
        let shaded = true;

        for(const request of this._requests)
        {
            shaded = !shaded;
            this._deps.view?.refreshShading(request, shaded);
        }
    }

    // AS3: .../domain/FriendRequests.as::getCountOfOpenRequests()
    getCountOfOpenRequests(): number
    {
        let count = 0;

        for(const request of this.requests)
        {
            if(request.state === FriendRequest.STATE_OPEN)
            {
                count++;
            }
        }

        return count;
    }
}
