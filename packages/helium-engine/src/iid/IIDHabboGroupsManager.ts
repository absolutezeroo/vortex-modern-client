import {createIID} from '@core/runtime/IID';
import type {IHabboGroupsManager} from '@habbo/groups/IHabboGroupsManager';

/**
 * IID for Habbo Groups Manager
 *
 * Based on AS3: com.sulake.iid.IIDHabboGroupsManager
 */
export const IID_HabboGroupsManager = createIID<IHabboGroupsManager>('IHabboGroupsManager');
