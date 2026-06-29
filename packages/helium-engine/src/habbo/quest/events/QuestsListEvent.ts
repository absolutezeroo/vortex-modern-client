/**
 * Event dispatched when quest list is received from the server
 *
 * @see source_as_win63/habbo/quest/events/QuestsListEvent.as
 */
export class QuestsListEvent
{
	public static readonly QUESTS_SEASONAL: string = 'qe_quests_seasonal';
	public static readonly QUESTS: string = 'qu_quests';

	constructor(type: string, quests: unknown[], openWindow: boolean)
	{
		this._type = type;
		this._quests = quests;
		this._openWindow = openWindow;
	}

	private _type: string;

	get type(): string
	{
		return this._type;
	}

	private _quests: unknown[];

	get quests(): unknown[]
	{
		return this._quests;
	}

	private _openWindow: boolean;

	get openWindow(): boolean
	{
		return this._openWindow;
	}
}
