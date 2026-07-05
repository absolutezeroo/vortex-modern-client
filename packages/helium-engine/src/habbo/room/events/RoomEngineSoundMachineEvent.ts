/**
 * RoomEngineSoundMachineEvent
 *
 * @see source_as_win63/habbo/room/events/RoomEngineSoundMachineEvent.as
 *
 * Event dispatched for sound machine and jukebox state changes.
 */
import {RoomEngineObjectEvent} from './RoomEngineObjectEvent';

export class RoomEngineSoundMachineEvent extends RoomEngineObjectEvent
{
    public static readonly SOUND_MACHINE_INIT = 'ROSM_SOUND_MACHINE_INIT';
    public static readonly SOUND_MACHINE_SWITCHED_ON = 'ROSM_SOUND_MACHINE_SWITCHED_ON';
    public static readonly SOUND_MACHINE_SWITCHED_OFF = 'ROSM_SOUND_MACHINE_SWITCHED_OFF';
    public static readonly SOUND_MACHINE_DISPOSE = 'ROSM_SOUND_MACHINE_DISPOSE';
    public static readonly JUKEBOX_INIT = 'ROSM_JUKEBOX_INIT';
    public static readonly JUKEBOX_SWITCHED_ON = 'ROSM_JUKEBOX_SWITCHED_ON';
    public static readonly JUKEBOX_SWITCHED_OFF = 'ROSM_JUKEBOX_SWITCHED_OFF';
    public static readonly JUKEBOX_DISPOSE = 'ROSM_JUKEBOX_DISPOSE';

    constructor(type: string, roomId: number, objectId: number, category: number)
    {
        super(type, roomId, objectId, category);
    }
}
