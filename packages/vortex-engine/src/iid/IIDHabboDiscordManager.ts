import {createIID} from '@core/runtime/IID';
import type {IHabboDiscordManager} from '@habbo/discord/IHabboDiscordManager';

/**
 * IID for the Discord Rich Presence manager
 *
 * Based on AS3: com.sulake.iid.IIDHabboDiscordManager
 */
export const IID_HabboDiscordManager = createIID<IHabboDiscordManager>('IHabboDiscordManager');
