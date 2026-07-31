import type {IHabboMessenger} from '@habbo/messenger/IHabboMessenger';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {FriendListTabEnum} from '../FriendListTabEnum';
import type {IFriendsView} from '../IFriendsView';
import type {HabboFriendList} from '../HabboFriendList';
import type {IFriendCategoriesDeps} from './IFriendCategoriesDeps';

/**
 * FriendCategoriesDeps
 *
 * Resolves `FriendCategories`' dependencies off the manager on each access. The view
 * in particular has to be late-bound: the domain is built in the manager's
 * constructor, long before the tabs that own the view exist.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/FriendCategoriesDeps.as
 */
export class FriendCategoriesDeps implements IFriendCategoriesDeps
{
    // AS3: .../domain/FriendCategoriesDeps.as::FriendCategoriesDeps()
    constructor(friendList: HabboFriendList)
    {
        this._friendList = friendList;
    }

    // AS3: .../domain/FriendCategoriesDeps.as::_friendList
    private _friendList: HabboFriendList;

    // AS3: .../domain/FriendCategoriesDeps.as::get view()
    get view(): IFriendsView
    {
        return this._friendList.tabs?.findTab(FriendListTabEnum.TABID_FRIENDS)?.tabView as unknown as IFriendsView;
    }

    // AS3: .../domain/FriendCategoriesDeps.as::get messenger()
    get messenger(): IHabboMessenger
    {
        return this._friendList.messenger!;
    }

    // AS3: .../domain/FriendCategoriesDeps.as::get notifications()
    get notifications(): IHabboNotifications
    {
        return this._friendList.notifications!;
    }

    // AS3: .../domain/FriendCategoriesDeps.as::get avatarManager()
    get avatarManager(): IAvatarRenderManager
    {
        return this._friendList.avatarManager!;
    }

    // AS3: .../domain/FriendCategoriesDeps.as::get localizations()
    get localizations(): IHabboLocalizationManager
    {
        return this._friendList.localization!;
    }
}
