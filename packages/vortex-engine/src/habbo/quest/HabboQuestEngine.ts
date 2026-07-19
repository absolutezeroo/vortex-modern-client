import type {ILinkEventTracker, IUpdateReceiver} from '@core/runtime';
import {Component, ComponentDependency, type IContext,} from '@core/runtime';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboNotifications} from '@iid/IIDHabboNotifications';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';
import {IID_HabboNewNavigator} from '@iid/IIDHabboNewNavigator';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_HabboTracking} from '@iid/IIDHabboTracking';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import {GetQuestsMessageComposer} from '@habbo/communication/messages/outgoing/quest/GetQuestsMessageComposer';
import {
    GetSeasonalQuestsOnlyMessageComposer
} from '@habbo/communication/messages/outgoing/quest/GetSeasonalQuestsOnlyMessageComposer';
import {ActivateQuestMessageComposer} from '@habbo/communication/messages/outgoing/quest/ActivateQuestMessageComposer';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboConfigurationManager} from '@habbo/configuration/IHabboConfigurationManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import {ActivityPointTypeEnum} from '@habbo/catalog/purse/ActivityPointTypeEnum';
import type {AchievementCategory} from './AchievementCategory';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import {HabboToolbarEvent} from '@habbo/toolbar/events/HabboToolbarEvent';
import {HabboToolbarIconEnum} from '@habbo/toolbar/HabboToolbarIconEnum';
import type {IHabboNotifications} from '@habbo/notifications/IHabboNotifications';
import type {IHabboHelp} from '@habbo/help/IHabboHelp';
import type {IHabboNewNavigator} from '@habbo/navigator/IHabboNewNavigator';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomEngine} from '@habbo/room';
import type {IHabboTracking} from '@habbo/tracking/IHabboTracking';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {IHabboQuestEngine} from './IHabboQuestEngine';
import {QuestController} from './QuestController';
import {AchievementController} from './AchievementController';
import {AchievementsResolutionController} from './AchievementsResolutionController';
import {RoomCompetitionController} from './RoomCompetitionController';
import {QuestMessageHandler} from './QuestMessageHandler';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('HabboQuestEngine');

/**
 * Main Quest Engine component
 *
 * Coordinates all quest subsystems: quests, achievements, resolutions,
 * and room competitions. Implements ILinkEventTracker for deep linking.
 *
 * @see source_as_win63/habbo/quest/HabboQuestEngine.as
 */
export class HabboQuestEngine extends Component implements IHabboQuestEngine, ILinkEventTracker, IUpdateReceiver
{
    private _resolutionController: AchievementsResolutionController | null = null;
    private _competitionController: RoomCompetitionController | null = null;
    private _messageHandler: QuestMessageHandler | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _localization: IHabboLocalizationManager | null = null;
    private _configuration: IHabboConfigurationManager | null = null;
    private _toolbar: IHabboToolbar | null = null;
    private _catalog: unknown | null = null;
    private _notifications: IHabboNotifications | null = null;
    private _habboHelp: IHabboHelp | null = null;
    private _navigator: IHabboNewNavigator | null = null;
    private _sessionDataManager: ISessionDataManager | null = null;
    private _roomEngine: IRoomEngine | null = null;
    private _tracking: IHabboTracking | null = null;

    // AS3: HabboQuestEngine.as::onHabboToolbarEvent() — the achievements bottom-bar icon
    // dispatches HTE_TOOLBAR_CLICK directly (independent of any me-menu popup); this is
    // the toolbar's primary path into the achievements panel.
    private readonly onHabboToolbarEvent = (event: HabboToolbarEvent): void =>
    {
        if(event.iconId === HabboToolbarIconEnum.ACHIEVEMENTS)
        {
            this._achievementController?.onToolbarClick();
        }
    };

    constructor(context: IContext)
    {
        super(context);
    }

    private _communicationManager: IHabboCommunicationManager | null = null;

    /**
	 * Get the communication manager
	 */
    get communicationManager(): IHabboCommunicationManager | null
    {
        return this._communicationManager;
    }

    // The controllers build their panel windows through this (AS3's controllers hold a
    // windowManager reference directly).
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: HabboQuestEngine.as::localization
    get localization(): IHabboLocalizationManager | null
    {
        return this._localization;
    }

    // AS3: HabboQuestEngine.as::configuration
    get configuration(): IHabboConfigurationManager | null
    {
        return this._configuration;
    }

