/**
 * Toolbar icon ID constants and icon name mapping
 *
 * Each constant represents a toolbar icon identifier. The getIconName() method
 * maps icon IDs back to their human-readable names.
 *
 * @see source_as_win63/habbo/toolbar/HabboToolbarIconEnum.as
 */
export class HabboToolbarIconEnum
{
    public static readonly HELP: string = 'HTIE_ICON_HELP';

    public static readonly NAVIGATOR: string = 'HTIE_ICON_NAVIGATOR';

    public static readonly CATALOGUE: string = 'HTIE_ICON_CATALOGUE';

    public static readonly INVENTORY: string = 'HTIE_ICON_INVENTORY';

    public static readonly QUESTS: string = 'HTIE_ICON_QUESTS';

    public static readonly ACHIEVEMENTS: string = 'HTIE_ICON_ACHIEVEMENTS';

    public static readonly MEMENU: string = 'HTIE_ICON_MEMENU';

    public static readonly GAMES: string = 'HTIE_ICON_GAMES';

    public static readonly STORIES: string = 'HTIE_ICON_STORIES';

    public static readonly RECEPTION: string = 'HTIE_ICON_RECEPTION';

    public static readonly HOME: string = 'HTIE_ICON_HOME';

    public static readonly GUIDE: string = 'HTIE_ICON_GUIDE';

    public static readonly BUILDER: string = 'HTIE_ICON_BUILDER';

    public static readonly CAMERA: string = 'HTIE_ICON_CAMERA';

    public static readonly WIRED_MENU: string = 'HTIE_ICON_WIRED_MENU';

    public static readonly ROOMINFO: string = 'HTIE_ICON_ROOMINFO';

    public static readonly GROUP: string = 'HTIE_EXT_GROUP';

    public static readonly NAVIGATOR_ME_TAB: string = 'HTIE_ICON_NAVIGATOR_ME_TAB';

    private static readonly TOOLBAR_NAMES: Map<string, string> = new Map<string, string>([
        ['HTIE_ICON_HELP', 'HELP'],
        ['HTIE_ICON_NAVIGATOR', 'NAVIGATOR'],
        ['HTIE_ICON_CATALOGUE', 'CATALOGUE'],
        ['HTIE_ICON_INVENTORY', 'INVENTORY'],
        ['HTIE_ICON_QUESTS', 'QUESTS'],
        ['HTIE_ICON_ACHIEVEMENTS', 'ACHIEVEMENTS'],
        ['HTIE_ICON_MEMENU', 'MEMENU'],
        ['HTIE_ICON_GAMES', 'GAMES'],
        ['HTIE_ICON_STORIES', 'STORIES'],
        ['HTIE_ICON_RECEPTION', 'RECEPTION'],
        ['HTIE_ICON_HOME', 'HOME'],
        ['HTIE_ICON_GUIDE', 'GUIDE'],
        ['HTIE_ICON_BUILDER', 'BUILDER'],
        ['HTIE_ICON_CAMERA', 'CAMERA'],
        ['HTIE_ICON_WIRED_MENU', 'WIRED_MENU'],
    ]);

    /**
	 * Get the human-readable name for a toolbar icon ID
	 *
	 * @param iconId The icon identifier string
	 * @returns The icon name, or null if not found
	 */
    public static getIconName(iconId: string): string | null
    {
        return HabboToolbarIconEnum.TOOLBAR_NAMES.get(iconId) ?? null;
    }
}
