import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {Friend} from './Friend';
import type {FriendCategories} from './FriendCategories';

/**
 * FriendOnlineImageListener
 *
 * The retry path for the friend-online notification: when the avatar image is not
 * ready at the moment the friend comes online, this waits for the figure's assets and
 * asks `FriendCategories` to build the notification again — this time with an image
 * that is no longer a placeholder.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendOnlineImageListener.as
 */
export class FriendOnlineImageListener implements IAvatarImageListener
{
    // AS3: .../domain/FriendOnlineImageListener.as::FriendOnlineImageListener()
    constructor(friend: Friend, friendCategories: FriendCategories)
    {
        this._friend = friend;
        this._friendCategories = friendCategories;
    }

    // AS3: .../domain/FriendOnlineImageListener.as::_SafeStr_4672
    private _friend: Friend | null;

    // AS3: .../domain/FriendOnlineImageListener.as::_friendCategories
    private _friendCategories: FriendCategories | null;

    // AS3: .../domain/FriendOnlineImageListener.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../domain/FriendOnlineImageListener.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../domain/FriendOnlineImageListener.as::avatarImageReady()
    avatarImageReady(_figureString: string): void
    {
        if(this._friendCategories === null || this._friend === null)
        {
            return;
        }

        const avatarImage = this._friendCategories.deps.avatarManager.createAvatarImage(this._friend.figure, 'h', '', null, null);

        if(avatarImage !== null && !avatarImage.isPlaceholder())
        {
            this._friendCategories.notifyFriendOnline(this._friend, avatarImage);
        }
        else if(avatarImage !== null)
        {
            avatarImage.dispose();
        }
    }

    // AS3: .../domain/FriendOnlineImageListener.as::dispose()
    dispose(): void
    {
        this._friend = null;
        this._friendCategories = null;
        this._disposed = true;
    }
}
