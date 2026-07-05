/**
 * Feed item data model with title, description, timestamp, etc.
 * Used for notification feed entries.
 *
 * @see source_as_win63/habbo/notifications/feed/data/GenericNotificationItemData.as
 */
export class GenericNotificationItemData
{
    private _title: string = '';

    get title(): string
    {
        return this._title;
    }

    set title(value: string)
    {
        this._title = value;
    }

    private _timeStamp: number = 0;

    get timeStamp(): number
    {
        return this._timeStamp;
    }

    set timeStamp(value: number)
    {
        this._timeStamp = value;
    }

    private _description: string = '';

    get description(): string
    {
        return this._description;
    }

    set description(value: string)
    {
        this._description = value;
    }

    private _buttonAction: string = '';

    get buttonAction(): string
    {
        return this._buttonAction;
    }

    set buttonAction(value: string)
    {
        this._buttonAction = value;
    }

    private _buttonCaption: string = '';

    get buttonCaption(): string
    {
        return this._buttonCaption;
    }

    set buttonCaption(value: string)
    {
        this._buttonCaption = value;
    }
}
