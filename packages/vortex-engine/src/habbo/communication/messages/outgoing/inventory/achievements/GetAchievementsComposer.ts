import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the full achievement list from the server.
 *
 * AS3 sends this from AchievementController.show()/ensureAchievementsInitialized()
 * with an empty payload; the server answers with an Achievements event that drives
 * AchievementController.onAchievements().
 *
 * Registered at header 2435 in HabboMessages (WIN63-202607011411 registry
 * _SafeCls_2046.as: _composers[2435] = _SafeCls_3287, the class AchievementController.show()
 * sends). NOTE: the reference Arcturus-Community server implements achievements as a fully
 * empty stub (docs/CLIENT-SERVER-ARCHITECTURE.md §20), so it never answers this request;
 * the panel only populates against a server that does.
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
