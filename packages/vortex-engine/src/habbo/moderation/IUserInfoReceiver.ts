/**
 * Something waiting for a moderator user-info card to come back off the wire.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/_SafeCls_3833.as
 *
 * **Name derived** — the AS3 interface is `_SafeCls_3833` and `onUserInfo` is its only member.
 * `UserInfoCtrl` is the sole implementor, `ModerationMessageHandler.addUserInfoListener()` the sole
 * consumer.
 */
import type {ModeratorUserInfoData} from '@habbo/communication/messages/parser/moderation/ModeratorUserInfoData';

export interface IUserInfoReceiver
{
    // AS3: _SafeCls_3833.as::onUserInfo()
    onUserInfo(data: ModeratorUserInfoData): void;
}
