import {createIID} from '@core/runtime/IID';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';

/**
 * IID for Habbo Friend List Manager
 *
 * Based on AS3: com.sulake.iid.IIDHabboFriendList
 */
export const IID_HabboFriendList = createIID<IHabboFriendList>('IHabboFriendList');
