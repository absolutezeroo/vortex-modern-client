/**
 * RoomObjectPlaySoundIdEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectPlaySoundIdEvent.as
 *
 * Event dispatched from room object to play a sound by ID.
 */
import {RoomObjectFurnitureActionEvent} from './RoomObjectFurnitureActionEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectPlaySoundIdEvent extends RoomObjectFurnitureActionEvent
{
	public static readonly PLAY_SOUND = 'ROPSIE_PLAY_SOUND';
	public static readonly PLAY_SOUND_AT_PITCH = 'ROPSIE_PLAY_SOUND_AT_PITCH';

	constructor(type: string, object: IRoomObject, soundId: string, pitch: number = 1)
	{
		super(type, object);
		this._soundId = soundId;
		this._pitch = pitch;
	}

	private _soundId: string;

	get soundId(): string
	{
		return this._soundId;
	}

	private _pitch: number;

	get pitch(): number
	{
		return this._pitch;
	}
}
