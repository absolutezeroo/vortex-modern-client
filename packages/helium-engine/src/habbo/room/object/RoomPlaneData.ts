/**
 * RoomPlaneData
 *
 * Based on AS3: com.sulake.habbo.room.object.RoomPlaneData
 */
import {Vector3d} from '@room/utils/Vector3d';
import type {IVector3d} from '@room/utils/IVector3d';
import {RoomPlaneMaskData} from './RoomPlaneMaskData';

export class RoomPlaneData
{
    public static readonly PLANE_UNDEFINED: number = 0;
    public static readonly PLANE_FLOOR: number = 1;
    public static readonly PLANE_WALL: number = 2;
    public static readonly PLANE_LANDSCAPE: number = 3;
    public static readonly PLANE_BILLBOARD: number = 4;
    private _secondaryNormals: Vector3d[] = [];
    private _masks: RoomPlaneMaskData[] = [];

    constructor(type: number, loc: IVector3d, leftSide: IVector3d, rightSide: IVector3d, secondaryNormals: IVector3d[] | null)
    {
        this._loc = new Vector3d();
        this._loc.assign(loc);

        this._leftSide = new Vector3d();
        this._leftSide.assign(leftSide);

        this._rightSide = new Vector3d();
        this._rightSide.assign(rightSide);

        this._type = type;

        if(leftSide !== null && rightSide !== null)
        {
            this._normal = Vector3d.crossProduct(leftSide, rightSide);

            if(this._normal !== null)
            {
                let angleX = 0;
                let angleY = 0;
                const angleZ = 0;

                if(this._normal.x !== 0 || this._normal.y !== 0)
                {
                    let dx = this._normal.x;
                    let dy = this._normal.y;

                    angleX = 360 + (Math.atan2(dy, dx) / Math.PI * 180);
                    if(angleX >= 360) angleX -= 360;

                    dx = Math.sqrt(this._normal.x * this._normal.x + this._normal.y * this._normal.y);
                    dy = this._normal.z;

                    angleY = 360 + (Math.atan2(dy, dx) / Math.PI * 180);
                    if(angleY >= 360) angleY -= 360;
                }
                else if(this._normal.z < 0)
                {
                    angleY = 90;
                }
                else
                {
                    angleY = 270;
                }

                this._normalDirection = new Vector3d(angleX, angleY, angleZ);
            }
        }

        if(secondaryNormals !== null && secondaryNormals.length > 0)
        {
            for(const normal of secondaryNormals)
            {
                if(normal !== null && normal.length > 0)
                {
                    const vec = new Vector3d();
                    vec.assign(normal);
                    vec.mul(1 / vec.length);
                    this._secondaryNormals.push(vec);
                }
            }
        }
    }

    private _type: number;

    get type(): number
    {
        return this._type;
    }

    private _loc: Vector3d;

    get loc(): IVector3d
    {
        return this._loc;
    }

    private _leftSide: Vector3d;

    get leftSide(): IVector3d
    {
        return this._leftSide;
    }

    private _rightSide: Vector3d;

    get rightSide(): IVector3d
    {
        return this._rightSide;
    }

    private _normal: Vector3d | null = null;

    get normal(): IVector3d | null
    {
        return this._normal;
    }

    private _normalDirection: Vector3d | null = null;

    get normalDirection(): IVector3d | null
    {
        return this._normalDirection;
    }

    get secondaryNormalCount(): number
    {
        return this._secondaryNormals.length;
    }

    get maskCount(): number
    {
        return this._masks.length;
    }

    getSecondaryNormal(index: number): IVector3d | null
    {
        if(index < 0 || index >= this.secondaryNormalCount)
        {
            return null;
        }

        const result = new Vector3d();
        result.assign(this._secondaryNormals[index]);
        return result;
    }

    addMask(leftSideLoc: number, rightSideLoc: number, leftSideLength: number, rightSideLength: number): void
    {
        const mask = new RoomPlaneMaskData(leftSideLoc, rightSideLoc, leftSideLength, rightSideLength);
        this._masks.push(mask);
    }

    getMaskLeftSideLoc(index: number): number
    {
        const mask = this.getMask(index);
        if(mask !== null) return mask.leftSideLoc;
        return -1;
    }

    getMaskRightSideLoc(index: number): number
    {
        const mask = this.getMask(index);
        if(mask !== null) return mask.rightSideLoc;
        return -1;
    }

    getMaskLeftSideLength(index: number): number
    {
        const mask = this.getMask(index);
        if(mask !== null) return mask.leftSideLength;
        return -1;
    }

    getMaskRightSideLength(index: number): number
    {
        const mask = this.getMask(index);
        if(mask !== null) return mask.rightSideLength;
        return -1;
    }

    private getMask(index: number): RoomPlaneMaskData | null
    {
        if(index < 0 || index >= this.maskCount)
        {
            return null;
        }
        return this._masks[index];
    }
}
