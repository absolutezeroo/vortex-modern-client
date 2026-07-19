import {createIID} from "@core/runtime/IID";
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';

/**
 * IID for Habbo Tracking
 *
 * Based on AS3: com.sulake.iid.IIDHabboTracking
 */
export const IID_HabboTracking = createIID<IHabboTracking>('IHabboTracking');
