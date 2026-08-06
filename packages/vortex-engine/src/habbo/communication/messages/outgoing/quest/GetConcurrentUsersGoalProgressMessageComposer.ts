import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the concurrent users goal progress from the server.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/quest/GetConcurrentUsersGoalProgressMessageComposer.as
 */
export class GetConcurrentUsersGoalProgressMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/quest/GetConcurrentUsersGoalProgressMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
