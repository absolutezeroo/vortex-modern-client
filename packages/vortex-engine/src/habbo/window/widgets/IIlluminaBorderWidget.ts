import type {IWidget} from './IWidget';

/**
 * Interface for the Illumina border widget.
 *
 * Renders a 9-slice border around content, with configurable style,
 * padding, and child window placement in top/bottom positions.
 *
 * @see sources/win63_version/habbo/window/widgets/IIlluminaBorderWidget.as
 */
export interface IIlluminaBorderWidget extends IWidget
{
    /**
	 * The border style name (e.g. "illumina_light", "illumina_dark").
	 */
    borderStyle: string;

    /**
	 * The name of the content child window.
	 */
    contentChild: string;

    /**
	 * The padding around the content child.
	 */
    contentPadding: number;

    /**
	 * The padding on left/right sides for positioned children.
	 */
    sidePadding: number;

    /**
	 * The margin around positioned children (used to clear border behind them).
	 */
    childMargin: number;

    /**
	 * Name of the child positioned at top-left of the border.
	 */
    topLeftChild: string;

    /**
	 * Name of the child positioned at top-center of the border.
	 */
    topCenterChild: string;

    /**
	 * Name of the child positioned at top-right of the border.
	 */
    topRightChild: string;

    /**
	 * Name of the child positioned at bottom-left of the border.
	 */
    bottomLeftChild: string;

    /**
	 * Name of the child positioned at bottom-center of the border.
	 */
    bottomCenterChild: string;

    /**
	 * Name of the child positioned at bottom-right of the border.
	 */
    bottomRightChild: string;

    /**
	 * Whether landing view mode is active (hides left border pieces).
	 */
    landingViewMode: boolean;
}
