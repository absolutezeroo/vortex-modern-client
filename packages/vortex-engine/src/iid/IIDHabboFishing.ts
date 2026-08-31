import {createIID} from '@core/runtime/IID';
import type {HabboFishing} from '@habbo/vortex/fishing/HabboFishing';

/**
 * IID for the Vortex fishing system.
 *
 * NOT from AS3 — a Vortex-only feature with no `com.sulake.iid` counterpart. It follows the
 * project's manager convention (DI Component + IID registration) so consumers reach it the same way
 * they reach every other manager, exactly as `IID_HabboFurniEditor` does.
 *
 * Typed on the class rather than `unknown` so `ComponentDependency` infers the injected type and no
 * call site has to cast.
 */
export const IID_HabboFishing = createIID<HabboFishing>('IHabboFishing');
