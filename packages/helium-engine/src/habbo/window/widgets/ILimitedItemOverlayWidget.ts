import type {IWidget} from './IWidget';

/**
 * Interface for the limited item overlay widget (base).
 *
 * Displays serial number and series size information for limited edition items.
 *
 * @see sources/win63_version/habbo/window/widgets/ILimitedItemOverlayWidget.as
 */
export interface ILimitedItemOverlayWidget extends IWidget
{
    /**
	 * The serial number of the limited item.
	 */
    serialNumber: number;

    /**
	 * The total series size.
	 */
    seriesSize: number;
}
