/**
 * TileCursorVisualization
 *
 * @see com.sulake.habbo.room.object.visualization.room.TileCursorVisualization
 *
 * Tile cursor with height-based Y offset for layer 1.
 */
import {AnimatedFurnitureVisualization} from '../furniture/AnimatedFurnitureVisualization';

export class TileCursorVisualization extends AnimatedFurnitureVisualization
{
    private _tileHeight: number = 0;

    get tileHeight(): number
    {
        return this._tileHeight;
    }

    set tileHeight(value: number)
    {
        this._tileHeight = value;
    }

    protected override getSpriteYOffset(scale: number, direction: number, layerIndex: number): number
    {
        if(layerIndex === 1)
        {
            const model = this.object?.getModel();

            if(model !== null && model !== undefined)
            {
                this._tileHeight = model.getNumber('tile_cursor_height') || 0;
            }

            return -this._tileHeight * (scale / 2);
        }

        return super.getSpriteYOffset(scale, direction, layerIndex);
    }
}
