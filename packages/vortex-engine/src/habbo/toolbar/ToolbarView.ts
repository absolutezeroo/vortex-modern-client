import type {HabboToolbar} from './HabboToolbar';
import type {MeMenuController} from './memenu/MeMenuController';
import {HabboToolbarIconEnum} from './HabboToolbarIconEnum';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.toolbar.ToolbarView');

/**
 * Main toolbar view that manages the vertical icon bar layout
 *
 * In AS3 this builds the toolbar UI from XML layout, manages icon visibility,
 * hover states, unseen item counters, and the me-menu controller.
 *
 * **Dead in the 2026 build, and deliberately left as a shell.** `HabboToolbar` constructs
 * `BottomBarLeft`, which constructs `MeMenuNewController`; `ToolbarView` is never constructed in
 * either tree, and `MeMenuController` only by `ToolbarView`. The whole chain is the 2023 me-menu
 * design that `MeMenuNewController` replaced. Porting its window code would be porting dead code —
 * check `BottomBarLeft`/`MeMenuNewController` before adding anything here.
 *
 * @see sources/win63_version/habbo/toolbar/ToolbarView.as
 */
export class ToolbarView
{
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::DEFAULT_LOCATION
    private static readonly DEFAULT_LOCATION = {x: 3, y: 3};
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::LANDING_VIEW_LOCATION
    private static readonly LANDING_VIEW_LOCATION = {x: 3, y: 3};
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::ICON_BG_COLOR_OVER
    private static readonly ICON_BG_COLOR_OVER: number = 0x716769;
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::ICON_BG_COLOR_OUT
    private static readonly ICON_BG_COLOR_OUT: number = 0x57504D;
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::ICON_MOUSE_OVER
    private static readonly ICON_MOUSE_OVER: string = '_hover';
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::ICON_MOUSE_OUT
    private static readonly ICON_MOUSE_OUT: string = '_normal';
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::COUNTER_MARGIN
    private static readonly COUNTER_MARGIN: number = 5;
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::ME_MENU_ICON_NAME
    private static readonly ME_MENU_ICON_NAME: string = 'icon_me_menu';
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::ICON_REGION_HEIGHT
    private static readonly ICON_REGION_HEIGHT: number = 80;
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::ICON_LABEL_HEIGHT
    private static readonly ICON_LABEL_HEIGHT: number = 20;
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::WINDOW_BOTTOM_PADDING
    private static readonly WINDOW_BOTTOM_PADDING: number = 52;
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::_toolbar
    private _toolbar: HabboToolbar | null;
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::_unseenItemCounters
    private _unseenItemCounters: Map<string, unknown> = new Map();
    private _meMenuController: MeMenuController | null = null;
    private _newItemsNotificationEnabled: boolean = false;
    private _newItemsLabelVisible: boolean = false;
    private _iconVisibility: Map<string, boolean> = new Map();
    private _position = {...ToolbarView.DEFAULT_LOCATION};
    private _visible: boolean = true;

    // DEVIATION: `onCatalogEvent()`, `setIconBitmap()`, `getIconLocation()`,
    //   `getUnseenItemCounter()` and `animateToIcon()` are the five members that need the toolbar
    //   *window*. AS3 declares each of them twice — once here and once on `BottomBarLeft`, the two
    //   bar variants — and this port builds only `BottomBarLeft`, where all five live with traces
    //   to `BottomBarLeft.as`. The check: `grep -n "getUnseenItemCounter\|animateToIcon"
    //   BottomBarLeft.ts` finds them, and nothing constructs `ToolbarView` in either tree.
    //   Duplicating them here would give this class a window it does not own, and a second
    //   `_unseenItemCounters` map competing with the live one.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/ToolbarView.as::getUnseenItemCounter()

    constructor(toolbar: HabboToolbar)
    {
        this._toolbar = toolbar;

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/toolbar/ToolbarView.as::ToolbarView()
        // AS3 resolves this to the name "PROGRESSION", which toolbar_view_xml does not contain (that
        // layout names the child "QUESTS") — so the hide is a no-op there. Kept faithful on purpose.
        this._iconVisibility.set(HabboToolbarIconEnum.getIconName('HTIE_ICON_PROGRESSION') ?? '', false);
        this._iconVisibility.set(HabboToolbarIconEnum.getIconName('HTIE_ICON_MEMENU') ?? '', false);
        this._iconVisibility.set(HabboToolbarIconEnum.getIconName('HTIE_ICON_INVENTORY') ?? '', true);

        this._newItemsNotificationEnabled = this.isNewItemsNotificationEnabled();

        log.debug('ToolbarView constructed');
    }

    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::_disposed
    private _disposed: boolean = false;

