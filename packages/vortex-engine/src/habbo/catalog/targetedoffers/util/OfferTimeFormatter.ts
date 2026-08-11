import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';

/**
 * Formats an offer's remaining time for the countdown line.
 *
 * Three bands, and the reason for them is legibility rather than precision: over a day it reads
 * "2 days", over an hour "3h", and below that it becomes a live mm:ss clock that ticks every
 * second. The class is obfuscated in every tree so its *name* here is DERIVED; both methods keep
 * their real names.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/targetedoffers/util/_SafeCls_4249.as
 */
export class OfferTimeFormatter
{
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/_SafeCls_4249.as::getStringFromSeconds()
    static getStringFromSeconds(localization: IHabboLocalizationManager | null, seconds: number): string
    {
        const hours = Math.floor(seconds / 60 / 60);

        if(hours > 24) return FriendlyTime.getFriendlyTime(localization, seconds, '', 1);

        if(hours > 0) return FriendlyTime.getLocalization(localization, 'friendlytime.hours.short', hours);

        return OfferTimeFormatter.convertSecondsToTime(seconds);
    }

    /**
     * "h:mm" once there is an hour left, "mm:ss" below that — note the seconds are only appended
     * when the hour count is zero, which is what makes the two shapes mutually exclusive.
     */
    // AS3: .../src/com/sulake/habbo/catalog/targetedoffers/util/_SafeCls_4249.as::convertSecondsToTime()
    static convertSecondsToTime(seconds: number): string
    {
        const hours = Math.floor(seconds / 60 / 60);
        const minutes = Math.floor((seconds - (hours * 60 * 60)) / 60);
        const remainingSeconds = seconds - (hours * 60 * 60) - (minutes * 60);

        let text = '';

        if(hours > 0) text = `${hours}:`;

        text += minutes < 10 ? `0${minutes}` : `${minutes}`;

        if(hours === 0)
        {
            text += ':';
            text += remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
        }

        return text;
    }
}
