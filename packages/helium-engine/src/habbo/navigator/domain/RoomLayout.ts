import type { IWindowContainer } from '@core/window/IWindowContainer';

/**
 * Data model for a room layout (model/template).
 *
 * @see sources/win63_version/habbo/navigator/domain/RoomLayout.as
 */
export class RoomLayout
{
    private _requiredClubLevel: number;
    private _tileSize: number;
    private _name: string;
    private _view: IWindowContainer | null = null;

    constructor(requiredClubLevel: number, tileSize: number, name: string)
    {
        this._requiredClubLevel = requiredClubLevel;
        this._tileSize = tileSize;
        this._name = name;
    }

    get requiredClubLevel(): number
    {
        return this._requiredClubLevel;
    }

    get tileSize(): number
    {
        return this._tileSize;
    }

    get name(): string
    {
        return this._name;
    }

    get view(): IWindowContainer | null
    {
        return this._view;
    }

    set view(value: IWindowContainer | null)
    {
        this._view = value;
    }
}
