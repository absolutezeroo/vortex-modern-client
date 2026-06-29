import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room dimmer presets message
 *
 * @see source_as_win63/habbo/communication/messages/parser/room/furniture/RoomDimmerPresetsMessageEventParser.as
 */
export class RoomDimmerPresetsMessageEventParser implements IMessageParser
{
	private _presets: DimmerPreset[] = [];

	private _selectedPresetId: number = 0;

	get selectedPresetId(): number
	{
		return this._selectedPresetId;
	}

	get presetCount(): number
	{
		return this._presets.length;
	}

	private _itemId: number = 0;

	get itemId(): number
	{
		return this._itemId;
	}

	private _isOn: boolean = false;

	get isOn(): boolean
	{
		return this._isOn;
	}

	getPreset(index: number): DimmerPreset | null
	{
		if (index < 0 || index >= this._presets.length)
		{
			return null;
		}
		return this._presets[index];
	}

	flush(): boolean
	{
		this._presets = [];
		this._selectedPresetId = 0;
		this._itemId = 0;
		this._isOn = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		const count = wrapper.readInt();
		this._selectedPresetId = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			const id = wrapper.readInt();
			const type = wrapper.readInt();
			const colorStr = wrapper.readString();
			const color = parseInt(colorStr.substr(1), 16);
			const light = wrapper.readInt();

			this._presets.push({id, type, color, light});
		}

		this._isOn = wrapper.readBoolean();
		this._itemId = wrapper.readInt();

		return true;
	}
}

export interface DimmerPreset
{
	id: number;
	type: number;
	color: number;
	light: number;
}
