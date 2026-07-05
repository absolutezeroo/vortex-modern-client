/**
 * Container for direction offset data in animations.
 *
 * @see sources/win63_version/habbo/avatar/animation/DirectionDataContainer.as
 */
export class DirectionDataContainer
{
    constructor(data: any)
    {
        this._offset = parseInt(data.offset) || 0;
    }

    private _offset: number;

    public get offset(): number
    {
        return this._offset;
    }
}
