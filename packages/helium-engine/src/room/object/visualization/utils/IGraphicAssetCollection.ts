/**
 * IGraphicAssetCollection
 *
 * @see com.sulake.room.object.visualization.utils.class_3367
 *
 * Interface for managing collections of graphic assets with palette support and reference counting.
 */
import type {Texture} from 'pixi.js';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IGraphicAsset} from './IGraphicAsset';

export interface IGraphicAssetCollection extends IDisposable
{
	addReference(): void;

	removeReference(): void;

	getReferenceCount(): number;

	getLastReferenceTimestamp(): number;

	define(data: Record<string, unknown>): boolean;

	getAsset(name: string): IGraphicAsset | null;

	getAssetWithPalette(name: string, paletteName: string): IGraphicAsset | null;

	getPaletteNames(): string[];

	// AS3: sources/win63_version/room/object/visualization/utils/class_1805.as::getPaletteColors()
	getPaletteColors(paletteName: string): [number, number] | null;

	// AS3: sources/win63_version/room/object/visualization/utils/class_1805.as::getPaletteXML()
	getPaletteXML(paletteName: string): Record<string, unknown> | null;

	addAsset(name: string, texture: Texture, override: boolean, offsetX?: number, offsetY?: number, flipH?: boolean, flipV?: boolean): boolean;

	disposeAsset(name: string): void;
}
