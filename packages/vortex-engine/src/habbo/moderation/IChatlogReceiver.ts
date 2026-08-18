/**
 * Something waiting for a chatlog to come back off the wire.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/moderation/_SafeCls_2732.as
 *
 * **Name derived** — the AS3 interface is `_SafeCls_2732`, obfuscated in every tree, and its single
 * member `onChatlog` is the only readable thing about it. `ChatlogCtrl` is the sole implementor and
 * `ModerationMessageHandler.addChatlogListener()` the sole consumer.
 *
 * `type`/`id` identify which request this answer belongs to: a receiver compares them against its
 * own and ignores anything else, because all three chatlog flavours (issue, room, user) come back
 * through one listener list.
 */
import type {ChatRecordData} from '@habbo/communication/messages/parser/moderation/ChatRecordData';

export interface IChatlogReceiver
{
    // AS3: _SafeCls_2732.as::onChatlog()
    onChatlog(
        caption: string,
        type: number,
        id: number,
        records: ChatRecordData[],
        highlightedUserIds: Map<number, boolean>
    ): void;
}
