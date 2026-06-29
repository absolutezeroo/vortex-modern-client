import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {StuffDataBase} from './StuffDataBase';

/**
 * High score entry
 */
export interface HighScoreEntry
{
	score: number;
	users: string[];
}

/**
 * High score stuff data
 *
 * Based on AS3 com.sulake.habbo.room.object.data.HighScoreStuffData
 */
export class HighScoreStuffData extends StuffDataBase
{
	public static readonly FORMAT_KEY = 6;

	private _state: string = '';
	private _scoreType: number = 0;

	get scoreType(): number
	{
		return this._scoreType;
	}

	private _clearType: number = 0;

	get clearType(): number
	{
		return this._clearType;
	}

	private _entries: HighScoreEntry[] = [];

	get entries(): HighScoreEntry[]
	{
		return this._entries;
	}

	override initializeFromIncomingMessage(wrapper: IMessageDataWrapper): void
	{
		this._state = wrapper.readString();
		this._scoreType = wrapper.readInt();
		this._clearType = wrapper.readInt();

		const entryCount = wrapper.readInt();

		for (let i = 0; i < entryCount; i++)
		{
			const score = wrapper.readInt();
			const userCount = wrapper.readInt();
			const users: string[] = [];

			for (let j = 0; j < userCount; j++)
			{
				users.push(wrapper.readString());
			}

			this._entries.push({score, users});
		}

		super.initializeFromIncomingMessage(wrapper);
	}

	override getLegacyString(): string
	{
		return this._state;
	}
}
