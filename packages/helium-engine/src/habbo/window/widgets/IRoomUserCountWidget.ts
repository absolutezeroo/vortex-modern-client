import type {IWidget} from './IWidget';

/**
 * Interface for the room user count widget.
 *
 * Displays the current number of users in a room.
 *
 * @see sources/win63_version/habbo/window/widgets/IRoomUserCountWidget.as
 */
export interface IRoomUserCountWidget extends IWidget
{
    /**
	 * Set the user count to display.
	 */
    set userCount(value: number);
}
