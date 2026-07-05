import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Claim a daily income reward.
 *
 * @see sources/win63_version/habbo/communication/messages/outgoing/inventory/IncomeRewardClaimMessageComposer.as
 */
export class IncomeRewardClaimMessageComposer extends MessageComposer<[number]>
{
    private _data: [number];

    constructor(rewardId: number)
    {
        super();
        this._data = [rewardId];
    }

    getMessageArray(): [number]
    {
        return this._data;
    }
}
