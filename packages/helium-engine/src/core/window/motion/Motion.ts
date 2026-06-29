import type {IWindow} from '../IWindow';

/**
 * Base motion class for window animations.
 *
 * In AS3 this used a `friend` namespace for start/stop/update/tick methods.
 * In TypeScript these are public methods managed by the {@link Motions} scheduler.
 * Subclasses override update() to apply per-frame changes to the target window.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/motion/Motion.as
 */
export class Motion
{
	constructor(target: IWindow | null)
	{
		this._target = target;
	}

	protected _target: IWindow | null;

	public get target(): IWindow | null
	{
		return this._target;
	}

	public set target(value: IWindow | null)
	{
		this._target = value;
	}

	protected _running: boolean = false;

	public get running(): boolean
	{
		return this._running && this._target !== null && !this._target.disposed;
	}

	protected _complete: boolean = true;

	public get complete(): boolean
	{
		return this._complete;
	}

	protected _tag: string = '';

	public get tag(): string
	{
		return this._tag;
	}

	public set tag(value: string)
	{
		this._tag = value;
	}

	public start(): void
	{
		this._running = true;
	}

	public update(_progress: number): void
	{
	}

	public stop(): void
	{
		this._target = null;
		this._running = false;
	}

	public tick(_timestamp: number): void
	{
	}
}
