import type {IHabboMessenger} from '@habbo/messenger/IHabboMessenger';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IAvatarRenderManager} from '@habbo/avatar/IAvatarRenderManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IFriendsView} from '../IFriendsView';

/**
 * IFriendCategoriesDeps
 *
 * Everything `FriendCategories` needs from the outside world, resolved lazily so the
 * friends tab can be built after the domain. Keeping it an interface is what lets the
 * domain call the messenger and the notification feed without importing the manager.
 *
 * The primary tree obfuscates this interface to `_SafeCls_1966` and no tree recovers
 * it. **The name `IFriendCategoriesDeps` is derived**, from its sole implementor
 * `FriendCategoriesDeps` (unobfuscated) — the AS3 naming pattern its three siblings
 * (`AvatarSearchDeps`, `FriendRequestsDeps`, `FriendListTabsDeps`) already follow.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/domain/_SafeCls_1966.as
 */
export interface IFriendCategoriesDeps
{
    // AS3: .../domain/_SafeCls_1966.as::get view()
    readonly view: IFriendsView;

    // AS3: .../domain/_SafeCls_1966.as::get messenger()
    readonly messenger: IHabboMessenger;

    // AS3: .../domain/_SafeCls_1966.as::get notifications()
    readonly notifications: IHabboNotifications;

    // AS3: .../domain/_SafeCls_1966.as::get avatarManager()
    readonly avatarManager: IAvatarRenderManager;

    // AS3: .../domain/_SafeCls_1966.as::get localizations()
    readonly localizations: IHabboLocalizationManager;
}
