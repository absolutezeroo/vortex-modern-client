import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {HabboQuestEngine} from './HabboQuestEngine';
import {AchievementCategories} from './AchievementCategories';
import type {AchievementData} from './AchievementCategory';
import {UnseenAchievementsCountUpdateEvent} from './events/UnseenAchievementsCountUpdateEvent';
import {GetAchievementsComposer} from '@habbo/communication/messages/outgoing/inventory/achievements/GetAchievementsComposer';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('AchievementController');

/**
 * Achievement controller — data + the Achievements panel window.
 *
 * The click path is: toolbar/me-menu → HabboQuestEngine.showAchievements() →
 * this.show(). show() requests the achievement list; the window is built and shown
 * only once the server answers (onAchievements), matching AS3 exactly.
 *
 * Two things gate the window actually appearing, both external to this class:
 *  - the GetAchievements outgoing header is not registered in HabboMessages (unknown
 *    in every source tree — see GetAchievementsComposer), so the request is dropped; and
 *  - the reference server implements achievements as an empty stub
 *    (docs/CLIENT-SERVER-ARCHITECTURE.md §20), so no response arrives regardless.
 * The control flow here is the faithful AS3 port; it is correct-by-construction for the
 * day both are in place. Window-cell population (refresh's sub-passes) is still a TODO.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/AchievementController.as
 */
