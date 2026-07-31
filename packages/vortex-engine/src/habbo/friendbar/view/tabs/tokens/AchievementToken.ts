import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IFriendEntity} from '../../../data/IFriendEntity';
import type {IFriendNotification} from '../../../data/IFriendNotification';
import {Token} from './Token';

/**
 * AchievementToken
 *
 * "X unlocked <badge>". The only token that resolves its text up front rather than
 * handing a `${...}` key to the window: badge names come from the localization
 * manager's badge table, not the plain text table.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/tokens/AchievementToken.as
 */
export class AchievementToken extends Token
{
    // AS3: .../tokens/AchievementToken.as::AchievementToken()
    constructor(_friend: IFriendEntity, notification: IFriendNotification, localization: IHabboLocalizationManager)
    {
        super(notification);

        this.prepare(
            '${friendbar.notify.achievement}',
            localization.getBadgeName(notification.message),
            'message_piece_xml',
            'friend_bar_event_notification_icon'
        );
    }
}
