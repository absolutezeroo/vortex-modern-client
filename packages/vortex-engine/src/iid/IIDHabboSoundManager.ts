import {createIID} from '@core/runtime/IID';
import type {IHabboSoundManager} from '@habbo/sound/IHabboSoundManager';

/**
 * IID for Habbo Sound Manager
 *
 * Based on AS3: com.sulake.iid.IIDHabboSoundManager
 */
export const IID_HabboSoundManager = createIID<IHabboSoundManager>('IHabboSoundManager');
