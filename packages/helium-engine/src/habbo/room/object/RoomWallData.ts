/**
 * RoomWallData
 *
 * Based on AS3: com.sulake.habbo.room.object.RoomWallData
 */
import {Vector3d} from '@room/utils/Vector3d';
import type {IVector3d} from '@room/utils/IVector3d';

export interface Point
{
	x: number;
	y: number;
}

export class RoomWallData
{
	public static readonly WALL_DIRECTION_VECTORS: IVector3d[] = [
		new Vector3d(1, 0, 0),
		new Vector3d(0, 1, 0),
		new Vector3d(-1, 0, 0),
		new Vector3d(0, -1, 0),
	];

	public static readonly WALL_NORMAL_VECTORS: IVector3d[] = [
		new Vector3d(0, 1, 0),
		new Vector3d(-1, 0, 0),
		new Vector3d(0, -1, 0),
		new Vector3d(1, 0, 0),
	];

	private _corners: Point[] = [];
	private _endPoints: Point[] = [];
	private _directions: number[] = [];
	private _lengths: number[] = [];
	private _leftTurns: boolean[] = [];
	private _borders: boolean[] = [];
	private _hideWalls: boolean[] = [];
	private _manuallyLeftCut: boolean[] = [];
	private _manuallyRightCut: boolean[] = [];
	private _count: number = 0;

	get count(): number
	{
		return this._count;
	}

	addWall(corner: Point, direction: number, length: number, border: boolean, leftTurn: boolean): void
	{
		if (this.checkIsNotDuplicate(corner, direction, length, border, leftTurn))
		{
			this._corners.push({x: corner.x, y: corner.y});
			this._directions.push(direction);
			this._lengths.push(length);
			this._borders.push(border);
			this._leftTurns.push(leftTurn);
			this._hideWalls.push(false);
			this._manuallyLeftCut.push(false);
			this._manuallyRightCut.push(false);
			this._count++;
		}
	}

	getCorner(index: number): Point
	{
		return this._corners[index];
	}

	getEndPoint(index: number): Point
	{
		this.calculateWallEndPoints();
		return this._endPoints[index];
	}

	getLength(index: number): number
	{
		return this._lengths[index];
	}

	getDirection(index: number): number
	{
		return this._directions[index];
	}

	getBorder(index: number): boolean
	{
		return this._borders[index];
	}

	getHideWall(index: number): boolean
	{
		return this._hideWalls[index];
	}

	getLeftTurn(index: number): boolean
	{
		return this._leftTurns[index];
	}

	getManuallyLeftCut(index: number): boolean
	{
		return this._manuallyLeftCut[index];
	}

	getManuallyRightCut(index: number): boolean
	{
		return this._manuallyRightCut[index];
	}

	setHideWall(index: number, hide: boolean): void
	{
		this._hideWalls[index] = hide;
	}

	setLength(index: number, length: number): void
	{
		if (length < this._lengths[index])
		{
			this._lengths[index] = length;
			this._manuallyRightCut[index] = true;
		}
	}

	moveCorner(index: number, distance: number): void
	{
		if (distance > 0 && distance < this._lengths[index])
		{
			const dir = RoomWallData.WALL_DIRECTION_VECTORS[this.getDirection(index)];
			this._corners[index] = {
				x: this._corners[index].x + distance * dir.x,
				y: this._corners[index].y + distance * dir.y,
			};
			this._lengths[index] -= distance;
			this._manuallyLeftCut[index] = true;
		}
	}

	private checkIsNotDuplicate(corner: Point, direction: number, length: number, border: boolean, leftTurn: boolean): boolean
	{
		for (let i = 0; i < this._count; i++)
		{
			if (this._corners[i].x === corner.x &&
				this._corners[i].y === corner.y &&
				this._directions[i] === direction &&
				this._lengths[i] === length &&
				this._borders[i] === border &&
				this._leftTurns[i] === leftTurn)
			{
				return false;
			}
		}
		return true;
	}

	private calculateWallEndPoints(): void
	{
		if (this._endPoints.length !== this._count)
		{
			this._endPoints = [];

			for (let i = 0; i < this._count; i++)
			{
				const corner = this.getCorner(i);
				const dir = RoomWallData.WALL_DIRECTION_VECTORS[this.getDirection(i)];
				const length = this.getLength(i);

				this._endPoints.push({
					x: corner.x + dir.x * length,
					y: corner.y + dir.y * length,
				});
			}
		}
	}
}
