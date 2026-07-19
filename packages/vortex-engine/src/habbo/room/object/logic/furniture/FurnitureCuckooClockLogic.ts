/**
 * FurnitureCuckooClockLogic
 *
 * @see source_as_win63/habbo/room/object/logic/furniture/FurnitureCuckooClockLogic.as
 *
 * Logic for cuckoo clock furniture (plays sound at pitch based on height).
 */
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IVector3d} from '@room/utils/IVector3d';
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';
import {RoomObjectPlaySoundIdEvent} from '@habbo/room/events/RoomObjectPlaySoundIdEvent';
import type {RoomObjectDataUpdateMessage} from '@habbo/room/messages/RoomObjectDataUpdateMessage';

export class FurnitureCuckooClockLogic extends FurnitureMultiStateLogic
{
    private _state: number = -1;
    private _lastLocation: IVector3d | null = null;

    override getEventTypes(): string[]
    {
        const types = [
            RoomObjectPlaySoundIdEvent.PLAY_SOUND_AT_PITCH
        ];

        return this.getAllEventTypes(super.getEventTypes(), types);
    }

    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        super.processUpdateMessage(message);

        const dataMessage = message as unknown as RoomObjectDataUpdateMessage;

        if('state' in message && 'data' in message)
        {
            if(this._state !== -1 && dataMessage.state !== this._state)
            {
                this.playSoundAt(this._lastLocation?.z ?? 0);
            }

            this._state = dataMessage.state;
        }
        else
        {
            this._lastLocation = message.loc;
        }
    }

    private playSoundAt(height: number): void
    {
        const pitch = Math.pow(2, height - 1.2);

        this.eventDispatcher?.emit(
            RoomObjectPlaySoundIdEvent.PLAY_SOUND_AT_PITCH,
            new RoomObjectPlaySoundIdEvent(RoomObjectPlaySoundIdEvent.PLAY_SOUND_AT_PITCH, this.object!, 'FURNITURE_cuckoo_clock', pitch)
        );
    }
}
