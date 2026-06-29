import {createIID} from '@core/runtime/IID';
import type {IHabboMessenger} from '@habbo/messenger/IHabboMessenger';

/**
 * IID for Habbo Messenger
 *
 * Based on AS3: com.sulake.iid.IIDHabboMessenger
 */
export const IID_HabboMessenger = createIID<IHabboMessenger>('IHabboMessenger');
