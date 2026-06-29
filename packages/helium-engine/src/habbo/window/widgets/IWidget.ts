import type {IDisposable} from '@core/runtime/IDisposable';
import type {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Base interface for all Habbo window widgets.
 *
 * In AS3 this was class_3420 — extends IDisposable + IIterable with a
 * properties getter/setter. HabboWindowManagerComponent creates widgets
 * via the factory and delegates PropertyStruct arrays to them.
 *
 * @see sources/win63_version/core/window/class_3420.as
 */
export interface IWidget extends IDisposable
{
	/**
	 * Widget properties getter/setter.
	 *
	 * Get: returns current widget properties as PropertyStruct array.
	 * Set: applies PropertyStruct array to update widget state.
	 */
	properties: PropertyStruct[];
}
