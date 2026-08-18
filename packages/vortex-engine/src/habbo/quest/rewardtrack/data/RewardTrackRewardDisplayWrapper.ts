/**
 * RewardTrackRewardDisplayWrapper — presents a prize to the shared product-display widget.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/data/RewardTrackRewardDisplayWrapper.as
 *
 * `extraParams` is handed to **both** the pet and the bot figure accessors, because the widget
 * reads whichever one matches the reward type and a prize only ever carries one blob. `extraData`
 * is deliberately empty and `figureSetIds` deliberately empty — AS3 returns the same.
 */
import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';
import type {RewardTrackPrize} from './RewardTrackPrize';

export class RewardTrackRewardDisplayWrapper implements IProductDisplayInfo
{
    // AS3: RewardTrackRewardDisplayWrapper.as::_SafeStr_4765
    private _prize: RewardTrackPrize;

    // AS3: RewardTrackRewardDisplayWrapper.as::RewardTrackRewardDisplayWrapper()
    constructor(prize: RewardTrackPrize)
    {
        this._prize = prize;
    }

    // AS3: RewardTrackRewardDisplayWrapper.as::get productTypeId()
    get productTypeId(): number
    {
        return this._prize.productItemTypeId;
    }

    // AS3: RewardTrackRewardDisplayWrapper.as::get itemTypeId()
    get itemTypeId(): string
    {
        return this._prize.rewardTypeId;
    }

    // AS3: RewardTrackRewardDisplayWrapper.as::get extraData()
    get extraData(): string
    {
        return '';
    }

    // AS3: RewardTrackRewardDisplayWrapper.as::get petFigureString()
    get petFigureString(): string
    {
        return this._prize.extraParams;
    }

    // AS3: RewardTrackRewardDisplayWrapper.as::get botFigureString()
    get botFigureString(): string
    {
        return this._prize.extraParams;
    }

    // AS3: RewardTrackRewardDisplayWrapper.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return [];
    }
}
