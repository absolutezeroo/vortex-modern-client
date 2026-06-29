import type {HabboToolbar} from '../HabboToolbar';
import type {BottomBarLeft} from '../BottomBarLeft';
import type {MeMenuSettingsMenuView} from './MeMenuSettingsMenuView';
import {MeMenuNewIconLoader} from './MeMenuNewIconLoader';
import {HabboToolbarEvent} from '../events/HabboToolbarEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('MeMenuNewController');

/**
 * New me menu controller variant (modern bottom bar UI)
 *
 * In AS3 this manages the me menu popup for the new horizontal bottom bar,
 * with icons for profile, minimail, rooms, talents, settings, achievements,
 * guide, clothes, forums, and collectibles. Handles hover state changes
 * with color/grey icon toggling. In Helium, UI rendering is handled by SolidJS.
 *
 * @see sources/win63_version/habbo/toolbar/memenu/MeMenuNewController.as
 */
export class MeMenuNewController
{
	public static readonly USE_GUIDE_TOOL: string = 'USE_GUIDE_TOOL';
	private _bottomBarLeft: BottomBarLeft | null;
	private _iconLoader: MeMenuNewIconLoader | null;
	private _settingsView: MeMenuSettingsMenuView | null = null;
	private _unseenItemCounters: Map<string, number> = new Map();

	constructor(toolbar: HabboToolbar, bottomBarLeft: BottomBarLeft)
	{
		this._toolbar = toolbar;
		this._bottomBarLeft = bottomBarLeft;
		this._iconLoader = new MeMenuNewIconLoader(toolbar);

		this._toolbar.toolbarEvents.on(
			HabboToolbarEvent.TOOLBAR_CLICK,
			this.onToolbarClick.bind(this)
		);

		if (!toolbar.getBoolean('guides.enabled'))
		{
			// Guide tool hidden
		}

		if (!toolbar.getBoolean('classic.collectibles.hub.enabled') || !toolbar.getBoolean('collectibles.hub.enabled'))
		{
			// Collectibles hidden
		}

		log.debug('MeMenuNewController constructed');
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

	/**
	 * Whether the controller is disposed
	 */
	get disposed(): boolean
	{
		return this._toolbar == null;
	}

	/**
	 * Set the unseen achievements count
	 */
	set unseenAchievementsCount(value: number)
	{
		this.setUnseenItemCount('achievements', value);
	}

	/**
	 * Set the unseen minimails count
	 */
	set unseenMinimailsCount(value: number)
	{
		this.setUnseenItemCount('minimail', value);
	}

	/**
	 * Set the unseen forums count
	 */
	set unseenForumsCount(value: number)
	{
		this.setUnseenItemCount('forums', value);
	}

	/**
	 * Toggle the visibility of the me menu
	 */
	public toggleVisibility(): void
	{
		if (this._settingsView)
		{
			this._settingsView.dispose();
			this._settingsView = null;
		}

		this._visible = !this._visible;

		if (this._visible && this._toolbar)
		{
			const talentTrackEnabled = this._toolbar.getBoolean('talent.track.enabled');
			const guidesEnabled = this._toolbar.getBoolean('guides.enabled');

			if (!talentTrackEnabled)
			{
				log.debug('Talents section hidden');
			}

			if (guidesEnabled && this._toolbar.sessionDataManager)
			{
				const hasPerk = this._toolbar.sessionDataManager.isPerkAllowed(MeMenuNewController.USE_GUIDE_TOOL);
				log.debug(`Guide tool visibility: ${hasPerk}`);
			}
		}

		this.reposition();
	}

	/**
	 * Reposition the me menu relative to the bottom bar
	 */
	public reposition(): void
	{
		// In AS3: window.x = 3; window.y = bottomBarLeft.window.top - window.height
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

		if (!this._toolbar) return;

		switch (itemName)
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
				// Settings sub-menu
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
			case 'forums':
				// In AS3: toolbar.context.createLinkEvent("groupforum/list/my")
				break;
			case 'collectibles':
				// In AS3: toolbar.context.createLinkEvent("collectibles/open")
				break;
		}
	}

	/**
	 * Get icon position for a given icon id
	 *
	 * @param iconId Icon identifier
	 * @returns Rectangle or null
	 */
	public getIconPosition(iconId: string): { x: number; y: number; width: number; height: number } | null
	{
		// In Helium, icon positions are managed by the UI layer

		return null;
	}

	/**
	 * Get icon element for a given icon id
	 *
	 * @param _iconId Icon identifier
	 * @returns null - UI layer manages icons
	 */
	public getIcon(_iconId: string): unknown
	{
		return null;
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
		if (this.disposed) return;

		if (this._settingsView)
		{
			this._settingsView.dispose();
			this._settingsView = null;
		}

		if (this._iconLoader)
		{
			this._iconLoader.dispose();
			this._iconLoader = null;
		}

		if (this._toolbar)
		{
			this._toolbar.toolbarEvents.off(
				HabboToolbarEvent.TOOLBAR_CLICK,
				this.onToolbarClick.bind(this)
			);
		}

		this._unseenItemCounters.clear();
		this._bottomBarLeft = null;
		this._toolbar = null;
	}

	private onToolbarClick(event: HabboToolbarEvent): void
	{
		if (event.iconId === 'HTIE_ICON_MEMENU')
		{
			this.toggleVisibility();
		}
		else
		{
			this._visible = false;

			if (this._settingsView)
			{
				this._settingsView.dispose();
				this._settingsView = null;
			}
		}
	}
}
