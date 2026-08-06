/**
 * Feed item data model with title, description, timestamp, etc.
 * Used for notification feed entries.
 *
 * @see source_as_win63/habbo/notifications/feed/data/GenericNotificationItemData.as
 */
export class GenericNotificationItemData
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::_title
    private _title: string = '';

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::get title()
    get title(): string
    {
        return this._title;
    }

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::set title()
    set title(value: string)
    {
        this._title = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::_timeStamp
    private _timeStamp: number = 0;

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::get timeStamp()
    get timeStamp(): number
    {
        return this._timeStamp;
    }

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::set timeStamp()
    set timeStamp(value: number)
    {
        this._timeStamp = value;
    }

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::_description
    private _description: string = '';

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::get description()
    get description(): string
    {
        return this._description;
    }

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::set description()
    set description(value: string)
    {
        this._description = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::_buttonAction
    private _buttonAction: string = '';

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::get buttonAction()
    get buttonAction(): string
    {
        return this._buttonAction;
    }

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::set buttonAction()
    set buttonAction(value: string)
    {
        this._buttonAction = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::_buttonCaption
    private _buttonCaption: string = '';

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::get buttonCaption()
    get buttonCaption(): string
    {
        return this._buttonCaption;
    }

    // AS3: .../src/com/sulake/habbo/notifications/feed/data/GenericNotificationItemData.as::set buttonCaption()
    set buttonCaption(value: string)
    {
        this._buttonCaption = value;
    }
}
