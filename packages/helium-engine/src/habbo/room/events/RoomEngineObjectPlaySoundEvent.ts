/**
 * RoomEngineObjectPlaySoundEvent
 *
 * @see source_as_win63/habbo/room/events/RoomEngineObjectPlaySoundEvent.as
 *
 * Event dispatched when a room object plays a sound.
 */
import {RoomEngineObjectEvent} from './RoomEngineObjectEvent';

export class RoomEngineObjectPlaySoundEvent extends RoomEngineObjectEvent
{
	public static readonly PLAY_SOUND = 'REPSE_PLAY_SOUND';
	public static readonly PLAY_SOUND_AT_PITCH = 'REPSE_PLAY_SOUND_AT_PITCH';

	constructor(
		type: string,
		roomId: number,
		objectId: number,
		category: number,
		soundId: string,
		pitch: number = 1
	)
	{
		super(type, roomId, objectId, category);
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
