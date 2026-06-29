/**
 * FurnitureParticleSystemParticle
 *
 * @see com.sulake.habbo.room.object.visualization.furniture.FurnitureParticleSystemParticle
 *
 * Individual particle with position, velocity (verlet), lifetime, and fade.
 */
import type {IGraphicAsset} from '@room/object/visualization/utils/IGraphicAsset';

export class FurnitureParticleSystemParticle
{
	private _lifeTime: number = 0;
	private _fadeTime: number = 0;
	private _frames: IGraphicAsset[] | null = null;

	private _x: number = 0;

	get x(): number
	{
		return this._x;
	}

	set x(value: number)
	{
		this._x = value;
	}

	private _y: number = 0;

	get y(): number
	{
		return this._y;
	}

	set y(value: number)
	{
		this._y = value;
	}

	private _z: number = 0;

	get z(): number
	{
		return this._z;
	}

	set z(value: number)
	{
		this._z = value;
	}

	private _lastX: number = 0;

	get lastX(): number
	{
		return this._lastX;
	}

	set lastX(value: number)
	{
		this._hasMoved = true;
		this._lastX = value;
	}

	private _lastY: number = 0;

	get lastY(): number
	{
		return this._lastY;
	}

	set lastY(value: number)
	{
		this._hasMoved = true;
		this._lastY = value;
	}

	private _lastZ: number = 0;

	get lastZ(): number
	{
		return this._lastZ;
	}

	set lastZ(value: number)
	{
		this._hasMoved = true;
		this._lastZ = value;
	}

	private _hasMoved: boolean = false;

	get hasMoved(): boolean
	{
		return this._hasMoved;
	}

	private _direction: { x: number; y: number; z: number } | null = null;

	get direction(): { x: number; y: number; z: number } | null
	{
		return this._direction;
	}

	private _age: number = 0;

	get age(): number
	{
		return this._age;
	}

	private _isEmitter: boolean = false;

	get isEmitter(): boolean
	{
		return this._isEmitter;
	}

	private _fade: boolean = false;

	get fade(): boolean
	{
		return this._fade;
	}

	private _alphaMultiplier: number = 1;

	get alphaMultiplier(): number
	{
		return this._alphaMultiplier;
	}

	get isAlive(): boolean
	{
		return this._age <= this._lifeTime;
	}

	init(
		x: number, y: number, z: number,
		direction: { x: number; y: number; z: number },
		force: number, timeStep: number, lifeTime: number,
		isEmitter: boolean = false,
		frames: IGraphicAsset[] | null = null,
		fade: boolean = false
	): void
	{
		this._x = x;
		this._y = y;
		this._z = z;

		const len = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z) || 1;
		this._direction = {
			x: direction.x / len * force,
			y: direction.y / len * force,
			z: direction.z / len * force
		};

		this._lastX = this._x - this._direction.x * timeStep;
		this._lastY = this._y - this._direction.y * timeStep;
		this._lastZ = this._z - this._direction.z * timeStep;

		this._age = 0;
		this._hasMoved = false;
		this._lifeTime = lifeTime;
		this._isEmitter = isEmitter;
		this._frames = frames;
		this._fade = fade;
		this._alphaMultiplier = 1;
		this._fadeTime = 0.5 + Math.random() * 0.5;
	}

	update(): void
	{
		this._age++;

		if (this._age === this._lifeTime)
		{
			this.ignite();
		}

		if (this._fade)
		{
			if (this._age / this._lifeTime > this._fadeTime)
			{
				this._alphaMultiplier = (this._lifeTime - this._age) / (this._lifeTime * (1 - this._fadeTime));
			}
		}
	}

	getAsset(): IGraphicAsset | null
	{
		if (this._frames !== null && this._frames.length > 0)
		{
			return this._frames[this._age % this._frames.length];
		}

		return null;
	}

	dispose(): void
	{
		this._direction = null;
		this._frames = null;
	}

	copy(source: FurnitureParticleSystemParticle, scaleFactor: number): void
	{
		this._x = source._x * scaleFactor;
		this._y = source._y * scaleFactor;
		this._z = source._z * scaleFactor;
		this._lastX = source._lastX * scaleFactor;
		this._lastY = source._lastY * scaleFactor;
		this._lastZ = source._lastZ * scaleFactor;
		this._hasMoved = source._hasMoved;
		this._direction = source._direction;
		this._age = source._age;
		this._lifeTime = source._lifeTime;
		this._isEmitter = source._isEmitter;
		this._fade = source._fade;
		this._fadeTime = source._fadeTime;
		this._alphaMultiplier = source._alphaMultiplier;
	}

	protected ignite(): void
	{
		// Override in emitter subclass
	}
}