    // AS3: HabboQuestEngine.as::getProperty()
    getProperty(key: string): string
    {
        return this._configuration?.getProperty(key) ?? '';
    }

    private _questController: QuestController | null = null;

    /**
	 * Get the quest controller
	 */
    get questController(): QuestController | null
    {
        return this._questController;
    }

    private _achievementController: AchievementController | null = null;

    /**
	 * Get the achievement controller
	 */
    get achievementController(): AchievementController | null
    {
        return this._achievementController;
    }

    private _currentlyInRoom: boolean = false;

    /**
	 * Whether the user is currently in a room
	 */
    get currentlyInRoom(): boolean
    {
        return this._currentlyInRoom;
    }

    set currentlyInRoom(value: boolean)
    {
        this._currentlyInRoom = value;
    }

    private _isFirstLoginOfDay: boolean = false;

    /**
	 * Whether this is the first login of the day
	 */
    get isFirstLoginOfDay(): boolean
    {
        return this._isFirstLoginOfDay;
    }

    /**
	 * Get the achievements resolution controller
	 */
    get achievementsResolutionController(): AchievementsResolutionController | null
    {
        return this._resolutionController;
    }

    /**
	 * Get the room competition controller
	 */
    get roomCompetitionController(): RoomCompetitionController | null
    {
        return this._competitionController;
    }

