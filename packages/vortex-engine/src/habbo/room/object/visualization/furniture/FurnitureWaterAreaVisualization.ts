/**
 * FurnitureWaterAreaVisualization
 *
 * @see com.sulake.habbo.room.object.visualization.furniture.FurnitureWaterAreaVisualization
 *
 * Water furniture with shore edge detection and mask generation.
 * Stub: full shore mask rendering requires canvas pixel manipulation.
 */
import {AnimatedFurnitureVisualization} from './AnimatedFurnitureVisualization';

export class FurnitureWaterAreaVisualization extends AnimatedFurnitureVisualization
{
    private _sizeX: number = -1;
    private _sizeY: number = -1;

    protected override updateModel(scale: number): boolean
    {
        const result = super.updateModel(scale);
        const model = this.object?.getModel();

        if(model !== null && model !== undefined)
        {
            const sizeX = Math.trunc(model.getNumber('furniture_size_x') || 0);
            const sizeY = Math.trunc(model.getNumber('furniture_size_y') || 0);

            if(sizeX !== this._sizeX || sizeY !== this._sizeY)
            {
                this._sizeX = sizeX;
                this._sizeY = sizeY;
            }
        }

        return result;
    }

    // TODO: Implement full shore edge detection using object state bits,
    // border calculation, and ShoreMaskCreatorUtility for mask generation.
}