export class AchievementController implements IDisposable
{
    private _engine: HabboQuestEngine | null;
    private _unseenAchievements: Map<number, AchievementData> = new Map();
    private _initialized: boolean = false;

    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
    }

    private _categories: AchievementCategories | null = null;

    // AS3: _window — the Achievements panel, built lazily by prepareWindow(). Stays null
    // until the server sends achievements (see class note), so isVisible() is false and
    // onToolbarClick() keeps requesting.
    private _window: IWindow | null = null;

    // AS3: _SafeStr_8325 — "show once the list arrives" flag set by show()/consumed by
    // onAchievements().
    private _showPending: boolean = false;

    /**
	 * Get the achievement categories
	 */
    get categories(): AchievementCategories | null
    {
        return this._categories;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Handle achievement list received from server
	 *
	 * @param achievements Array of achievement data
	 * @param defaultCategory The default category to select
	 */
    onAchievements(achievements: AchievementData[], defaultCategory: string): void
    {
        if(this._categories === null)
        {
            this._categories = new AchievementCategories(achievements);
        }

        this._initialized = true;

        log.info(`Achievements loaded: ${achievements.length} achievements, default category: ${defaultCategory}`);

        // AS3: only surface the window if a show() is pending; otherwise this is just a
        // data refresh in the background.
        if(!this._showPending)
        {
            return;
        }

        this._showPending = false;
        this.refresh();

        if(this._window !== null)
        {
            this._window.visible = true;
            this._window.activate();
        }

        // TODO(AS3): AchievementController.as:269 selects _pendingCategorySelect ?? defaultCategory
        // via pickCategory(getCategoryByCode(...)). Pending until refresh()'s category rendering
        // and pickCategory() are ported.
    }

    /**
	 * Handle a single achievement update from the server
	 *
	 * @param data The updated achievement data
	 */
    onAchievement(data: AchievementData): void
    {
        if(this._categories === null)
        {
            return;
        }

        // Track as unseen if not already tracking this achievement
        if(!(this._unseenAchievements.has(data.achievementId)))
        {
            this._unseenAchievements.set(data.achievementId, data);
            this.broadcastUnseenAchievementsCount();
        }

        this._categories.update(data);

        log.debug(`Achievement updated: ${data.achievementId}`);
    }

    /**
	 * Ensure achievements have been requested from the server.
	 * If not yet loaded, sends the request.
	 */
    // AS3: AchievementController.as::ensureAchievementsInitialized()
    ensureAchievementsInitialized(): void
    {
        if(this._categories === null)
        {
            this.requestAchievements();
            this._initialized = true;
        }
    }

    /**
	 * Toggle the panel: open it if hidden, close it if shown.
	 */
    // AS3: AchievementController.as::onToolbarClick()
    onToolbarClick(): void
    {
        if(this.isVisible())
        {
            this.close();
        }
        else
        {
            this.show();
        }
    }

    /**
	 * Open the achievements panel.
	 *
	 * If the list has not been loaded yet, request it and defer showing the window until
	 * it arrives (onAchievements). Otherwise refresh the already-built window and show it.
	 */
    // AS3: AchievementController.as::show()
    show(): void
    {
        if(this._categories === null)
        {
            this.requestAchievements();
            this._showPending = true;
            return;
        }

        this.refresh();

        if(this._window !== null)
        {
            this._window.visible = true;
            this._window.activate();
        }
    }

    /**
	 * Close the achievements panel and clear unseen tracking.
	 */
    // AS3: AchievementController.as::close()
    close(): void
    {
        this._unseenAchievements.clear();
        this.broadcastUnseenAchievementsCount();

        if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    /**
	 * Whether the achievements panel is currently on screen.
	 */
    // AS3: AchievementController.as::isVisible()
    isVisible(): boolean
    {
        return this._window !== null && this._window.visible;
    }

    /**
	 * Send the GetAchievements request to the server.
	 */
    // AS3: AchievementController.as::show()/ensureAchievementsInitialized() → send(new GetAchievements)
    private requestAchievements(): void
    {
        this._engine?.send(new GetAchievementsComposer());
    }

    /**
	 * Rebuild the panel from the current categories.
	 */
    // AS3: AchievementController.as::refresh()
    private refresh(): void
    {
        this.prepareWindow();

        // TODO(AS3): AchievementController.as:323-333 — after prepareWindow(), refresh() runs
        // refreshCategoryList / refreshCategoryListFooter / refreshAchievementsHeader /
        // refreshAchievementList / refreshAchievementDetails, then moveAllChildrenToColumn +
        // height fit. Those depend on window child-lookup (findChildByName/findChildByTag) and a
        // ProgressBar widget that are not yet on the port's IWindow, so cell population is
        // deferred; the window shell is built but stays empty.
    }

    /**
	 * Build the Achievements window once (lazy).
	 */
    // AS3: AchievementController.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null)
        {
            return;
        }

        const windowManager = this._engine?.windowManager ?? null;

        if(windowManager === null)
        {
            return;
        }

        // AS3: _window = _questEngine.getXmlWindow("Achievements"); center(); y = 20.
        this._window = windowManager.buildWidgetLayout('Achievements');

        if(this._window === null)
        {
            log.warn('Achievements layout could not be built');
            return;
        }

        this._window.center();
        this._window.y = 20;

        // TODO(AS3): AchievementController.as:496-506 wires close/back procedures, caches the
        // five content containers (categories_cont, achievements_header_cont, achievements_cont,
        // achievement_cont, categories_footer_cont) and creates the two ProgressBar widgets. Held
        // back with refresh() until window child-lookup + ProgressBar are ported.
    }

    /**
	 * Get the user's achievement level for a given category and badge
	 *
	 * @param category The category code
	 * @param badge The badge identifier prefix
	 * @returns The user's level, or 0 if not found
	 */
    getAchievementLevel(category: string, badge: string): number
    {
        if(this._categories === null)
        {
            return 0;
        }

        const cat = this._categories.getCategoryByCode(category);

        if(cat === null)
        {
            return 0;
        }

        for(const achievement of cat.achievements)
        {
            if(achievement.badgeId.indexOf(badge) === 0)
            {
                return achievement.finalLevel ? achievement.level : Math.max(0, achievement.level - 1);
            }
        }

        return 0;
    }

    /**
	 * Broadcast the count of unseen achievements via event
	 */
    broadcastUnseenAchievementsCount(): void
    {
        if(!this._engine) return;

        const count = this._unseenAchievements.size;

        this._engine.events.emit(
            UnseenAchievementsCountUpdateEvent.TYPE,
            new UnseenAchievementsCountUpdateEvent(count)
        );

        log.debug(`Unseen achievements count: ${count}`);
    }

    /**
	 * Handle room exit - close achievement panel
	 */
    // AS3: AchievementController.as::onRoomExit() → this.close()
    onRoomExit(): void
    {
        this.close();
    }

    /**
	 * Dispose of this controller and release resources
	 */
    dispose(): void
    {
        if(this._disposed) return;

        // AS3: dispose() disposes the window before releasing data.
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }

        this._categories = null;
        this._unseenAchievements.clear();
        this._engine = null;
        this._disposed = true;
    }
}
