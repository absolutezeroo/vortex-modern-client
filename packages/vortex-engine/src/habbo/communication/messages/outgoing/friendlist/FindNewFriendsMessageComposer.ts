import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests to find new friends (random room matching).
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/friendlist/FindNewFriendsMessageComposer.as
 */
export class FindNewFriendsMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/win63_version/habbo/communication/messages/outgoing/friendlist/FindNewFriendsMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
