/**
 * FurnitureSoundMachineLogic
 *
 * @see source_as_win63/habbo/room/object/logic/furniture/FurnitureSoundMachineLogic.as
 *
 * Logic for sound machine furniture (play/stop playlist).
 */
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';
import {RoomObjectFurnitureActionEvent} from '@habbo/room/events/RoomObjectFurnitureActionEvent';

export class FurnitureSoundMachineLogic extends FurnitureMultiStateLogic
{
    private _wasInitialized: boolean = false;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/logic/furniture/FurnitureSoundMachineLogic.as::_isInitialized
    private _isInitialized: boolean = false;
    private _lastState: number = -1;

    override getEventTypes(): string[]
    {
        const types = [
            RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_START,
            RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_STOP,
            RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_DISPOSE,
            RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_INIT
        ];

        return this.getAllEventTypes(super.getEventTypes(), types);
    }

    override dispose(): void
    {
        this.requestDispose();
        super.dispose();
    }

    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        super.processUpdateMessage(message);

        if(this.object === null)
        {
            return;
        }

        if(this.object.getModelController()?.getNumber('furniture_real_room_object') === 1)
        {
            if(!this._isInitialized)
            {
                this.requestInitialize();
            }

            if(!('state' in message && 'data' in message))
            {
                return;
            }

            const state = this.object.getState(0);

            if(state !== this._lastState)
            {
                this._lastState = state;

                if(state === 1)
                {
                    this.requestPlayList();
                }
                else if(state === 0)
                {
                    this.requestStopPlaying();
                }
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureSoundMachineLogic.as::requestInitialize()
    private requestInitialize(): void
    {
        if(this.object === null || this.eventDispatcher === null)
        {
            return;
        }

        this._wasInitialized = true;

        this.eventDispatcher.emit(
            RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_INIT,
            new RoomObjectFurnitureActionEvent(RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_INIT, this.object)
        );

        this._isInitialized = true;
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureSoundMachineLogic.as::requestPlayList()
    private requestPlayList(): void
    {
        if(this.object === null || this.eventDispatcher === null)
        {
            return;
        }

        this._wasInitialized = true;

        this.eventDispatcher.emit(
            RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_START,
            new RoomObjectFurnitureActionEvent(RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_START, this.object)
        );
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureSoundMachineLogic.as::requestStopPlaying()
    private requestStopPlaying(): void
    {
        if(this.object === null || this.eventDispatcher === null)
        {
            return;
        }

        this.eventDispatcher.emit(
            RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_STOP,
            new RoomObjectFurnitureActionEvent(RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_STOP, this.object)
        );
    }

    // AS3: .../src/com/sulake/habbo/room/object/logic/furniture/FurnitureSoundMachineLogic.as::requestDispose()
    private requestDispose(): void
    {
        if(!this._wasInitialized)
        {
            return;
        }

        this.eventDispatcher?.emit(
            RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_DISPOSE,
            new RoomObjectFurnitureActionEvent(RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_DISPOSE, this.object)
        );
    }
}
