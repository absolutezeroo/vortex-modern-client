/**
 * RoomObjectHSLColorEnableEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectHSLColorEnableEvent.as
 *
 * Event dispatched from room object to enable/change HSL background color.
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectHSLColorEnableEvent extends RoomObjectEvent
{
	public static readonly ROOM_BACKGROUND_COLOR = 'ROHSLCEE_ROOM_BACKGROUND_COLOR';

	constructor(
		type: string,
		object: IRoomObject,
		enable: boolean,
		hue: number,
		saturation: number,
		lightness: number
	)
	{
		super(type, object);
		this._enable = enable;
		this._hue = hue;
		this._saturation = saturation;
		this._lightness = lightness;
	}

	private _enable: boolean;

	get enable(): boolean
	{
		return this._enable;
	}

	private _hue: number;

	get hue(): number
	{
		return this._hue;
	}

	private _saturation: number;

	get saturation(): number
	{
		return this._saturation;
	}

	private _lightness: number;

	get lightness(): number
	{
		return this._lightness;
	}
}
