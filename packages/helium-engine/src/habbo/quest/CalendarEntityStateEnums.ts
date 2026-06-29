/**
 * State constants and indicator colors for calendar entities
 *
 * @see source_as_win63/habbo/quest/seasonalcalendar/CalendarEntityStateEnums.as
 */
export class CalendarEntityStateEnums
{
	public static readonly ACTIVE: number = 0;
	public static readonly INACTIVE: number = 1;
	public static readonly COMPLETED: number = 2;
	public static readonly EXPIRED: number = 3;

	/**
	 * Colors for each entity state, indexed by state constant
	 */
	public static readonly INDICATOR_COLOR: readonly number[] = [2134301, 12439506, 10066329, 10066329];
}
