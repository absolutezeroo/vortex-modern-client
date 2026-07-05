/**
 * RoomObjectSamplePlaybackEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectSamplePlaybackEvent.as
 *
 * Event dispatched from room object for sample playback (sound machine tracks).
 */
import {RoomObjectFurnitureActionEvent} from './RoomObjectFurnitureActionEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectSamplePlaybackEvent extends RoomObjectFurnitureActionEvent
{
    public static readonly ROOM_OBJECT_INITIALIZED = 'ROPSPE_ROOM_OBJECT_INITIALIZED';
    public static readonly ROOM_OBJECT_DISPOSED = 'ROPSPE_ROOM_OBJECT_DISPOSED';
    public static readonly PLAY_SAMPLE = 'ROPSPE_PLAY_SAMPLE';
    public static readonly CHANGE_PITCH = 'ROPSPE_CHANGE_PITCH';

    constructor(type: string, object: IRoomObject, sampleId: number, pitch: number = 1)
    {
        super(type, object);
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
