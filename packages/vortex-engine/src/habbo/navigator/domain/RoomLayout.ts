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
    // AS3: sources/win63_version/habbo/navigator/domain/RoomLayout.as::_name
    private _name: string;
    private _view: IWindowContainer | null = null;

    constructor(requiredClubLevel: number, tileSize: number, name: string)
    {
        this._requiredClubLevel = requiredClubLevel;
        this._tileSize = tileSize;
        this._name = name;
    }

    // AS3: sources/win63_version/habbo/navigator/domain/RoomLayout.as::get requiredClubLevel()
    get requiredClubLevel(): number
    {
        return this._requiredClubLevel;
    }

    // AS3: sources/win63_version/habbo/navigator/domain/RoomLayout.as::get tileSize()
    get tileSize(): number
    {
        return this._tileSize;
    }

    // AS3: sources/win63_version/habbo/navigator/domain/RoomLayout.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: sources/win63_version/habbo/navigator/domain/RoomLayout.as::get view()
    get view(): IWindowContainer | null
    {
        return this._view;
    }

    // AS3: sources/win63_version/habbo/navigator/domain/RoomLayout.as::set view()
    set view(value: IWindowContainer | null)
    {
        this._view = value;
    }
}
