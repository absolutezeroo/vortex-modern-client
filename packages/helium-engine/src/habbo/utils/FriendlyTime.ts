/**
 * Time formatting utility.
 *
 * Converts seconds into human-readable time strings such as
 * "5 minutes ago" or "2h". The AS3 version uses localization
 * for string formatting; this simplified version uses hardcoded
 * English strings for standalone usage.
 *
 * @see source_as_win63/habbo/utils/FriendlyTime.as
 */
export class FriendlyTime
{
    public static readonly MINUTE: number = 60;
    public static readonly HOUR: number = 3600;
    public static readonly DAY: number = 86400;
    public static readonly WEEK: number = 604800;
    public static readonly MONTH: number = 2592000;
    public static readonly YEAR: number = 31536000;

    /**
	 * Get a human-readable friendly time string from a number of seconds.
	 *
	 * @param seconds The number of seconds elapsed
	 * @param suffix An optional suffix (e.g. " ago")
	 * @param threshold The multiplier threshold for grouping (default 3)
	 * @returns A friendly time string (e.g. "5 minutes ago")
	 */
    static getFriendlyTime(seconds: number, suffix: string = '', threshold: number = 3): string
    {
        if(seconds > threshold * FriendlyTime.YEAR)
        {
            return Math.round(seconds / FriendlyTime.YEAR) + ' years' + suffix;
        }

        if(seconds > threshold * FriendlyTime.MONTH)
        {
            return Math.round(seconds / FriendlyTime.MONTH) + ' months' + suffix;
        }

        if(seconds > threshold * FriendlyTime.DAY)
        {
            return Math.round(seconds / FriendlyTime.DAY) + ' days' + suffix;
        }

        if(seconds > threshold * FriendlyTime.HOUR)
        {
            return Math.round(seconds / FriendlyTime.HOUR) + ' hours' + suffix;
        }

        if(seconds > threshold * FriendlyTime.MINUTE)
        {
            return Math.round(seconds / FriendlyTime.MINUTE) + ' minutes' + suffix;
        }

        return 'just now';
    }

    /**
	 * Get a short form friendly time string from a number of seconds.
	 *
	 * @param seconds The number of seconds elapsed
	 * @param suffix An optional suffix
	 * @param threshold The multiplier threshold for grouping (default 3)
	 * @returns A short friendly time string (e.g. "5m", "2h")
	 */
    static getShortFriendlyTime(seconds: number, suffix: string = '', threshold: number = 3): string
    {
        if(seconds > threshold * FriendlyTime.YEAR)
        {
            return Math.round(seconds / FriendlyTime.YEAR) + 'y' + suffix;
        }

        if(seconds > threshold * FriendlyTime.MONTH)
        {
            return Math.round(seconds / FriendlyTime.MONTH) + 'mo' + suffix;
        }

        if(seconds > threshold * FriendlyTime.DAY)
        {
            return Math.round(seconds / FriendlyTime.DAY) + 'd' + suffix;
        }

        if(seconds > threshold * FriendlyTime.HOUR)
        {
            return Math.round(seconds / FriendlyTime.HOUR) + 'h' + suffix;
        }

        if(seconds > threshold * FriendlyTime.MINUTE)
        {
            return Math.round(seconds / FriendlyTime.MINUTE) + 'm' + suffix;
        }

        return '< 1m';
    }
}
