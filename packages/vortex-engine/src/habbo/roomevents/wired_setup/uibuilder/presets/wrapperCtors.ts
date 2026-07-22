import type {IWindow} from '@core/window/IWindow';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';

import type {PresetManager} from '../PresetManager';
import type {WiredStyle} from '../styles/WiredStyle';
import type {WiredUIPreset} from './WiredUIPreset';

/**
 * wrapperCtors — a runtime registry of the WiredUIPreset wrapper constructors, populated by
 * registerWrappers.ensureWrappersRegistered().
 *
 * It exists to break a circular ESM import: WiredUIPreset builds wrappers in alignRight()/alignCenter()/
 * staticHeight()/floatVertically()/wrapWindow(), while each wrapper `extends WiredUIPreset`. When the
 * base statically imported the wrapper classes, an evaluation-order cycle produced a runtime TDZ
 * ("Cannot access 'WiredUIPreset' before initialization"). Routing wrapper construction through this
 * leaf registry (which has only type imports) removes the base's static dependency on the wrappers, so
 * WiredUIPreset always finishes initializing before any wrapper's `extends` runs.
 */
export interface IWrapperCtors
{
    AlignRight: new (roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset) => WiredUIPreset;
    AlignCenter: new (roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset) => WiredUIPreset;
    StaticHeight: new (roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset, height: number) => WiredUIPreset;
    FloatVertically: new (roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, wrapped: WiredUIPreset) => WiredUIPreset;
    WindowWrapper: new (roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, window: IWindow, staticWidth: boolean) => WiredUIPreset;
}

export const wrapperCtors: Partial<IWrapperCtors> = {};
