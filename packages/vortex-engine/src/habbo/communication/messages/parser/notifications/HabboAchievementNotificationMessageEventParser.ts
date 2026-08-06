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

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/HabboAchievementNotificationMessageEventParser.as::get data()
    get data(): AchievementNotificationData | null
    {
        return this._data;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/HabboAchievementNotificationMessageEventParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/notifications/HabboAchievementNotificationMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new AchievementNotificationData(wrapper);

        return true;
    }
}
