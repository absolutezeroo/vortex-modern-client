import type {IWidget} from './IWidget';

/**
 * Interface for the separator widget.
 *
 * Renders a visual separator line, either horizontal or vertical,
 * using tiled border images. Supports child windows that punch
 * through the separator line.
 *
 * @see sources/win63_version/habbo/window/widgets/ISeparatorWidget.as
 */
export interface ISeparatorWidget extends IWidget
{
	/**
	 * Whether the separator is vertical (true) or horizontal (false).
	 */
	vertical: boolean;
}

