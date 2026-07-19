import {createIID} from '@core/runtime/IID';
import type {IHabboModeration} from '@habbo/moderation/IHabboModeration';

/**
 * IID for Habbo Moderation
 *
 * Based on AS3: com.sulake.iid.IIDHabboModeration
 */
export const IID_HabboModeration = createIID<IHabboModeration>('IHabboModeration');
