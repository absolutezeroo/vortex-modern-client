import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';
import {RoomSessionDimmerPresetsEventPresetItem} from './RoomSessionDimmerPresetsEventPresetItem';

/**
 * Room session dimmer presets event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionDimmerPresetsEvent.as
 */
export class RoomSessionDimmerPresetsEvent extends RoomSessionEvent
{
	public static readonly ROOM_DIMMER_PRESETS = 'RSDPE_PRESETS';
	private _presets: RoomSessionDimmerPresetsEventPresetItem[] = [];

	constructor(type: string, session: IRoomSession, openLandingPage: boolean = false)
	{
		super(type, session, openLandingPage);
	}

	private _selectedPresetId: number = 0;

	get selectedPresetId(): number
	{
		return this._selectedPresetId;
	}

	set selectedPresetId(value: number)
	{
		this._selectedPresetId = value;
	}

	private _itemId: number = 0;

	get itemId(): number
	{
		return this._itemId;
	}

	set itemId(value: number)
	{
		this._itemId = value;
	}

	private _isOn: boolean = false;

	get isOn(): boolean
	{
		return this._isOn;
	}

	set isOn(value: boolean)
	{
		this._isOn = value;
	}

	get presetCount(): number
	{
		return this._presets.length;
	}

	storePreset(id: number, type: number, color: number, light: number): void
	{
		const preset = new RoomSessionDimmerPresetsEventPresetItem(id, type, color, light);
		this._presets[id - 1] = preset;
	}

	getPreset(index: number): RoomSessionDimmerPresetsEventPresetItem | null
	{
		if (index < 0 || index >= this._presets.length)
		{
			return null;
		}
		return this._presets[index];
	}
}
