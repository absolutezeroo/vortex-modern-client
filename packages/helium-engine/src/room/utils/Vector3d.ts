/**
 * Vector3d
 *
 * Based on AS3: com.sulake.room.utils.Vector3d
 *
 * A mutable 3D vector implementation with static utility methods.
 */
import type {IVector3d} from './IVector3d';

export class Vector3d implements IVector3d
{
	constructor(x: number = 0, y: number = 0, z: number = 0)
	{
		this._x = x;
		this._y = y;
		this._z = z;
	}

	private _x: number;

	get x(): number
	{
		return this._x;
	}

	set x(value: number)
	{
		this._x = value;
		this._length = NaN;
	}

	private _y: number;

	// Static utility methods

	get y(): number
	{
		return this._y;
	}

	set y(value: number)
	{
		this._y = value;
		this._length = NaN;
	}

	private _z: number;

	get z(): number
	{
		return this._z;
	}

	set z(value: number)
	{
		this._z = value;
		this._length = NaN;
	}

	private _length: number = NaN;

	get length(): number
	{
		if (isNaN(this._length))
		{
			this._length = Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
		}

		return this._length;
	}

	static sum(a: IVector3d | null, b: IVector3d | null): Vector3d | null
	{
		if (a === null || b === null)
		{
			return null;
		}

		return new Vector3d(a.x + b.x, a.y + b.y, a.z + b.z);
	}

	static dif(a: IVector3d | null, b: IVector3d | null): Vector3d | null
	{
		if (a === null || b === null)
		{
			return null;
		}

		return new Vector3d(a.x - b.x, a.y - b.y, a.z - b.z);
	}

	static product(v: IVector3d | null, scalar: number): Vector3d | null
	{
		if (v === null)
		{
			return null;
		}

		return new Vector3d(v.x * scalar, v.y * scalar, v.z * scalar);
	}

	static dotProduct(a: IVector3d | null, b: IVector3d | null): number
	{
		if (a === null || b === null)
		{
			return 0;
		}

		return a.x * b.x + a.y * b.y + a.z * b.z;
	}

	static crossProduct(a: IVector3d | null, b: IVector3d | null): Vector3d | null
	{
		if (a === null || b === null)
		{
			return null;
		}

		return new Vector3d(
			a.y * b.z - a.z * b.y,
			a.z * b.x - a.x * b.z,
			a.x * b.y - a.y * b.x
		);
	}

	static scalarProjection(a: IVector3d | null, b: IVector3d | null): number
	{
		if (a === null || b === null)
		{
			return -1;
		}

		const len = b.length;

		if (len > 0)
		{
			return (a.x * b.x + a.y * b.y + a.z * b.z) / len;
		}

		return -1;
	}

	static cosAngle(a: IVector3d | null, b: IVector3d | null): number
	{
		if (a === null || b === null)
		{
			return 0;
		}

		const lenProduct = a.length * b.length;

		if (lenProduct === 0)
		{
			return 0;
		}

		return Vector3d.dotProduct(a, b) / lenProduct;
	}

	static isEqual(a: IVector3d | null, b: IVector3d | null): boolean
	{
		if (a === null || b === null)
		{
			return false;
		}

		return a.x === b.x && a.y === b.y && a.z === b.z;
	}

	// Instance methods

	negate(): void
	{
		this._x = -this._x;
		this._y = -this._y;
		this._z = -this._z;
	}

	add(v: IVector3d | null): void
	{
		if (v === null)
		{
			return;
		}

		this._x += v.x;
		this._y += v.y;
		this._z += v.z;
		this._length = NaN;
	}

	sub(v: IVector3d | null): void
	{
		if (v === null)
		{
			return;
		}

		this._x -= v.x;
		this._y -= v.y;
		this._z -= v.z;
		this._length = NaN;
	}

	mul(scalar: number): void
	{
		this._x *= scalar;
		this._y *= scalar;
		this._z *= scalar;
		this._length = NaN;
	}

	div(scalar: number): void
	{
		if (scalar !== 0)
		{
			this._x /= scalar;
			this._y /= scalar;
			this._z /= scalar;
			this._length = NaN;
		}
	}

	assign(v: IVector3d | null): void
	{
		if (v === null)
		{
			return;
		}

		this._x = v.x;
		this._y = v.y;
		this._z = v.z;
		this._length = NaN;
	}

	toString(): string
	{
		return `(${this._x},${this._y},${this._z})`;
	}
}
