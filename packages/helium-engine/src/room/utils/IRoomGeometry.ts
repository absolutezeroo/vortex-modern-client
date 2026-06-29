/**
 * IRoomGeometry Interface
 *
 * Based on AS3: com.sulake.room.utils.IRoomGeometry
 *
 * Interface for isometric room geometry calculations.
 */
import type {IVector3d} from './IVector3d';

export interface Point
{
	x: number;
	y: number;
}

export interface IRoomGeometry
{
	readonly scale: number;
	readonly directionAxis: IVector3d;
	readonly direction: IVector3d;
	readonly updateId: number;

	z_scale: number;

	getCoordinatePosition(vector: IVector3d): IVector3d | null;

	getScreenPoint(vector: IVector3d): Point | null;

	getScreenPosition(vector: IVector3d): IVector3d | null;

	getPlanePosition(point: Point, loc: IVector3d, leftSide: IVector3d, rightSide: IVector3d): Point | null;

	setDisplacement(location: IVector3d, displacement: IVector3d): void;

	adjustLocation(location: IVector3d, z: number): void;

	performZoom(): void;

	performZoomOut(): void;

	performZoomIn(): void;

	isZoomedIn(): boolean;
}
