import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Casts a vote for one of the two sides of a "versus" community goal.
 *
 * This message is absent from the primary sources/win63_2026_crypted_version
 * AS3 tree's landingview message folders (only present in the older
 * sources/win63_version). Registered in HabboMessages.ts with header id 1104,
 * matching sources/win63_version — this codebase mirrors win63_version's real
 * header ids elsewhere too (e.g. GetCommunityGoalHallOfFameMessageComposer=1034,
 * ForwardToARandomPromotedRoomMessageComposer=2120), so the same id is used
 * here rather than a guess.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/landingview/votes/CommunityGoalVoteMessageComposer.as
 */
export class CommunityGoalVoteMessageComposer extends MessageComposer<ConstructorParameters<typeof CommunityGoalVoteMessageComposer>>
{
    private _data: ConstructorParameters<typeof CommunityGoalVoteMessageComposer>;

    constructor(voteOption: number)
    {
        super();
        this._data = [voteOption];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
