/**
 * State constants and indicator colors for calendar entities
 *
 * @see source_as_win63/habbo/quest/seasonalcalendar/CalendarEntityStateEnums.as
 */
export class CalendarEntityStateEnums
{
    // AS3: .../src/com/sulake/habbo/quest/seasonalcalendar/CalendarEntityStateEnums.as::ACTIVE
    public static readonly ACTIVE: number = 0;
    // AS3: .../src/com/sulake/habbo/quest/seasonalcalendar/CalendarEntityStateEnums.as::INACTIVE
    public static readonly INACTIVE: number = 1;
    // AS3: .../src/com/sulake/habbo/quest/seasonalcalendar/CalendarEntityStateEnums.as::COMPLETED
    public static readonly COMPLETED: number = 2;
    public static readonly EXPIRED: number = 3;

    /**
	 * Colors for each entity state, indexed by state constant
	 */
    // AS3: .../src/com/sulake/habbo/quest/seasonalcalendar/CalendarEntityStateEnums.as::INDICATOR_COLOR
    public static readonly INDICATOR_COLOR: readonly number[] = [2134301, 12439506, 10066329, 10066329];
}
