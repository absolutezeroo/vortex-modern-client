import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    OfficialSongIdMessageParser
} from '@habbo/communication/messages/parser/sound/OfficialSongIdMessageParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/sound/OfficialSongIdMessageEvent.as
 * (`_SafeCls_3346` in the primary tree; header **3050** from its registry)
 *
 * Not 2264. That is win63_version's id for this event, and the 2026 registry has since given 2264
 * to `WeeklyCompetitiveFriendsLeaderboardEvent` — registering it there would hand this parser a
 * leaderboard payload, which reads without throwing. The emulator still carries 2264 for its
 * `OfficialSongIdMessageComposer`, alone among the four sound headers in having no AS3-verified
 * note; that side needs the same correction.
 */
export class OfficialSongIdMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, OfficialSongIdMessageParser);
    }
}
