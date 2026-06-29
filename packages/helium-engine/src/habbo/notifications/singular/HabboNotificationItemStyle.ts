/**
 * Data model for notification item styling.
 * Holds icon asset URI, internal link, and icon source.
 *
 * @see source_as_win63/habbo/notifications/singular/HabboNotificationItemStyle.as
 */
export class HabboNotificationItemStyle
{
	private _ownsIcon: boolean = false;

	/**
	 * @param styleMap Optional style map containing icon and internallink keys
	 * @param iconAssetUri Optional icon asset URI string
	 * @param ownsIcon Whether this style owns its icon and should dispose it
	 * @param iconSrc Optional icon source string
	 */
	constructor(
		styleMap: Record<string, unknown> | null,
		iconAssetUri: string | null,
		ownsIcon: boolean,
		iconSrc: string | null
	)
	{
		this._iconAssetUri = iconAssetUri;

		if (styleMap != null && iconAssetUri == null)
		{
			this._iconData = styleMap;
			this._internalLink = (styleMap['internallink'] as string) ?? null;
		}

		this._ownsIcon = ownsIcon;
		this._iconSrc = iconSrc;
	}

	private _iconAssetUri: string | null = null;

	get iconAssetUri(): string | null
	{
		return this._iconAssetUri;
	}

	private _internalLink: string | null = null;

	get internalLink(): string | null
	{
		return this._internalLink;
	}

	set internalLink(value: string | null)
	{
		this._internalLink = value;
	}

	private _iconSrc: string | null = null;

	get iconSrc(): string | null
	{
		return this._iconSrc;
	}

	private _iconData: Record<string, unknown> | null = null;

	get iconData(): Record<string, unknown> | null
	{
		return this._iconData;
	}

	dispose(): void
	{
		this._iconData = null;
		this._iconAssetUri = null;
		this._internalLink = null;
		this._iconSrc = null;
	}
}
