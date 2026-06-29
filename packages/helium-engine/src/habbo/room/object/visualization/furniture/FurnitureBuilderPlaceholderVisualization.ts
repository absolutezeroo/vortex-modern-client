/**
 * FurnitureBuilderPlaceholderVisualization
 *
 * @see com.sulake.habbo.room.object.visualization.furniture.FurnitureBuilderPlaceholderVisualization
 *
 * Builder placeholder - tiles furniture area by duplicating layers for sizeX * sizeY.
 */
import {FurnitureVisualization} from './FurnitureVisualization';

export class FurnitureBuilderPlaceholderVisualization extends FurnitureVisualization
{
	private _sizeX: number = -1;
	private _sizeY: number = -1;

	protected override updateModel(scale: number): boolean
	{
		const result = super.updateModel(scale);
		const model = this.object?.getModel();

		if (model !== null && model !== undefined)
		{
			const sizeX = Math.trunc(model.getNumber('furniture_size_x'));
			const sizeY = Math.trunc(model.getNumber('furniture_size_y'));

			if (sizeX !== this._sizeX || sizeY !== this._sizeY)
			{
				this._sizeX = sizeX;
				this._sizeY = sizeY;
				this.instantiateSprites(scale);
			}
		}

		return result;
	}

	protected override updateLayerCount(count: number): void
	{
		this._layerCount = count;

		if (this._sizeX * this._sizeY > 1)
		{
			this._layerCount *= this._sizeX * this._sizeY;
		}
	}

	protected override getAdditionalSpriteCount(): number
	{
		return 0;
	}

	protected override getSpriteTag(scale: number, direction: number, layerIndex: number): string
	{
		return super.getSpriteTag(scale, direction, this.getIndex(scale, layerIndex));
	}

	protected override getSpriteAlpha(scale: number, direction: number, layerIndex: number): number
	{
		return super.getSpriteAlpha(scale, direction, this.getIndex(scale, layerIndex));
	}

	protected override getSpriteColor(scale: number, layerIndex: number, colorId: number): number
	{
		return super.getSpriteColor(scale, this.getIndex(scale, layerIndex), colorId);
	}

	protected override getSpriteAssetName(scale: number, layerIndex: number): string
	{
		return super.getSpriteAssetName(scale, this.getIndex(scale, layerIndex));
	}

	protected override getSpriteXOffset(scale: number, direction: number, layerIndex: number): number
	{
		const offset = super.getSpriteXOffset(scale, direction, this.getIndex(scale, layerIndex));
		const baseLayerCount = this.data !== null ? this.data.getLayerCount(scale) : 1;
		const tileIndex = Math.trunc(layerIndex / baseLayerCount);
		const col = tileIndex % this._sizeY;
		const row = Math.trunc(tileIndex / this._sizeY);

		return offset + (col - row) * scale / 2;
	}

	protected override getSpriteYOffset(scale: number, direction: number, layerIndex: number): number
	{
		const offset = super.getSpriteYOffset(scale, direction, this.getIndex(scale, layerIndex));
		const baseLayerCount = this.data !== null ? this.data.getLayerCount(scale) : 1;
		const tileIndex = Math.trunc(layerIndex / baseLayerCount);
		const col = tileIndex % this._sizeY;
		const row = Math.trunc(tileIndex / this._sizeY);

		return offset + (col + row) * scale / 4;
	}

	protected override getSpriteMouseCapture(scale: number, direction: number, layerIndex: number): boolean
	{
		return super.getSpriteMouseCapture(scale, direction, this.getIndex(scale, layerIndex));
	}

	protected override getSpriteInk(scale: number, direction: number, layerIndex: number): number
	{
		return super.getSpriteInk(scale, direction, this.getIndex(scale, layerIndex));
	}

	protected override getSpriteZOffset(scale: number, direction: number, layerIndex: number): number
	{
		return super.getSpriteZOffset(scale, direction, this.getIndex(scale, layerIndex));
	}

	private instantiateSprites(scale: number): void
	{
		if (this.data === null)
		{
			return;
		}

		const baseLayerCount = this.data.getLayerCount(scale);
		this.updateLayerCount(baseLayerCount);
		this.createSprites(baseLayerCount * this._sizeX * this._sizeY);
		this.updateSprites(scale, true, 0);
	}

	private getIndex(scale: number, layerIndex: number): number
	{
		if (this.data !== null)
		{
			return layerIndex % this.data.getLayerCount(scale);
		}

		return layerIndex;
	}
}
