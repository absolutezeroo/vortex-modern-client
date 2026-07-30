import type {IFriendEntity} from '../../../data/IFriendEntity';
import type {IFriendNotification} from '../../../data/IFriendNotification';
import {Token} from './Token';

/**
 * MessengerToken
 *
 * "X sent you a message". The friend is taken but unused — every token subclass has
 * the same two-argument shape so the view can build them uniformly.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/tokens/MessengerToken.as
 */
export class MessengerToken extends Token
{
    // AS3: .../tokens/MessengerToken.as::MessengerToken()
    constructor(_friend: IFriendEntity, notification: IFriendNotification)
    {
        super(notification);

        this.prepare('${friendbar.notify.messenger}', notification.message, 'message_piece_xml', 'messenger_notification_icon');
    }
}
