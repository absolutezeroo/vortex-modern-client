import type {IDisposable} from '../runtime/IDisposable';
import type {IIterable} from './utils/IIterable';

/**
 * Base widget interface.
 *
 * Widgets are embedded in WidgetWindowController and provide custom
 * behavior. The host controller delegates properties to the widget.
 *
 * In AS3 this was class_3420: IDisposable + IIterable + properties.
 *
 * @see sources/win63_version/core/window/class_3420.as
 */
export interface IWidget extends IDisposable, IIterable
{
    properties: unknown[];
}
