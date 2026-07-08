import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests forwarding into a random room from a promoted room category
 * (used by the landing view's `goToRoom()`). Registered in HabboMessages.ts
 * with header id 2120, matching sources/win63_version (this codebase mirrors
 * win63_version's real header ids elsewhere too, e.g. GetCommunityGoalHallOfFameMessageComposer=1034).
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/navigator/ForwardToARandomPromotedRoomMessageComposer.as
 */
export class ForwardToARandomPromotedRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof ForwardToARandomPromotedRoomMessageComposer>>
{
    private _data: ConstructorParameters<typeof ForwardToARandomPromotedRoomMessageComposer>;

    constructor(roomCategory: string)
    {
        super();
        this._data = [roomCategory];
    }

    getMessageArray(): [string]
    {
        return this._data;
    }
}
