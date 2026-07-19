import {createIID} from '@core/runtime/IID';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';

/**
 * IID for Habbo Notifications
 *
 * Based on AS3: com.sulake.iid.IIDHabboNotifications
 */
export const IID_HabboNotifications = createIID<IHabboNotifications>('IHabboNotifications');
