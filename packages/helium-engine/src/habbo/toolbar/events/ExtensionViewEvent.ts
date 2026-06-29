/**
 * Extension view event
 *
 * Dispatched when the toolbar extension view is resized.
 *
 * @see source_as_win63/habbo/toolbar/events/ExtensionViewEvent.as
 */
export class ExtensionViewEvent
{
	public static readonly EXTENSION_VIEW_RESIZED: string = 'EVE_EXTENSION_VIEW_RESIZED';

	constructor(type: string)
	{
		this._type = type;
	}

	private _type: string;

	/**
	 * The event type
	 */
	get type(): string
	{
		return this._type;
	}
}
