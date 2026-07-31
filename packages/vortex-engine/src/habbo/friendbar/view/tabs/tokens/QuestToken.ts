import type {IFriendEntity} from '../../../data/IFriendEntity';
import type {IFriendNotification} from '../../../data/IFriendNotification';
import {Token} from './Token';

/**
 * QuestToken
 *
 * "X completed a quest". The notification carries the quest's code, which is wrapped
 * into its localization key here rather than resolved — the window resolves `${...}`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/tokens/QuestToken.as
 */
export class QuestToken extends Token
{
    // AS3: .../tokens/QuestToken.as::QuestToken()
    constructor(_friend: IFriendEntity, notification: IFriendNotification)
    {
        super(notification);

        this.prepare('${friendbar.notify.quest}', `\${quests.${notification.message}.name}`, 'message_piece_xml', 'friend_bar_event_notification_icon');
    }
}
