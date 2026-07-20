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
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::_SafeStr_9135
    private static readonly QUESTS_WITH_PROMPTS: string[] = [
        'MOVEITEM', 'ENTEROTHERSROOM', 'CHANGEFIGURE', 'FINDLIFEGUARDTOWER', 'SCRATCHAPET'
    ];

    private _resolutionController: AchievementsResolutionController | null = null;
    private _competitionController: RoomCompetitionController | null = null;
    private _messageHandler: QuestMessageHandler | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _localization: IHabboLocalizationManager | null = null;
    private _configuration: IHabboConfigurationManager | null = null;
    private _toolbar: IHabboToolbar | null = null;
    // AS3: HabboQuestEngine.as::_catalog
    private _catalog: IHabboCatalog | null = null;
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::get toolbar()
    get toolbar(): IHabboToolbar | null
    {
        return this._toolbar;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::get catalog()
    get catalog(): IHabboCatalog | null
    {
        return this._catalog;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::get habboHelp()
    get habboHelp(): IHabboHelp | null
    {
        return this._habboHelp;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::get sessionDataManager()
    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
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
                (catalog: IHabboCatalog | null) =>
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
                    this._achievementController?.show();
                    this._achievementController?.selectCategoryInternalLink(parts[2]);
                    break;
                }

                this.showAchievements();
                break;

            case 'calendar':
                // TODO(AS3): AS3 calls questController.seasonalCalendarWindow.onToolbarClick() -
                // the seasonal calendar isn't ported (see QuestController's own TODOs).
                log.debug('QuestEngine "calendar" link received but the seasonal calendar is not ported');
                break;

            case 'quests':
                this._questController?.onToolbarClick();
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
	 * Show the quests panel (toggles it if already open, matching onToolbarClick()).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::showQuests()
    showQuests(): void
    {
        if(this._questController !== null && !this._questController.questsList.isVisible())
        {
            this._questController.onToolbarClick();
        }
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::getQuestRowTitle()
    getQuestRowTitle(quest: QuestMessageData): string
    {
        const key = quest.waitPeriodSeconds < 1 ? `${quest.getQuestLocalizationKey()}.name` : 'quests.list.questdelayed';

        return this._localization?.getLocalizationWithParams(key, key) ?? key;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::getQuestName()
    getQuestName(quest: QuestMessageData): string
    {
        const key = `${quest.getQuestLocalizationKey()}.name`;

        return this._localization?.getLocalizationWithParams(key, key) ?? key;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::getQuestDesc()
    getQuestDesc(quest: QuestMessageData): string
    {
        const key = `${quest.getQuestLocalizationKey()}.desc`;

        return this._localization?.getLocalizationWithParams(key, key) ?? key;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::getQuestHint()
    getQuestHint(quest: QuestMessageData): string
    {
        const key = `${quest.getQuestLocalizationKey()}.hint`;

        return this._localization?.getLocalizationWithParams(key, key) ?? key;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::getCampaignNameByCode()
    getCampaignNameByCode(code: string): string
    {
        const key = `${code}.name`;

        return this._localization?.getLocalizationWithParams(key, key) ?? key;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::getCampaignName()
    getCampaignName(quest: QuestMessageData): string
    {
        return this.getCampaignNameByCode(quest.getCampaignLocalizationKey());
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::hasLocalizedValue()
    hasLocalizedValue(key: string): boolean
    {
        return (this._localization?.getLocalizationWithParams(key, '') ?? '') !== '';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::isQuestWithPrompts()
    isQuestWithPrompts(quest: QuestMessageData): boolean
    {
        return HabboQuestEngine.QUESTS_WITH_PROMPTS.indexOf(quest.localizationCode) > -1;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::isSeasonalCalendarEnabled()
    isSeasonalCalendarEnabled(): boolean
    {
        return this._configuration?.getBoolean('seasonalQuestCalendar.enabled') ?? false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::isSeasonalQuest()
    isSeasonalQuest(quest: QuestMessageData): boolean
    {
        const prefix = this.getSeasonalCampaignCodePrefix();

        return prefix !== '' && quest.campaignCode.indexOf(prefix) === 0;
    }

    /**
	 * Open the quest's catalog page, or the catalog root if it has none.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::openCatalog()
    openCatalog(quest: QuestMessageData): void
    {
        const pageName = quest.catalogPageName;

        if(pageName !== '')
        {
            log.debug(`Questing->Open Catalog: ${pageName}`);
            this._catalog?.openCatalogPage(pageName);
        }
        else
        {
            log.debug('Questing->Open Catalog: Quest Catalog page name not defined');
            this._catalog?.openCatalog();
        }
    }

    /**
	 * Open the navigator with the quest's (or its campaign's) search tag.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::openNavigator()
    openNavigator(quest: QuestMessageData): void
    {
        const questTagKey = `${quest.getQuestLocalizationKey()}.searchtag`;
        const key = this.hasLocalizedValue(questTagKey) ? questTagKey : `${quest.getCampaignLocalizationKey()}.searchtag`;
        const tag = this._localization?.getLocalizationWithParams(key, '') ?? '';

        log.debug(`Questing->Open Navigator: ${tag}`);
        this._navigator?.performTagSearch(tag);
    }

    /**
	 * Set a quest's `quest_pic_bitmap` child to its artwork
	 * ("<campaignCode>_<localizationCode><imageVersion>[_a if it has in-room prompts]",
	 * or a generic "quest_timer_questionmark" while it's still delayed).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::setupQuestImage()
    setupQuestImage(container: IWindowContainer, quest: QuestMessageData): void
    {
        const bitmap = container.findChildByName('quest_pic_bitmap') as unknown as IStaticBitmapWrapperWindow | null;

        if(bitmap === null) return;

        const name = quest.waitPeriodSeconds > 0
            ? 'quest_timer_questionmark'
            : `${quest.campaignCode}_${quest.localizationCode}${quest.imageVersion}${this.isQuestWithPrompts(quest) ? '_a' : ''}`.toLowerCase();

        bitmap.assetUri = '${image.library.questing.url}' + name + '.png';
    }

    /**
	 * Set one of the tracker's `prompt_pic_<frame>` children ("a"/"b"/"c"/"d") to the
	 * matching in-room-prompt frame of the quest's artwork.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::setupPromptFrameImage()
    setupPromptFrameImage(container: IWindowContainer, quest: QuestMessageData, frame: string): void
    {
        const bitmap = container.findChildByName(`prompt_pic_${frame}`) as unknown as IStaticBitmapWrapperWindow | null;

        if(bitmap === null) return;

        const name = `${quest.campaignCode}_${quest.localizationCode}${quest.imageVersion}_${frame}`.toLowerCase();

        bitmap.assetUri = '${image.library.questing.url}' + name + '.png';
    }

    /**
	 * Set a `campaign_pic_bitmap` child to the quest's campaign artwork, or hide it.
	 * Seasonal quests share one campaign image per seasonal prefix instead of per code.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::setupCampaignImage()
    setupCampaignImage(container: IWindowContainer, quest: QuestMessageData, visible: boolean): void
    {
        const bitmap = container.findChildByName('campaign_pic_bitmap') as unknown as IStaticBitmapWrapperWindow | null;

        if(bitmap === null) return;

        if(!visible)
        {
            bitmap.visible = false;

            return;
        }

        bitmap.visible = true;

        const name = this.isSeasonalQuest(quest) ? `${this.getSeasonalCampaignCodePrefix()}_campaign_icon` : quest.campaignCode;

        bitmap.assetUri = '${image.library.questing.url}' + name + '.png';
    }

    /**
	 * The quest-completed celebration sparkle effect.
	 *
	 * TODO(AS3): AS3's Animation/AnimationObject/Twinkle/TwinkleImages classes (a generic
	 * sprite-sheet compositor plus 15 randomly-placed, independently-timed twinkle sprites)
	 * are not ported - QuestCompleted.ts skips the celebration effect and shows the dialog
	 * without it, which is the safe default (no missing content, just no sparkle).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/HabboQuestEngine.as::getTwinkleAnimation()
    getTwinkleAnimation(_container: IWindowContainer): null
    {
        return null;
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
