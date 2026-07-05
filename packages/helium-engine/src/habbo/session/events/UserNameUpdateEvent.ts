/**
 * User name update event
 *
 * @see source_as_win63/habbo/session/events/UserNameUpdateEvent.as
 */
export class UserNameUpdateEvent
{
    public static readonly NAME_UPDATE = 'unue_name_updated';

    constructor(name: string)
    {
        this._name = name;
    }

    private _name: string;

    get name(): string
    {
        return this._name;
    }
}
