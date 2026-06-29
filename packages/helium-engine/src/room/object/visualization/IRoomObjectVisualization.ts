/**
 * IRoomObjectVisualization Interface
 *
 * Based on AS3: com.sulake.room.object.visualization.IRoomObjectVisualization
 *
 * Base interface for room object visualizations.
 */
import type {IRoomObject} from '../IRoomObject';
import type {IRoomGeometry} from '@room/utils/IRoomGeometry';
import type {IRoomObjectVisualizationData} from './IRoomObjectVisualizationData';

export interface IRoomObjectVisualization
{
	object: IRoomObject | null;
	readonly boundingRectangle: { x: number; y: number; width: number; height: number };

	dispose(): void;

	initialize(data: IRoomObjectVisualizationData): boolean;

	update(geometry: IRoomGeometry, time: number, update: boolean, skipUpdate: boolean): void;

	getInstanceId(): number;

	getUpdateID(): number;
}
