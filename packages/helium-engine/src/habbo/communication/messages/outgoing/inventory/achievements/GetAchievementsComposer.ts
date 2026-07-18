import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the full achievement list from the server.
 *
 * AS3 sends this from AchievementController.show()/ensureAchievementsInitialized()
 * with an empty payload; the server answers with an Achievements event that drives
 * AchievementController.onAchievements().
 *
 * NOTE: this composer is intentionally NOT registered with a numeric header in
 * HabboMessages.ts — the WIN63 outgoing id for GetAchievements is not present in any
 * available source tree and must not be invented. Until it is registered, send() will
 * drop it with an "Unknown composer" warning. Independently, the reference
 * Arcturus-Community server has achievements as a fully empty stub
 * (docs/CLIENT-SERVER-ARCHITECTURE.md §20), so no Achievements response arrives there
 * regardless.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/inventory/achievements/GetAchievementsComposer.as
 */
export class GetAchievementsComposer extends MessageComposer<[]>
{
    // AS3: .../outgoing/inventory/achievements/GetAchievementsComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
