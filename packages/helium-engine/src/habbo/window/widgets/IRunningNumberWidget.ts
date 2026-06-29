import type {IWidget} from './IWidget';

/**
 * Interface for the running number widget.
 *
 * Displays a number that animates (counts up) from a current value
 * to a target value at a configurable frequency.
 *
 * @see sources/win63_version/habbo/window/widgets/IRunningNumberWidget.as
 */
export interface IRunningNumberWidget extends IWidget
{
	/**
	 * The target number to animate towards.
	 */
	number: number;
	/**
	 * The number of display digits (leading zeros).
	 */
	digits: number;
	/**
	 * The color style index.
	 */
	colorStyle: number;
	/**
	 * The update frequency in milliseconds.
	 */
	updateFrequency: number;

	/**
	 * Set the initial number (skips animation).
	 */
	set initialNumber(value: number);
}

