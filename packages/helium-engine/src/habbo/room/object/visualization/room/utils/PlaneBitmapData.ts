/**
 * PlaneBitmapData
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.utils.PlaneBitmapData
 *
 * Wrapper for a rendered plane bitmap + timestamp.
 */
export class PlaneBitmapData
{
	constructor(bitmap: HTMLCanvasElement | null, timeStamp: number)
	{
		this._bitmap = bitmap;
		this._timeStamp = timeStamp;
	}

	private _bitmap: HTMLCanvasElement | null;

	get bitmap(): HTMLCanvasElement | null
	{
		return this._bitmap;
	}

	private _timeStamp: number;

	get timeStamp(): number
	{
		return this._timeStamp;
	}

	dispose(): void
	{
		this._bitmap = null;
	}
}
