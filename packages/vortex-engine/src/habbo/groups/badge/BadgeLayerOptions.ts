/**
 * BadgeLayerOptions
 *
 * What one badge layer currently is: which part, in which colour, on which of the 3x3
 * grid cells. `position` packs the cell back into the single int the wire uses.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/groups/badge/BadgeLayerOptions.as
 */
export class BadgeLayerOptions
{
    // AS3: .../BadgeLayerOptions.as::_SafeStr_6721
    private _layerIndex: number = -1;
    // AS3: .../BadgeLayerOptions.as::_SafeStr_7780
    private _partIndex: number = -1;
    // AS3: .../BadgeLayerOptions.as::_SafeStr_7400
    private _colorIndex: number = -1;
    // AS3: .../BadgeLayerOptions.as::_SafeStr_5928
    private _gridX: number = -1;
    // AS3: .../BadgeLayerOptions.as::_SafeStr_6086
    private _gridY: number = -1;

    // AS3: .../BadgeLayerOptions.as::setGrid()
    setGrid(position: number): void
    {
        this._gridX = Math.floor(position % 3);
        this._gridY = Math.floor(position / 3);
    }

    // AS3: .../BadgeLayerOptions.as::clone()
    clone(): BadgeLayerOptions
    {
        const copy = new BadgeLayerOptions();

        copy._layerIndex = this._layerIndex;
        copy._partIndex = this._partIndex;
        copy._colorIndex = this._colorIndex;
        copy._gridX = this._gridX;
        copy._gridY = this._gridY;

        return copy;
    }

    /**
     * True when two layers would paint the same picture — same cell, same colour, and
     * on the same side of the base/overlay split (layer 0 draws from a different part
     * list than layers 1-4, so a matching part index means nothing across that line).
     *
     * AS3: .../BadgeLayerOptions.as::equalVisuals()
     */
    equalVisuals(other: BadgeLayerOptions | null): boolean
    {
        if(other === null || this._gridX !== other.gridX || this._gridY !== other.gridY || this._colorIndex !== other.colorIndex)
        {
            return false;
        }

        if((this._layerIndex === 0 && other.layerIndex !== 0) || (this._layerIndex !== 0 && other.layerIndex === 0))
        {
            return false;
        }

        return true;
    }

    // AS3: .../BadgeLayerOptions.as::isGridEqual()
    isGridEqual(other: BadgeLayerOptions): boolean
    {
        return other.gridX === this._gridX && other.gridY === this._gridY;
    }

    // AS3: .../BadgeLayerOptions.as::get layerIndex()
    get layerIndex(): number
    {
        return this._layerIndex;
    }

    // AS3: .../BadgeLayerOptions.as::set layerIndex()
    set layerIndex(value: number)
    {
        this._layerIndex = value;
    }

    // AS3: .../BadgeLayerOptions.as::get partIndex()
    get partIndex(): number
    {
        return this._partIndex;
    }

    // AS3: .../BadgeLayerOptions.as::set partIndex()
    set partIndex(value: number)
    {
        this._partIndex = value;
    }

    // AS3: .../BadgeLayerOptions.as::get colorIndex()
    get colorIndex(): number
    {
        return this._colorIndex;
    }

    // AS3: .../BadgeLayerOptions.as::set colorIndex()
    set colorIndex(value: number)
    {
        this._colorIndex = value;
    }

    // AS3: .../BadgeLayerOptions.as::get gridX()
    get gridX(): number
    {
        return this._gridX;
    }

    // AS3: .../BadgeLayerOptions.as::set gridX()
    set gridX(value: number)
    {
        this._gridX = value;
    }

    // AS3: .../BadgeLayerOptions.as::get gridY()
    get gridY(): number
    {
        return this._gridY;
    }

    // AS3: .../BadgeLayerOptions.as::set gridY()
    set gridY(value: number)
    {
        this._gridY = value;
    }

    // AS3: .../BadgeLayerOptions.as::get position()
    get position(): number
    {
        return this._gridY * 3 + this._gridX;
    }
}
