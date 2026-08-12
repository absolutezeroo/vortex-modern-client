import type {IProductDisplayInfo} from '@habbo/window/widgets/IProductDisplayInfo';
import type {DailyTaskRewardData} from '@habbo/communication/messages/parser/quest/DailyTaskRewardData';

/**
 * Adapts one daily-task reward to the product-preview contract, so the reward icon is drawn by the
 * same widget the catalog uses.
 *
 * Note `extraParams` is returned for **both** the pet figure and the bot figure — AS3 does not
 * choose between them, it hands the same string to whichever branch the product type selects. The
 * two getters look like a copy-paste slip and are not one: only one is ever read per reward.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/dailytasks/tasks/RewardDisplayWrapper.as
 */
export class RewardDisplayWrapper implements IProductDisplayInfo
{
    // AS3: RewardDisplayWrapper.as::_SafeStr_7259 (the wrapped reward)
    private _reward: DailyTaskRewardData;

    // AS3: RewardDisplayWrapper.as::RewardDisplayWrapper()
    constructor(reward: DailyTaskRewardData)
    {
        this._reward = reward;
    }

    // AS3: RewardDisplayWrapper.as::get productTypeId()
    get productTypeId(): number
    {
        return this._reward.productItemTypeId;
    }

    // AS3: RewardDisplayWrapper.as::get itemTypeId()
    get itemTypeId(): string
    {
        return this._reward.rewardTypeId;
    }

    /** Always empty in AS3. */
    // AS3: RewardDisplayWrapper.as::get extraData()
    get extraData(): string
    {
        return '';
    }

    // AS3: RewardDisplayWrapper.as::get petFigureString()
    get petFigureString(): string
    {
        return this._reward.extraParams;
    }

    // AS3: RewardDisplayWrapper.as::get botFigureString()
    get botFigureString(): string
    {
        return this._reward.extraParams;
    }

    /** Always empty in AS3: a task reward carries no figure set. */
    // AS3: RewardDisplayWrapper.as::get figureSetIds()
    get figureSetIds(): number[]
    {
        return [];
    }
}
