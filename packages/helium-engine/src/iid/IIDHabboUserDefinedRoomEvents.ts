import {createIID} from '@core/runtime/IID';
import type {IHabboUserDefinedRoomEvents} from '@habbo/roomevents/IHabboUserDefinedRoomEvents';

/**
 * IID for Habbo User Defined Room Events (Wired)
 *
 * Based on AS3: com.sulake.iid.IIDHabboUserDefinedRoomEvents
 */
export const IID_HabboUserDefinedRoomEvents = createIID<IHabboUserDefinedRoomEvents>('IHabboUserDefinedRoomEvents');
