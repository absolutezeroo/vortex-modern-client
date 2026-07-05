import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {AchievementNotificationData} from '../../incoming/notifications/AchievementNotificationData';

/**
 * Parser for Habbo achievement notification message
 *
 * Parses achievement notification data including type, level, badge, points, and category.
 *
 * @see source_as_win63/habbo/communication/messages/parser/notifications/HabboAchievementNotificationMessageEventParser.as
 */
export class HabboAchievementNotificationMessageEventParser implements IMessageParser
{
    private _data: AchievementNotificationData | null = null;

    get data(): AchievementNotificationData | null
    {
        return this._data;
    }

    flush(): boolean
    {
        this._data = null;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new AchievementNotificationData(wrapper);

        return true;
    }
}
