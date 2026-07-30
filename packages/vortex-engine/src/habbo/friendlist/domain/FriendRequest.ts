import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {FriendRequestData} from '@habbo/communication/messages/parser/friendlist/FriendRequestData';

/**
 * FriendRequest
 *
 * One pending request, and the row window showing it. The state is what the row
 * paints: an accepted or declined request stays in the list, greyed out, until the
 * next `clearAndUpdateView(true)` sweeps it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendRequest.as
 */
export class FriendRequest implements IDisposable
{
    // AS3: .../domain/FriendRequest.as::STATE_OPEN
    static readonly STATE_OPEN: number = 1;

    // AS3: .../domain/FriendRequest.as::STATE_ACCEPTED
    static readonly STATE_ACCEPTED: number = 2;

    // AS3: .../domain/FriendRequest.as::STATE_DECLINED
    static readonly STATE_DECLINED: number = 3;

    // AS3: .../domain/FriendRequest.as::STATE_FAILED
    static readonly STATE_FAILED: number = 4;

    // AS3: .../domain/FriendRequest.as::FriendRequest()
    constructor(data: FriendRequestData)
    {
        this._requestId = data.requestId;
        this._requesterName = data.requesterName;
        this._requesterUserId = data.requesterUserId;
    }

    // AS3: .../domain/FriendRequest.as::_SafeStr_7451
    private _requestId: number;

    // AS3: .../domain/FriendRequest.as::get requestId()
    get requestId(): number
    {
        return this._requestId;
    }

    // AS3: .../domain/FriendRequest.as::_requesterName
    private _requesterName: string;

    // AS3: .../domain/FriendRequest.as::get requesterName()
    get requesterName(): string
    {
        return this._requesterName;
    }

    // AS3: .../domain/FriendRequest.as::_SafeStr_9582
    private _requesterUserId: number;

    // AS3: .../domain/FriendRequest.as::get requesterUserId()
    get requesterUserId(): number
    {
        return this._requesterUserId;
    }

    // AS3: .../domain/FriendRequest.as::_SafeStr_4597
    private _state: number = FriendRequest.STATE_OPEN;

    // AS3: .../domain/FriendRequest.as::get state()
    get state(): number
    {
        return this._state;
    }

    // AS3: .../domain/FriendRequest.as::set state()
    set state(value: number)
    {
        this._state = value;
    }

    // AS3: .../domain/FriendRequest.as::_SafeStr_4550
    private _view: IWindowContainer | null = null;

    // AS3: .../domain/FriendRequest.as::get view()
    get view(): IWindowContainer | null
    {
        return this._view;
    }

    // AS3: .../domain/FriendRequest.as::set view()
    set view(value: IWindowContainer | null)
    {
        this._view = value;
    }

    // AS3: .../domain/FriendRequest.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../domain/FriendRequest.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Unlike `Friend`, this owns its row: disposing destroys the window rather than
     * just dropping the reference.
     */
    // AS3: .../domain/FriendRequest.as::dispose()
    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this._disposed = true;

        if(this._view !== null)
        {
            this._view.destroy();
            this._view = null;
        }
    }
}
