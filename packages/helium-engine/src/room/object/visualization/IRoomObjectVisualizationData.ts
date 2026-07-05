/**
 * IRoomObjectVisualizationData Interface
 *
 * Based on AS3: com.sulake.room.object.visualization.IRoomObjectVisualizationData
 *
 * Interface for visualization data that can initialize visualizations.
 */
import type {IDisposable} from '@core/runtime/IDisposable';

export interface IRoomObjectVisualizationData extends IDisposable
{
    initialize(data: unknown): boolean;
}
