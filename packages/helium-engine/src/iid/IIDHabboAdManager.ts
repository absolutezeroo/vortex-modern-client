import {createIID} from '@core/runtime/IID';
import type {IAdManager} from '@habbo/advertisement/IAdManager';

/**
 * IID for Habbo Ad Manager
 *
 * Based on AS3: com.sulake.iid.IIDHabboAdManager
 */
export const IID_HabboAdManager = createIID<IAdManager>('IHabboAdManager');
