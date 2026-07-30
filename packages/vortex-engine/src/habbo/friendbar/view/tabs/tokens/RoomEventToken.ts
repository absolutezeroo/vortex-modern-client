import type {IFriendEntity} from '../../../data/IFriendEntity';
import type {IFriendNotification} from '../../../data/IFriendNotification';
import {Token} from './Token';

/**
 * RoomEventToken
 *
 * "X started an event".
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/tokens/RoomEventToken.as
 */
export class RoomEventToken extends Token
{
    // AS3: .../tokens/RoomEventToken.as::RoomEventToken()
    constructor(_friend: IFriendEntity, notification: IFriendNotification)
    {
        super(notification);

        this.prepare('${friendbar.notify.event}', notification.message, 'message_piece_xml', 'friend_bar_event_notification_icon');
    }
}
