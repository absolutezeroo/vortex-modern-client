import {createIID} from '@core/runtime/IID';
import type {IRewardTrackController} from '@habbo/quest/rewardtrack/IRewardTrackController';

/**
 * IID for the reward-track controller.
 *
 * `HabboQuestEngine` attaches `RewardTrackController` under this, exactly as AS3 does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/iid/IIDRewardTrackController.as
 */
export const IID_RewardTrackController = createIID<IRewardTrackController>('IRewardTrackController');
