/**
 * Fired on the widget event bus whenever GuildSelectorCatalogWidget's active selection changes
 * (including a "cleared" state on dispose), carrying the chosen guild's id/badge/colors to
 * sibling widgets (GuildBadgeViewCatalogWidget, the room previewer, the purchase flow).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetGuildSelectedEvent.as
 */
export class CatalogWidgetGuildSelectedEvent
{
    static readonly NO_GUILD_SELECTED: number = -1;

    private _guildId: number;

    private _color1: string;

    private _color2: string;

    private _badgeCode: string;

    constructor(guildId: number, color1: string, color2: string, badgeCode: string)
    {
        this._guildId = guildId;
        this._color1 = color1;
        this._color2 = color2;
        this._badgeCode = badgeCode;
    }

    get type(): string
    {
        return 'GUILD_SELECTED';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetGuildSelectedEvent.as::get guildId()
    get guildId(): number
    {
        return this._guildId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetGuildSelectedEvent.as::get color1()
    get color1(): string
    {
        return this._color1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetGuildSelectedEvent.as::get color2()
    get color2(): string
    {
        return this._color2;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetGuildSelectedEvent.as::get badgeCode()
    get badgeCode(): string
    {
        return this._badgeCode;
    }
}
