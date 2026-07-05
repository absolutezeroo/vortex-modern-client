/**
 * DirectionData
 *
 * @see com.sulake.habbo.room.object.visualization.data.DirectionData
 *
 * Array of LayerData per direction. Delegates get/set to individual LayerData.
 */
import {LayerData} from './LayerData';

export class DirectionData
{
    public static readonly USE_DEFAULT_DIRECTION: number = -1;

    private _layers: LayerData[];

    constructor(layerCount: number)
    {
        this._layers = [];

        for(let i = 0; i < layerCount; i++)
        {
            this._layers.push(new LayerData());
        }
    }

    get layerCount(): number
    {
        return this._layers.length;
    }

    getTag(layerIndex: number): string
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            return layer.tag;
        }

        return LayerData.DEFAULT_TAG;
    }

    setTag(layerIndex: number, value: string): void
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            layer.tag = value;
        }
    }

    getInk(layerIndex: number): number
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            return layer.ink;
        }

        return LayerData.DEFAULT_INK;
    }

    setInk(layerIndex: number, value: number): void
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            layer.ink = value;
        }
    }

    getAlpha(layerIndex: number): number
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            return layer.alpha;
        }

        return LayerData.DEFAULT_ALPHA;
    }

    setAlpha(layerIndex: number, value: number): void
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            layer.alpha = value;
        }
    }

    getIgnoreMouse(layerIndex: number): boolean
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            return layer.ignoreMouse;
        }

        return LayerData.DEFAULT_IGNORE_MOUSE;
    }

    setIgnoreMouse(layerIndex: number, value: boolean): void
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            layer.ignoreMouse = value;
        }
    }

    getXOffset(layerIndex: number): number
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            return layer.xOffset;
        }

        return LayerData.DEFAULT_X_OFFSET;
    }

    setXOffset(layerIndex: number, value: number): void
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            layer.xOffset = value;
        }
    }

    getYOffset(layerIndex: number): number
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            return layer.yOffset;
        }

        return LayerData.DEFAULT_Y_OFFSET;
    }

    setYOffset(layerIndex: number, value: number): void
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            layer.yOffset = value;
        }
    }

    getZOffset(layerIndex: number): number
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            return layer.zOffset;
        }

        return LayerData.DEFAULT_Z_OFFSET;
    }

    setZOffset(layerIndex: number, value: number): void
    {
        const layer = this.getLayer(layerIndex);

        if(layer !== null)
        {
            layer.zOffset = value;
        }
    }

    copyValues(other: DirectionData): void
    {
        if(other === null)
        {
            return;
        }

        if(this.layerCount !== other.layerCount)
        {
            return;
        }

        for(let i = 0; i < this.layerCount; i++)
        {
            const thisLayer = this.getLayer(i);
            const otherLayer = other.getLayer(i);

            if(thisLayer !== null && otherLayer !== null)
            {
                thisLayer.copyValues(otherLayer);
            }
        }
    }

    getLayer(index: number): LayerData | null
    {
        if(index < 0 || index >= this.layerCount)
        {
            return null;
        }

        return this._layers[index];
    }

    dispose(): void
    {
        this._layers = [];
    }
}