    /**
	 * Whether the view is disposed
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    private _unseenAchievementCount: number = 0;

    /**
	 * Get the unseen achievement count
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::get unseenAchievementCount()
    get unseenAchievementCount(): number
    {
        return this._unseenAchievementCount;
    }

    /**
	 * Set the unseen achievement count
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::set unseenAchievementCount()
    set unseenAchievementCount(value: number)
    {
        this._unseenAchievementCount = value;
    }

    private _unseenMiniMailMessageCount: number = 0;

    /**
	 * Get the unseen mini mail message count
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::get unseenMiniMailMessageCount()
    get unseenMiniMailMessageCount(): number
    {
        return this._unseenMiniMailMessageCount;
    }

    /**
	 * Set the unseen mini mail message count
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::set unseenMiniMailMessageCount()
    set unseenMiniMailMessageCount(value: number)
    {
        this._unseenMiniMailMessageCount = value;
    }

    /**
	 * Get the me menu controller
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::get memenu()
    get memenu(): MeMenuController | null
    {
        return this._meMenuController;
    }

    /**
	 * The link pattern for toolbar links
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::get linkPattern()
    get linkPattern(): string
    {
        return 'toolbar/';
    }

    /**
	 * Set the on duty state
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::set onDuty()
    set onDuty(value: boolean)
    {
        // Metadata only - UI layer renders the guide icon
    }

    /**
	 * Set the toolbar state and update icon visibility accordingly
	 *
	 * @param state Toolbar state identifier
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::setToolbarState()
    public setToolbarState(state: string): void
    {
        if(state === 'HTE_STATE_HIDDEN')
        {
            this._visible = false;
            return;
        }

        this._visible = true;

        switch(state)
        {
            case 'HTE_STATE_GAME_CENTER_VIEW':
                this._position = {...ToolbarView.DEFAULT_LOCATION};
                break;
            case 'HTE_STATE_HOTEL_VIEW':
                this._position = {...ToolbarView.LANDING_VIEW_LOCATION};
                break;
            case 'HTE_STATE_ROOM_VIEW':
                this._position = {...ToolbarView.DEFAULT_LOCATION};
                break;
        }

        if(this._meMenuController)
        {
            this._meMenuController.reposition();
        }
    }

    /**
	 * Set the visibility of a toolbar icon
	 *
	 * @param iconName Icon name string
	 * @param visible Whether the icon should be visible
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::iconVisibility()
    public iconVisibility(iconName: string, visible: boolean): void
    {
        this._iconVisibility.set(iconName, visible);
    }

    /**
	 * Set the unseen item count for a toolbar icon
	 *
	 * @param iconId Icon identifier
	 * @param count The count to display, 0 hides the counter
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::setUnseenItemCount()
    public setUnseenItemCount(iconId: string, count: number): void
    {
        const iconName = HabboToolbarIconEnum.getIconName(iconId);

        if(!iconName)
        {
            log.warn(`Unknown icon type for unseen item counter for iconId: ${iconId}`);
            return;
        }

        this._unseenItemCounters.set(iconId, count);
    }

    /**
	 * Check if new items notification is enabled
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::isNewItemsNotificationEnabled()
    public isNewItemsNotificationEnabled(): boolean
    {
        if(!this._toolbar) return false;
        return this._toolbar.getBoolean('toolbar.new_additions.notification.enabled');
    }

    /**
	 * Handle a received link event
	 *
	 * @param link The link string
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::linkReceived()
    public linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2) return;

        if(parts[1] === 'memenu')
        {
            this._meMenuController?.toggleVisibility();
        }
        else
        {
            log.warn(`Toolbar unknown link-type received: ${parts[1]}`);
        }
    }

    /**
	 * Dispose of this view and all its resources
	 */
    // AS3: .../src/com/sulake/habbo/toolbar/ToolbarView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._meMenuController)
        {
            this._meMenuController.dispose();
            this._meMenuController = null;
        }

        this._unseenItemCounters.clear();
        this._iconVisibility.clear();
        this._toolbar = null;
        this._disposed = true;
    }
}
