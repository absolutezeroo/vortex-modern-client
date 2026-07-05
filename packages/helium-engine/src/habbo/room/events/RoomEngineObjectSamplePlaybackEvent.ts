/**
 * RoomEngineObjectSamplePlaybackEvent
 *
 * @see source_as_win63/habbo/room/events/RoomEngineObjectSamplePlaybackEvent.as
 *
 * Event dispatched for sample playback from room objects (sound machine, jukebox).
 */
import {RoomEngineObjectEvent} from './RoomEngineObjectEvent';

export class RoomEngineObjectSamplePlaybackEvent extends RoomEngineObjectEvent
{
    public static readonly ROOM_OBJECT_INITIALIZED = 'REOSPE_ROOM_OBJECT_INITIALIZED';
    public static readonly ROOM_OBJECT_DISPOSED = 'REOSPE_ROOM_OBJECT_DISPOSED';
    public static readonly PLAY_SAMPLE = 'REOSPE_PLAY_SAMPLE';
    public static readonly CHANGE_PITCH = 'REOSPE_CHANGE_PITCH';

    constructor(
        type: string,
        roomId: number,
        objectId: number,
        category: number,
        sampleId: number,
        pitch: number = 1
    )
    {
        super(type, roomId, objectId, category);
        this._sampleId = sampleId;
        this._pitch = pitch;
    }

    private _sampleId: number;

    get sampleId(): number
    {
        return this._sampleId;
    }

    private _pitch: number;

    get pitch(): number
    {
        return this._pitch;
    }
}
