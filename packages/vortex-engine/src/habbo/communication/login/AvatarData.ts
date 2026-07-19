/**
 * AvatarData
 *
 * @see sources/win63_2021_version/com/sulake/habbo/communication/login/AvatarData.as
 *
 * Data model for an avatar returned by the login Web API.
 * Parsed from the JSON response of /api/user/avatars.
 */
export class AvatarData
{
    private _id: number;
    private _uniqueId: string;
    private _name: string;
    private _motto: string;
    private _figure: string;
    private _gender: string;
    private _headFigure: string;
    private _lastAccess: number;
    private _habboClubMember: boolean;
    private _buildersClubMember: boolean;
    private _creationTime: string;

    constructor(data: Record<string, unknown>)
    {
        this._id = 0;
        this._uniqueId = (data.uniqueId as string) ?? '';
        this._name = (data.name as string) ?? '';
        this._motto = (data.motto as string) ?? '';
        this._figure = (data.figureString as string) ?? '';
        this._gender = (data.gender as string) ?? '';
        this._headFigure = '';
        this._lastAccess = (data.lastWebAccess as number) ?? 0;
        this._habboClubMember = data.habboClubMember === 'true' || data.habboClubMember === true;
        this._buildersClubMember = data.buildersClubMember === 'true' || data.buildersClubMember === true;
        this._creationTime = (data.creationTime as string) ?? '';
    }

    get id(): number
    {
        return this._id;
    }

    set id(value: number)
    {
        this._id = value;
    }

    get uniqueId(): string
    {
        return this._uniqueId;
    }

    get name(): string
    {
        return this._name;
    }

    set name(value: string)
    {
        this._name = value;
    }

    get motto(): string
    {
        return this._motto;
    }

    get figure(): string
    {
        return this._figure;
    }

    get gender(): string
    {
        return this._gender;
    }

    get headFigure(): string
    {
        return this._headFigure;
    }

    get lastAccess(): number
    {
        return this._lastAccess;
    }
}
