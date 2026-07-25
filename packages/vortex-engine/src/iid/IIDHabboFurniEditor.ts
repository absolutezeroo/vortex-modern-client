import {createIID} from '@core/runtime/IID';
import type {IHabboFurniEditor} from '@habbo/vortex/furnieditor/IHabboFurniEditor';

/**
 * IID for the Vortex furni editor.
 *
 * NOT from AS3 — this is a Vortex-only staff tool with no `com.sulake.iid` counterpart. It follows
 * the project's manager convention (DI Component + IID registration) so that consumers reach it the
 * same way they reach every other manager.
 *
 * Typed on the interface (rather than `unknown`, as most of the older IIDs are) so that
 * `ComponentDependency` infers the injected type instead of forcing a cast at each call site.
 */
export const IID_HabboFurniEditor = createIID<IHabboFurniEditor>('IHabboFurniEditor');
