/**
 * Event dispatched when an avatar figure has been updated.
 *
 * @see sources/win63_version/habbo/avatar/events/AvatarUpdateEvent.as
 */
export class AvatarUpdateEvent
{
    // AS3: sources/win63_version/habbo/avatar/events/AvatarUpdateEvent.as::AVATAR_FIGURE_UPDATED
    public static readonly AVATAR_FIGURE_UPDATED: string = 'AVATAR_FIGURE_UPDATED';

    constructor(figure: string)
    {
        this._type = AvatarUpdateEvent.AVATAR_FIGURE_UPDATED;
        this._figure = figure;
    }

    private _figure: string;

    // AS3: sources/win63_version/habbo/avatar/events/AvatarUpdateEvent.as::get figure()
    public get figure(): string
    {
        return this._figure;
    }

    private _type: string;

    public get type(): string
    {
        return this._type;
    }
}
