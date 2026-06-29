import type {ILimitedItemOverlayWidget} from './ILimitedItemOverlayWidget';

/**
 * Interface for the limited item grid overlay widget.
 *
 * Extends the base limited item overlay with animation support
 * for the grid item display.
 *
 * @see sources/win63_version/habbo/window/widgets/ILimitedItemGridOverlayWidget.as
 */
export interface ILimitedItemGridOverlayWidget extends ILimitedItemOverlayWidget
{
	/**
	 * Whether the shine animation is active.
	 */
	animated: boolean;
}

