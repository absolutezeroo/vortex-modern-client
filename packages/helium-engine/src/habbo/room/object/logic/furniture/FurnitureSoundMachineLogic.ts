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
import type {RoomObjectDataUpdateMessage} from '@habbo/room/messages/RoomObjectDataUpdateMessage';

export class FurnitureSoundMachineLogic extends FurnitureMultiStateLogic
{
	private _wasInitialized: boolean = false;
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

		if (this.object === null)
		{
			return;
		}

		if (this.object.getModelController()?.getNumber('furniture_real_room_object') === 1)
		{
			if (!this._isInitialized)
			{
				this.requestInitialize();
			}

			const dataMessage = message as unknown as RoomObjectDataUpdateMessage;

			if (!('state' in message && 'data' in message))
			{
				return;
			}

			const state = this.object.getState(0);

			if (state !== this._lastState)
			{
				this._lastState = state;

				if (state === 1)
				{
					this.requestPlayList();
				}
				else if (state === 0)
				{
					this.requestStopPlaying();
				}
			}
		}
	}

	private requestInitialize(): void
	{
		if (this.object === null || this.eventDispatcher === null)
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

	private requestPlayList(): void
	{
		if (this.object === null || this.eventDispatcher === null)
		{
			return;
		}

		this._wasInitialized = true;

		this.eventDispatcher.emit(
			RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_START,
			new RoomObjectFurnitureActionEvent(RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_START, this.object)
		);
	}

	private requestStopPlaying(): void
	{
		if (this.object === null || this.eventDispatcher === null)
		{
			return;
		}

		this.eventDispatcher.emit(
			RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_STOP,
			new RoomObjectFurnitureActionEvent(RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_STOP, this.object)
		);
	}

	private requestDispose(): void
	{
		if (!this._wasInitialized)
		{
			return;
		}

		this.eventDispatcher?.emit(
			RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_DISPOSE,
			new RoomObjectFurnitureActionEvent(RoomObjectFurnitureActionEvent.ROFCAE_SOUND_MACHINE_DISPOSE, this.object)
		);
	}
}
