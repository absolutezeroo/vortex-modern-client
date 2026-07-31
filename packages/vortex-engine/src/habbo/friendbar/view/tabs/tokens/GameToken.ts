import type {IFriendEntity} from '../../../data/IFriendEntity';
import type {IFriendNotification} from '../../../data/IFriendNotification';
import {Token} from './Token';

/**
 * GameToken
 *
 * "X is playing <game>", the game's name coming from its game-center key.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/tabs/tokens/GameToken.as
 */
export class GameToken extends Token
{
    // AS3: .../tokens/GameToken.as::GameToken()
    constructor(_friend: IFriendEntity, notification: IFriendNotification)
    {
        super(notification);

        this.prepare('${friendbar.notify.game}', `\${gamecenter.${notification.message}.name}`, 'message_piece_xml', 'game_center_snowball_notification_icon');
    }
}
