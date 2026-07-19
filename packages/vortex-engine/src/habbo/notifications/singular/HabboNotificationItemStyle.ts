/**
 * Data model for notification item styling.
 * Holds icon, links, and layout/view/extra-data hints resolved from a style
 * config entry or an explicitly-provided bitmap.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as
 */
export class HabboNotificationItemStyle
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::icon
    private _icon: ImageBitmap | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::_SafeStr_8057
    private _ownsIcon: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::iconSrc
    private _iconSrc: string | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::internalLink
    private _internalLink: string | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::iconAssetUri
    private _iconAssetUri: string | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::customLayout
    private _customLayout: string | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::customView
    private _customView: string | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::extraData
    private _extraData: Record<string, unknown> | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::styleName
    private _styleName: string | null = null;

    /**
	 * @param styleMap Style config entry (from the "styles" map), used when iconAssetUri is null
	 * @param iconBitmap Explicit icon bitmap - overrides any icon resolved from styleMap
	 * @param iconAssetUri Optional icon asset URI string
	 * @param ownsIcon Whether this style owns iconBitmap and should dispose it - forced
	 * false when no iconBitmap is given, even if styleMap resolved one
	 * @param iconSrc Optional icon source string
	 * @param extraData Arbitrary per-notification data (e.g. an "id" for dedup)
	 * @param styleName The style's config key
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::HabboNotificationItemStyle()
    constructor(
        styleMap: Record<string, unknown> | null,
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::HabboNotificationItemStyle() param2
        iconBitmap: ImageBitmap | null,
        iconAssetUri: string | null,
        ownsIcon: boolean,
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::HabboNotificationItemStyle() param5
        iconSrc: string | null,
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::HabboNotificationItemStyle() param6
        extraData: Record<string, unknown> | null,
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::HabboNotificationItemStyle() param7
        styleName: string | null
    )
    {
        this._iconAssetUri = iconAssetUri;

        if(styleMap != null && iconAssetUri == null)
        {
            this._icon = (styleMap['icon'] as ImageBitmap | null) ?? null;
            this._internalLink = (styleMap['internallink'] as string | null) ?? null;
            this._customLayout = (styleMap['customlayout'] as string | null) ?? null;
            this._customView = (styleMap['customview'] as string | null) ?? null;
        }

        if(iconBitmap != null)
        {
            this._icon = iconBitmap;
            this._ownsIcon = ownsIcon;
        }
        else
        {
            this._ownsIcon = false;
        }

        this._iconSrc = iconSrc;
        this._extraData = extraData;
        this._styleName = styleName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::get icon()
    get icon(): ImageBitmap | null
    {
        return this._icon;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::get internalLink()
    get internalLink(): string | null
    {
        return this._internalLink;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::set internalLink()
    set internalLink(value: string | null)
    {
        this._internalLink = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::get iconSrc()
    get iconSrc(): string | null
    {
        return this._iconSrc;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::get iconAssetUri()
    get iconAssetUri(): string | null
    {
        return this._iconAssetUri;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::get customLayout()
    get customLayout(): string | null
    {
        return this._customLayout;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::get customView()
    get customView(): string | null
    {
        return this._customView;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::get extraData()
    get extraData(): Record<string, unknown> | null
    {
        return this._extraData;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::get styleName()
    get styleName(): string | null
    {
        return this._styleName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/HabboNotificationItemStyle.as::dispose()
    dispose(): void
    {
        if(this._ownsIcon && this._icon != null)
        {
            this._icon.close();
            this._icon = null;
        }
    }
}