    /**
	 * The link pattern for the ILinkEventTracker interface
	 */
    get linkPattern(): string
    {
        return 'questengine/';
    }

    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communicationManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localization = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboConfigurationManager,
                (config: IHabboConfigurationManager | null) =>
                {
                    this._configuration = config;
                }
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) =>
                {
                    this._toolbar = toolbar;
                    this._toolbar?.toolbarEvents.on(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);
                },
                false
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: unknown | null) =>
                {
                    this._catalog = catalog;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboNotifications,
                (notifications: IHabboNotifications | null) =>
                {
                    this._notifications = notifications;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboHelp,
                (help: IHabboHelp | null) =>
                {
                    this._habboHelp = help;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboNewNavigator,
                (navigator: IHabboNewNavigator | null) =>
                {
                    this._navigator = navigator;
                },
                false
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) =>
                {
                    this._sessionDataManager = manager;
                }
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (engine: IRoomEngine | null) =>
                {
                    this._roomEngine = engine;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboTracking,
                (tracking: IHabboTracking | null) =>
                {
                    this._tracking = tracking;
                },
                false
            ),
        ];
    }

    /**
	 * Set the first login of day flag
	 */
    setIsFirstLoginOfDay(value: boolean): void
    {
        this._isFirstLoginOfDay = value;
    }

    /**
	 * Handle a link event matching the "questengine/" pattern
	 *
	 * @param link The full link string
	 */
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2)
        {
            return;
        }

        switch(parts[1])
        {
            case 'gotorooms':
                this.goToQuestRooms();
                break;

            case 'achievements':
                if(parts.length === 3)
                {
                    // Deep link to specific category: questengine/achievements/{category}
                    this.showAchievements();
                }
                else
                {
                    this.showAchievements();
                }
                break;

            case 'quests':
                this.showQuests();
                break;

            default:
                log.warn(`QuestEngine unknown link-type received: ${parts[1]}`);
        }
    }

    /**
	 * Send a message through the communication manager
	 *
	 * @param composer The message composer to send
	 */
    send(composer: IMessageComposer<unknown[]>): void
    {
        const connection = this._communicationManager?.connection;

        if(connection)
        {
            connection.send(composer);
        }
    }

    /**
	 * Request all quests from the server
	 */
    requestQuests(): void
    {
        // The composer exists; the "once available" comment was stale, so this sent nothing.
        this.send(new GetQuestsMessageComposer());
    }

    /**
	 * Request seasonal quests from the server
	 */
    requestSeasonalQuests(): void
    {
        this.send(new GetSeasonalQuestsOnlyMessageComposer());
    }

    /**
	 * Activate a quest by its ID
	 *
	 * @param questId The quest ID to activate
	 */
    activateQuest(questId: number): void
    {
        this.send(new ActivateQuestMessageComposer(questId));
    }

    /**
	 * Show the quests panel
	 *
	 * TODO(AS3): AS3 (HabboQuestEngine.as:522) calls
	 * `if(questController != null && !questController.questsList.isVisible())
	 * questController.onToolbarClick();` - QuestController.ts documents that its
	 * QuestsList window/view is not ported yet (see that class's own notes), so
	 * there is no `questsList`/`onToolbarClick()` to call into. The old
	 * `events.emit('showQuests')` had no listener anywhere in the client either
	 * (same "invented event, no handler" shape as the old goToQuestRooms()), so
	 * it is left out rather than kept as a misleading no-op.
	 */
    showQuests(): void
    {
        log.debug('Show quests requested (QuestsList window is not ported yet)');
    }

    /**
	 * Show the achievements panel
	 */
    showAchievements(): void
    {
        // AS3 (HabboQuestEngine.as:514) calls achievementController.show(). The old
        // emit('showAchievements') targeted a SolidJS UI that no longer exists.
        this._achievementController?.show();
    }

    /**
	 * Ensure achievements data has been requested from the server
	 */
    ensureAchievementsInitialized(): void
    {
        if(this._achievementController)
        {
            this._achievementController.ensureAchievementsInitialized();
        }
    }

    // AS3: sources/win63_version/habbo/quest/HabboQuestEngine.as::reenableRoomCompetitionWindow()
    reenableRoomCompetitionWindow(): void
    {
        if(this._competitionController)
        {
            this._competitionController.dontShowAgain = false;
        }
    }

    /**
	 * Get the user's achievement level for a given category and badge
	 *
	 * @param category The achievement category code
	 * @param badge The badge identifier
	 * @returns The user's level for the achievement, or 0 if not found
	 */
    getAchievementLevel(category: string, badge: string): number
    {
        if(this._achievementController)
        {
            return this._achievementController.getAchievementLevel(category, badge);
        }

        return 0;
    }

    /**
	 * Whether the current seasonal campaign has any quest room IDs configured.
	 *
	 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::hasQuestRoomsIds()
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::hasQuestRoomsIds()
    hasQuestRoomsIds(): boolean
    {
        const ids = this.getQuestRoomIds();

        return ids !== null && ids !== '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::getQuestRoomIds()
    private getQuestRoomIds(): string
    {
        return this._localization?.getLocalization(`quests.${this.getSeasonalCampaignCodePrefix()}.roomids`) ?? '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::getSeasonalCampaignCodePrefix()
    getSeasonalCampaignCodePrefix(): string
    {
        return this.getProperty('seasonalQuestCalendar.campaignPrefix');
    }

    /**
	 * Navigate to a random quest room from the current seasonal campaign's
	 * comma-separated room-id list.
	 *
	 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::goToQuestRooms()
	 */
    goToQuestRooms(): void
    {
        if(!this.hasQuestRoomsIds()) return;

        const ids = this.getQuestRoomIds().split(',');

        if(ids.length === 0) return;

        const index = Math.max(0, Math.min(ids.length - 1, Math.floor(Math.random() * ids.length)));
        const roomId = parseInt(ids[index], 10);

        log.debug(`Forwarding to a guest room: ${roomId}`);
        this._navigator?.goToRoom(roomId);
    }

    /**
	 * Localized display name for an achievement category code.
	 */
    // AS3: HabboQuestEngine.as::getAchievementCategoryName()
    getAchievementCategoryName(code: string): string
    {
        const key = `quests.${code}.name`;

        return this._localization?.getLocalizationWithParams(key, key) ?? key;
    }

    /**
	 * Set a category's `category_pic_bitmap` child to its category image
	 * ("achcategory_<code>_active"/"_inactive" for the big grid-cell picture, depending on
	 * whether the category has any progress; "achicon_<code>" for the small header icon).
	 *
	 * Both crypted trees (WIN63-202607011411 and win63_version) decompile the `big` branch
	 * as a flat "ach_category_" + code literal with no active/inactive ternary — the same
	 * class of literal corruption already documented in BadgeImageWidget.ts's .gif/.png
	 * fix. The unobfuscated 2016 PRODUCTION tree preserves the real literal and ternary;
	 * ported from there since a decompiler string-literal bug doesn't get "fixed" by a
	 * decade of subsequent client changes the way behavior can.
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/quest/HabboQuestEngine.as::_Str_21694()
    setupAchievementCategoryImage(container: IWindowContainer, category: AchievementCategory, big: boolean): void
    {
        const bitmap = container.findChildByName('category_pic_bitmap') as unknown as
            IStaticBitmapWrapperWindow | null;

        if(bitmap === null) return;

        const name = big
            ? `ach_category_${category.code}_${category.getProgress() > 0 ? 'active' : 'inactive'}`
            : `achicon_${category.code}`;

        bitmap.assetUri = '';
        bitmap.assetUri = '${image.library.questing.url}' + name + '.png';
    }

    /**
	 * Show/hide + populate an achievement's reward caption/amount/currency-icon row.
	 */
    // AS3: HabboQuestEngine.as::refreshReward()
    refreshReward(visible: boolean, container: IWindowContainer, pointType: number, points: number): void
    {
        const shown = pointType < 0 || points < 1 ? false : visible;

        const caption = container.findChildByName('reward_caption_txt');
        const amount = container.findChildByName('reward_amount_txt');
        const icon = container.findChildByName('currency_icon');

        if(caption === null || amount === null || icon === null) return;

        amount.visible = shown;
        caption.visible = shown;
        icon.visible = shown;

        if(!shown) return;

        amount.caption = String(points);
        HabboQuestEngine.moveChildrenToRow(container, ['reward_caption_txt', 'reward_amount_txt', 'currency_icon'], caption.x, 3);
        this.setupRewardImage(container, pointType);
    }

    /**
	 * Lay out a row of named children left-to-right starting at `startX`, skipping
	 * hidden ones, with `spacing` between each.
	 */
    // AS3: HabboQuestEngine.as::moveChildrenToRow()
    static moveChildrenToRow(container: IWindowContainer, names: string[], startX: number, spacing: number): void
    {
        let x = startX;

        for(const name of names)
        {
            const child = container.getChildByName(name);

            if(child !== null && child.visible)
            {
                child.x = x;
                x += child.width + spacing;
            }
        }
    }

    /**
	 * Style the `currency_icon` child for the given activity point type.
	 */
    // AS3: HabboQuestEngine.as::setupRewardImage()
    setupRewardImage(container: IWindowContainer, pointType: number): void
    {
        const icon = container.findChildByName('currency_icon');

        if(icon === null || this._configuration === null) return;

        icon.style = ActivityPointTypeEnum.getIconStyleFor(pointType, this._configuration, true);
    }

    /**
	 * Dispose of this engine and all controllers
	 */
    override dispose(): void
    {
        if(this.disposed) return;

        this._toolbar?.toolbarEvents.off(HabboToolbarEvent.TOOLBAR_CLICK, this.onHabboToolbarEvent);

        this.removeUpdateReceiver(this);

        // Remove link event tracker
        this.context.removeLinkEventTracker(this);

        // Dispose message handler
        if(this._messageHandler)
        {
            this._messageHandler.dispose();
            this._messageHandler = null;
        }

        // Dispose controllers
        if(this._questController)
        {
            this._questController.dispose();
            this._questController = null;
        }

        if(this._achievementController)
        {
            this._achievementController.dispose();
            this._achievementController = null;
        }

        if(this._resolutionController)
        {
            this._resolutionController.dispose();
            this._resolutionController = null;
        }

        if(this._competitionController)
        {
            this._competitionController.dispose();
            this._competitionController = null;
        }

        log.info('HabboQuestEngine disposed');

        super.dispose();
    }

    /**
	 * Called when all required dependencies are available.
	 * Creates all controllers and the message handler, registers link event tracker.
	 */
    protected override initComponent(): void
    {
        // Create controllers
        this._questController = new QuestController(this);
        this._achievementController = new AchievementController(this);
        this._resolutionController = new AchievementsResolutionController(this);
        this._competitionController = new RoomCompetitionController(this);

        // Create message handler (registers all message events)
        this._messageHandler = new QuestMessageHandler(this);

        // Register link event tracker
        this.context.addLinkEventTracker(this);

        // AS3's engine-wide per-frame ticker calls HabboQuestEngine.update() directly;
        // this port has no equivalent global hook, so register through the same
        // IUpdateReceiver mechanism other per-frame-animated managers use instead.
        this.registerUpdateReceiver(this, 10);

        log.info('HabboQuestEngine initialized');
    }

    /**
	 * Per-frame tick. Forwards to the sub-controllers AS3 drives from here.
	 */
    // AS3: HabboQuestEngine.as::update()
    // TODO(AS3): AS3 also forwards to a DailyTasksController and a RewardTrackController,
    // neither of which exist in this port yet.
    update(deltaTime: number): void
    {
        this._questController?.update(deltaTime);
        this._achievementController?.update(deltaTime);
    }
}
