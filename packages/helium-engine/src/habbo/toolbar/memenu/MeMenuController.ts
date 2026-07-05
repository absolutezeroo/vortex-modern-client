import type {HabboToolbar} from '../HabboToolbar';
import type {ToolbarView} from '../ToolbarView';
import type {MeMenuSettingsMenuView} from './MeMenuSettingsMenuView';
import {MeMenuIconLoader} from './MeMenuIconLoader';
import {HabboToolbarEvent} from '../events/HabboToolbarEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MeMenuController');

/**
 * Main me menu controller (old/legacy UI variant)
 *
 * In AS3 this manages the me menu popup with icons for profile, minimail,
 * rooms, talents, settings, achievements, guide, and clothes. Handles
 * hover state changes and click events. In Helium, UI rendering is
 * handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuController.as
 */
export class MeMenuController
{
    public static readonly USE_GUIDE_TOOL: string = 'USE_GUIDE_TOOL';
    private _toolbarView: ToolbarView | null;
    private _iconLoader: MeMenuIconLoader | null;
    private _settingsView: MeMenuSettingsMenuView | null = null;
    private _unseenItemCounters: Map<string, number> = new Map();

    constructor(toolbar: HabboToolbar, toolbarView: ToolbarView)
    {
        this._toolbar = toolbar;
        this._toolbarView = toolbarView;
        this._iconLoader = new MeMenuIconLoader(toolbar);

        this._toolbar.toolbarEvents.on(
            HabboToolbarEvent.TOOLBAR_CLICK,
            this.onToolbarClick.bind(this)
        );

        log.debug('MeMenuController constructed');
    }

    private _toolbar: HabboToolbar | null;

    /**
	 * The toolbar reference
	 */
    get toolbar(): HabboToolbar | null
    {
        return this._toolbar;
    }

    private _visible: boolean = false;

    /**
	 * Whether the me menu is visible
	 */
    get visible(): boolean
    {
        return this._visible;
    }

    private _newUiEnabled: boolean = false;

    /**
	 * Set whether the new UI is enabled (disables old me menu click handling)
	 */
    set newUiEnabled(value: boolean)
    {
        this._newUiEnabled = value;
    }

    /**
	 * Whether the me menu is disposed
	 */
    get disposed(): boolean
    {
        return this._toolbar == null;
    }

    /**
	 * Set the achievement unseen count
	 */
    set achievementCount(value: number)
    {
        this.setUnseenItemCount('achievements', value);
    }

    /**
	 * Set the minimail unseen count
	 */
    set minimailCount(value: number)
    {
        this.setUnseenItemCount('minimail', value);
    }

    /**
	 * Toggle the visibility of the me menu
	 */
    public toggleVisibility(): void
    {
        if(this._settingsView)
        {
            this._settingsView.dispose();
            this._settingsView = null;
        }

        this._visible = !this._visible;

        if(this._visible && this._toolbar)
        {
            const talentTrackEnabled = this._toolbar.getBoolean('talent.track.enabled');
            const guidesEnabled = this._toolbar.getBoolean('guides.enabled');

            if(guidesEnabled && this._toolbar.sessionDataManager)
            {
                const hasPerk = this._toolbar.sessionDataManager.isPerkAllowed(MeMenuController.USE_GUIDE_TOOL);
                // Guide tool visibility depends on perk
                log.debug(`Guide tool visibility: ${hasPerk}`);
            }

            if(!talentTrackEnabled)
            {
                // Talents section hidden
                log.debug('Talents section hidden (talent track disabled)');
            }
        }

        this.reposition();
    }

    /**
	 * Reposition the me menu relative to the toolbar
	 */
    public reposition(): void
    {
        // In AS3: window.x = toolbarView.window.width + 10
        // In AS3: window.y = toolbarView.window.bottom - window.height
        // In Helium, positioning is handled by the UI layer
    }

    /**
	 * Handle a menu item click
	 *
	 * @param itemName The clicked item name
	 */
    public onMenuItemClick(itemName: string): void
    {
        this._visible = false;

        if(!this._toolbar) return;

        switch(itemName)
        {
            case 'profile':
                // In AS3: connection.send(new GetExtendedProfileMessageComposer(userId))
                break;
            case 'minimail':
                // In AS3: HabboWebTools.openMinimail("#mail/inbox/")
                break;
            case 'rooms':
                // In AS3: toolbar.navigator.showOwnRooms()
                break;
            case 'talents':
                // In AS3: connection.send(new GetTalentTrackMessageComposer(currentTalentTrack))
                break;
            case 'settings':
                // Open settings sub-menu
                break;
            case 'achievements':
                // In AS3: toolbar.questEngine.showAchievements()
                break;
            case 'guide':
                this._toolbar.toggleWindowVisibility('GUIDE');
                break;
            case 'clothes':
                // In AS3: toolbar.context.createLinkEvent("avatareditor/open")
                break;
        }
    }

    /**
	 * Set unseen item count for a category
	 *
	 * @param category The category name
	 * @param count The count value
	 */
    public setUnseenItemCount(category: string, count: number): void
    {
        this._unseenItemCounters.set(category, count);
    }

    /**
	 * Get unseen item count for a category
	 *
	 * @param category The category name
	 * @returns The count value
	 */
    public getUnseenItemCount(category: string): number
    {
        return this._unseenItemCounters.get(category) ?? 0;
    }

    /**
	 * Dispose of this controller
	 */
    public dispose(): void
    {
        if(this.disposed) return;

        if(this._settingsView)
        {
            this._settingsView.dispose();
            this._settingsView = null;
        }

        if(this._iconLoader)
        {
            this._iconLoader.dispose();
            this._iconLoader = null;
        }

        if(this._toolbar)
        {
            this._toolbar.toolbarEvents.off(
                HabboToolbarEvent.TOOLBAR_CLICK,
                this.onToolbarClick.bind(this)
            );
        }

        this._unseenItemCounters.clear();
        this._toolbarView = null;
        this._toolbar = null;
    }

    private onToolbarClick(event: HabboToolbarEvent): void
    {
        if(this._newUiEnabled) return;

        if(event.iconId === 'HTIE_ICON_MEMENU')
        {
            this.toggleVisibility();
        }
        else
        {
            this._visible = false;

            if(this._settingsView)
            {
                this._settingsView.dispose();
                this._settingsView = null;
            }
        }
    }
}
