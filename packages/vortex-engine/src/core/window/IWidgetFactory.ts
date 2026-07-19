import type {IWidgetWindow} from './components/IWidgetWindow';

/**
 * Widget factory interface.
 *
 * Creates widget instances by type identifier.
 * In AS3, this was class_1798. HabboWindowManagerComponent implements it.
 *
 * @see sources/win63_version/core/window/class_1798.as
 */
export interface IWidgetFactory
{
    createWidget(type: string, window: IWidgetWindow): unknown;
}
