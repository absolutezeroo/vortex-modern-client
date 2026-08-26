import type {IDisposable, IUpdateReceiver} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IBitmapWrapperWindow} from '@core/window/components/IBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IAssetLibrary} from '@core/assets';
import type {AssetLoaderEvent} from '@core/assets/loaders/AssetLoaderEvent';
import {AssetLoaderEventType} from '@core/assets/loaders/AssetLoaderEvent';
import type {Texture} from 'pixi.js';
import {AvatarTextureUtils} from '@habbo/avatar/AvatarTextureUtils';
import type {HabboQuestEngine} from '../HabboQuestEngine';
// Not type-only: `getCampaignLocalizationKeyForCode()` below is a real static-method call.
import {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import type {MainWindow} from './MainWindow';
import {CalendarArrowButton} from './CalendarArrowButton';
import {CalendarBackgroundRenderer} from './CalendarBackgroundRenderer';
import {CalendarEntityStateEnums} from '../CalendarEntityStateEnums';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('habbo.quest.seasonalcalendar.Calendar');

/**
 * The seasonal calendar's scrolling day strip: one cloned `entity_template` per day, a stitched
 * scrolling background image, back/next arrows, hover/flash highlighting on the current day, and
 * click-through to that day's quest details.
 *
 * Every private-field identifier below is obfuscated in *both* crypted trees (WIN63 primary as
 * `_SafeStr_N`, win63_version as its own `var_N`) — only two of them (`_scrollOffset` /
 * `_scrollBgStartOffset`) happen to be spelled out in win63_version despite that; the rest are
 * DERIVED from usage and flagged individually below, per CLAUDE.md's rule for identifiers that
 * exist in no tree at all. Method/getter names are unobfuscated in the primary tree and used as-is.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/seasonalcalendar/Calendar.as
 */
export class Calendar implements IDisposable, IUpdateReceiver
{
    // AS3: .../Calendar.as::BG_IMAGE_PREFIX
    private static readonly BG_IMAGE_PREFIX: string = 'background_';
    // AS3: .../Calendar.as::ENTITY_IMAGE_PREFIX
    private static readonly ENTITY_IMAGE_PREFIX: string = 'day';
    // AS3: .../Calendar.as::ENTITY_IMAGE_UNCOMPLETE_POSTFIX
    private static readonly ENTITY_IMAGE_UNCOMPLETE_POSTFIX: string = '_uncomplete';
    // AS3: .../Calendar.as::ENTITY_IMAGE_COMPLETED_POSTFIX
    private static readonly ENTITY_IMAGE_COMPLETED_POSTFIX: string = '_completed';
    // AS3: .../Calendar.as::SHOW_FUTURE_INACTIVE_ENTITIES_COUNT
    private static readonly SHOW_FUTURE_INACTIVE_ENTITIES_COUNT: number = 2;
    // AS3: .../Calendar.as::_SafeStr_11743 (name DERIVED — obfuscated in every available tree).
    // How many entities before the target day `goToDay()` centres the view on.
    private static readonly GOTO_DAY_OFFSET: number = 3;
    // AS3: .../Calendar.as::ENTITY_SPACING
    private static readonly ENTITY_SPACING: number = 80;
    // AS3: .../Calendar.as::ENTITIES_LEFT_MARGIN
    private static readonly ENTITIES_LEFT_MARGIN: number = 37;
    // AS3: .../Calendar.as::_SafeStr_10641 (name DERIVED — obfuscated in every available tree).
    // The literal `7` recurs at every one of its call sites (viewport half-width, background-page
    // divisor, max-scroll margin) with no other declared 7-valued constant in the class, so all
    // four are ported as this one symbol.
    private static readonly VISIBLE_WINDOW_ENTITIES: number = 7;
    // AS3: .../Calendar.as::DAILY_REFRESH_DELAY_MINUTES
    private static readonly DAILY_REFRESH_DELAY_MINUTES: number = 5;
    // AS3: .../Calendar.as::FLASH_PULSE_LENGHT_IN_MS (AS3's own misspelling, kept verbatim)
    private static readonly FLASH_PULSE_LENGHT_IN_MS: number = 2000;
    // AS3: .../Calendar.as::FLASH_MAX_BRIGHTNESS
    private static readonly FLASH_MAX_BRIGHTNESS: number = 100;

    // AS3: .../Calendar.as::_questEngine
    private _questEngine: HabboQuestEngine | null;
    // AS3: .../Calendar.as::_SafeStr_4565 (name DERIVED — obfuscated in every available tree).
    private _mainWindow: MainWindow | null;
    // AS3: .../Calendar.as::_SafeStr_5897 (name DERIVED — obfuscated in every available tree).
    // Seasonal quests only, sorted by `sortOrder`.
    private _seasonalQuests: QuestMessageData[] = [];
    // AS3: .../Calendar.as::_backgroundImageCache
    private _backgroundImageCache: (ImageBitmap | null)[] | null = null;
    // AS3: .../Calendar.as::_graphicEntityCache
    private _graphicEntityCache: (ImageBitmap | null)[] | null = null;
    // AS3: .../Calendar.as::_SafeStr_7107 (name DERIVED — obfuscated in every available tree).
    // Asset name -> zero-based entity index, so a completed download knows which cache slot it
    // belongs to.
    private _entityAssetIndexByName: Map<string, number> = new Map();
    // AS3: .../Calendar.as::_bgAssetNameArray
    private _backgroundAssetNames: string[] = [];
    // AS3: .../Calendar.as::_SafeStr_8868 (name DERIVED — obfuscated in every available tree).
    private _imageGalleryHost: string = '';
    // AS3: .../Calendar.as::_SafeStr_5038 (name DERIVED — obfuscated in every available tree).
    private _backgroundRenderer: CalendarBackgroundRenderer | null = null;
    // AS3: .../Calendar.as::_entityWindows
    private _entityWindows: IWindowContainer[] | null = null;
    // AS3: .../Calendar.as::_states
    private _states: number[] = [];
    // AS3: .../Calendar.as::_SafeStr_6102 (name DERIVED — obfuscated in every available tree).
    private _backArrow: CalendarArrowButton | null = null;
    // AS3: .../Calendar.as::_SafeStr_5894 (name DERIVED — obfuscated in every available tree).
    private _nextArrow: CalendarArrowButton | null = null;
    // AS3: .../Calendar.as::_SafeStr_4875 (name DERIVED — obfuscated in every available tree).
    // The `calendar_cont` window every entity/background window is parented under.
    private _calendarContainer: IWindowContainer | null = null;
    // AS3: .../Calendar.as::_SafeStr_8430 (name DERIVED — obfuscated in every available tree).
    // The hidden template container each visible entity window is cloned from.
    private _entityTemplate: IWindowContainer | null = null;
    // AS3: .../Calendar.as::_SafeStr_5529 (name DERIVED — obfuscated in every available tree).
    private _backgroundSlice: IBitmapWrapperWindow | null = null;
    // AS3: .../Calendar.as::_SafeStr_4614 (name DERIVED — obfuscated in every available tree).
    // Left-edge entity index of the current view.
    private _viewIndex: number = -1;
    // AS3: .../Calendar.as::_SafeStr_5166 (name DERIVED — obfuscated in every available tree).
    // Total entity slots currently rendered (>= the highest unlocked day, capped at
    // `_maximumEntities`).
    private _entityCount: number = -1;
    // AS3: .../Calendar.as::_highestAvailableQuestIndex
    private _highestAvailableQuestIndex: number = -1;
    // AS3: .../Calendar.as::_maximumEntities
    private _maximumEntities: number = 42;

    // AS3: .../Calendar.as::_SafeStr_4903 (name DERIVED — obfuscated in every available tree).
    // TS deviation: AS3 pre-builds an idle `Timer(10, 10)` in `prepare()` purely so the
    // `_scrollAnimationHandle != null` check below never has to special-case "never started
    // yet" — `setInterval` has no such idle state, so `null` covers both "never started" and
    // "finished" here.
    private _scrollAnimationHandle: ReturnType<typeof setInterval> | null = null;
    // TS-only: tick counter for the setInterval-based replacement of AS3's `Timer(10, 10)`.
    private _scrollAnimationTick: number = 0;
    // AS3: .../Calendar.as::_scrollOffset (recovered from sources/win63_version/habbo/quest/seasonalcalendar/Calendar.as; obfuscated as `_SafeStr_5896` in the primary tree)
    private _scrollOffset: number = 0;
    // AS3: .../Calendar.as::_SafeStr_8491 (name DERIVED — obfuscated in every available tree).
    // Per-tick pixel delta while a scroll animation is running.
    private _scrollSpeed: number = 0;
    // AS3: .../Calendar.as::_scrollBgStartOffset (recovered from sources/win63_version/habbo/quest/seasonalcalendar/Calendar.as; obfuscated as `_SafeStr_7029` in the primary tree)
    private _scrollBgStartOffset: number = 0;
    // AS3: .../Calendar.as::_SafeStr_5686 (name DERIVED — obfuscated in every available tree).
    // Entity index currently pulsing its "today" highlight, or -1.
    private _flashingEntityIndex: number = -1;
    // AS3: .../Calendar.as::_SafeStr_7134 (name DERIVED — obfuscated in every available tree).
    // Milliseconds elapsed for the flash pulse's sawtooth.
    private _flashElapsedMs: number = 0;
    // AS3: .../Calendar.as::_SafeStr_7948 (name DERIVED — obfuscated in every available tree).
    // Hovered entity index, or -1.
    private _hoveredEntityIndex: number = -1;
    // AS3: .../Calendar.as::_SafeStr_8217 (name DERIVED — obfuscated in every available tree).
    private _backArrowHeld: boolean = false;
    // AS3: .../Calendar.as::_SafeStr_8275 (name DERIVED — obfuscated in every available tree).
    private _nextArrowHeld: boolean = false;
    // AS3: .../Calendar.as::_SafeStr_6250 (name DERIVED — obfuscated in every available tree).
    private _dateRefreshHandle: ReturnType<typeof setInterval> | null = null;
    // AS3: .../Calendar.as::_SafeStr_6717 (name DERIVED — obfuscated in every available tree).
    // Day-of-month last seen by the date-refresh check, so a real midnight rollover (not just
    // 5 minutes passing) triggers a re-request.
    private _lastSeenDayOfMonth: number = -1;

    // AS3: .../Calendar.as::Calendar()
    constructor(questEngine: HabboQuestEngine, mainWindow: MainWindow)
    {
        this._questEngine = questEngine;
        this._mainWindow = mainWindow;
    }

    // AS3: .../Calendar.as::adjustBrightness()
    private static adjustBrightness(color: number, delta: number): number
    {
        const r = Math.min(255, Math.max(0, ((color >> 16) & 0xFF) + delta));
        const g = Math.min(255, Math.max(0, ((color >> 8) & 0xFF) + delta));
        const b = Math.min(255, Math.max(0, (color & 0xFF) + delta));

        return ((r & 0xFF) << 16) + ((g & 0xFF) << 8) + (b & 0xFF);
    }

    // AS3: .../Calendar.as::getImageGalleryHost()
    private getImageGalleryHost(): string
    {
        return this._imageGalleryHost;
    }

    // AS3: .../Calendar.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._questEngine?.removeUpdateReceiver(this);
        this.cleanUpEntityWindows();

        this._backgroundRenderer?.dispose();
        this._backgroundRenderer = null;

        this._backArrow?.dispose();
        this._backArrow = null;

        this._nextArrow?.dispose();
        this._nextArrow = null;

        if(this._scrollAnimationHandle !== null)
        {
            clearInterval(this._scrollAnimationHandle);
            this._scrollAnimationHandle = null;
        }

        if(this._dateRefreshHandle !== null)
        {
            clearInterval(this._dateRefreshHandle);
            this._dateRefreshHandle = null;
        }

        this._backgroundImageCache = null;
        this._graphicEntityCache = null;
        this._states = [];
        this._entityAssetIndexByName = new Map();
        this._backgroundAssetNames = [];
        this._questEngine = null;
    }

    // AS3: .../Calendar.as::get disposed()
    get disposed(): boolean
    {
        return this._questEngine === null;
    }

    // AS3: .../Calendar.as::onQuests()
    onQuests(quests: QuestMessageData[]): void
    {
        const previousEntityCount = this._entityCount;

        this._seasonalQuests = [];
        this._highestAvailableQuestIndex = 0;

        for(const quest of quests)
        {
            if(this._questEngine?.isSeasonalQuest(quest))
            {
                this._seasonalQuests.push(quest);

                if(this._highestAvailableQuestIndex < quest.sortOrder - 1)
                {
                    this._highestAvailableQuestIndex = quest.sortOrder - 1;
                }
            }
        }

        this._seasonalQuests.sort((a, b) => a.sortOrder - b.sortOrder);

        this._maximumEntities = parseInt(
            this._questEngine?.getProperty('seasonalQuestCalendar.maximum.entities') ?? '',
            10
        ) || 0;

        this._entityCount = Math.min(
            this._maximumEntities,
            this._highestAvailableQuestIndex + 1 + Calendar.SHOW_FUTURE_INACTIVE_ENTITIES_COUNT
        );

        if(previousEntityCount !== -1 && this._entityCount > previousEntityCount)
        {
            this.prepareImages();
        }
    }

    // AS3: .../Calendar.as::prepare()
    prepare(container: IWindowContainer): void
    {
        this._imageGalleryHost = this._mainWindow?.getCalendarImageGalleryHost() ?? '';
        this._calendarContainer = container.findChildByName('calendar_cont') as unknown as IWindowContainer | null;
        this._backgroundSlice = container.findChildByName('background_slice') as unknown as IBitmapWrapperWindow | null;
        this._entityTemplate = container.findChildByName('entity_template') as unknown as IWindowContainer | null;

        if(this._calendarContainer === null || this._backgroundSlice === null || this._entityTemplate === null)
        {
            log.warn('SeasonalCalendar layout is missing calendar_cont/background_slice/entity_template');
        }

        if(this._entityTemplate !== null) this._entityTemplate.visible = false;

        this._backgroundRenderer = new CalendarBackgroundRenderer();

        const assets = this._questEngine?.assets ?? null;
        const backButton = (this._calendarContainer?.findChildByName('button_left') ?? null) as unknown as IBitmapWrapperWindow | null;
        const nextButton = (this._calendarContainer?.findChildByName('button_right') ?? null) as unknown as IBitmapWrapperWindow | null;

        if(backButton !== null)
        {
            this._backArrow = new CalendarArrowButton(assets, backButton, CalendarArrowButton.DIRECTION_BACK, this.scrollArrowProcedure);
        }

        if(nextButton !== null)
        {
            this._nextArrow = new CalendarArrowButton(assets, nextButton, CalendarArrowButton.DIRECTION_NEXT, this.scrollArrowProcedure);
        }

        const stripeMaskLeft = (this._calendarContainer?.findChildByName('stripe_mask_left') ?? null) as unknown as IBitmapWrapperWindow | null;
        const stripeMaskRight = (this._calendarContainer?.findChildByName('stripe_mask_right') ?? null) as unknown as IBitmapWrapperWindow | null;

        if(stripeMaskLeft) stripeMaskLeft.bitmap = Calendar.assetToImageBitmap(assets, 'stripe_mask_L');
        if(stripeMaskRight) stripeMaskRight.bitmap = Calendar.assetToImageBitmap(assets, 'stripe_mask_R');

        if(this._viewIndex === -1) this.goToDay(this._mainWindow?.currentDay ?? 0);

        this.prepareImages();

        this._lastSeenDayOfMonth = new Date().getDate();
        this._dateRefreshHandle = setInterval(
            () => this.onDateRefreshTimer(),
            60000 * Calendar.DAILY_REFRESH_DELAY_MINUTES
        );
        this.onDateRefreshTimer();

        this._questEngine?.registerUpdateReceiver(this, 1);
    }

    // TS-only: shared conversion from this port's Texture-backed asset library to the
    // ImageBitmap IBitmapWrapperWindow.bitmap expects; AS3 reads BitmapData off the asset
    // directly.
    private static assetToImageBitmap(assets: IAssetLibrary | null, name: string): ImageBitmap | null
    {
        const texture = (assets?.getAssetByName(name)?.content ?? null) as Texture | null;

        return AvatarTextureUtils.toImageBitmap(texture);
    }

    // AS3: .../Calendar.as::close()
    close(): void
    {
        this.cleanUpEntityWindows();
        this._backgroundRenderer?.initializeImageChain([]);
    }

    // AS3: .../Calendar.as::refresh()
    refresh(): void
    {
        for(const quest of this._seasonalQuests)
        {
            const index = quest.sortOrder - 1;
            const newState = quest.completedCampaign ? CalendarEntityStateEnums.COMPLETED : this._states[index];

            if(newState !== this._states[index])
            {
                this.retrieveEntityImageAsset(quest.sortOrder, newState);
                this.updateEntityIndicatorPanel(index, false);

                if(newState === CalendarEntityStateEnums.COMPLETED && this._flashingEntityIndex === index)
                {
                    this.stopFlashing();
                }
            }
        }

        this.initializeBackgroundRendererIfAllImagesInCache();
        this.initializeEntitiesIfAllImagesInCache();
    }

    // AS3: .../Calendar.as::goToDay()
    goToDay(day: number): void
    {
        this.scrollToIndex(Math.max(0, Math.min(day - Calendar.GOTO_DAY_OFFSET, this.maxScrollRightIndex)));
    }

    // AS3: .../Calendar.as::prepareImages()
    private prepareImages(): void
    {
        const backgroundPageCount = Math.ceil(this._entityCount / Calendar.VISIBLE_WINDOW_ENTITIES) + 1;

        this._backgroundAssetNames = new Array(backgroundPageCount);
        this._backgroundImageCache = new Array(backgroundPageCount).fill(null);
        this._graphicEntityCache = new Array(this._entityCount).fill(null);
        this._states = new Array(this._entityCount);

        const placeholders: ImageBitmap[] = [];

        for(let i = 0; i < backgroundPageCount; i++)
        {
            placeholders.push(Calendar.makeOpaqueWhiteBitmap(640, 320));
        }

        this._backgroundRenderer?.initializeImageChain(placeholders);

        for(let index = this.firstBgIndex; index <= this.lastBgIndex; index++)
        {
            this.retrieveBackgroundImageAsset(index);
        }

        for(const quest of this._seasonalQuests)
        {
            if(quest.sortOrder <= this._maximumEntities)
            {
                const state = quest.completedCampaign ? CalendarEntityStateEnums.COMPLETED : CalendarEntityStateEnums.ACTIVE;
                const isVisible = quest.sortOrder - 1 >= this.firstVisibleIndex && quest.sortOrder - 1 <= this.lastVisibleIndex;

                this.retrieveEntityImageAsset(quest.sortOrder, state, !isVisible);
            }
        }

        if(this._seasonalQuests.length < this._entityCount)
        {
            for(let index = this._highestAvailableQuestIndex + 1; index < this._entityCount; index++)
            {
                this.retrieveEntityImageAsset(index + 1, CalendarEntityStateEnums.INACTIVE, index > this.lastVisibleIndex);
            }
        }

        for(let index = 0; index < this._entityCount; index++)
        {
            if(this._states[index] === undefined)
            {
                this.retrieveEntityImageAsset(
                    index + 1,
                    CalendarEntityStateEnums.EXPIRED,
                    index < this.firstVisibleIndex || index > this.lastVisibleIndex
                );
            }
        }
    }

    // AS3: .../Calendar.as::initializeBackgroundRendererIfAllImagesInCache()
    private initializeBackgroundRendererIfAllImagesInCache(): void
    {
        if(!this.areViewableBackgroundBitmapsInitialized() || this._backgroundImageCache === null) return;

        const missingIndices: number[] = [];
        const images: ImageBitmap[] = [];

        for(let i = 0; i < this._backgroundImageCache.length; i++)
        {
            const image = this._backgroundImageCache[i];

            if(image !== null)
            {
                images.push(image);
            }
            else
            {
                images.push(Calendar.makeOpaqueWhiteBitmap(640, 320));
                missingIndices.push(i);
            }
        }

        this._backgroundRenderer?.initializeImageChain(images);
        this.assignCurrentBackgroundSlice();

        for(const index of missingIndices)
        {
            this.retrieveBackgroundImageAsset(index);
        }
    }

    // AS3: .../Calendar.as::cleanUpEntityWindows()
    private cleanUpEntityWindows(): void
    {
        if(this._entityWindows === null) return;

        for(const window of this._entityWindows)
        {
            this._calendarContainer?.removeChild(window);
            window.dispose();
        }

        this._entityWindows = null;
    }

    // AS3: .../Calendar.as::initializeEntitiesIfAllImagesInCache()
    private initializeEntitiesIfAllImagesInCache(): void
    {
        if(!this.areViewableEntityBitmapsInitialized() || this._graphicEntityCache === null) return;

        this.cleanUpEntityWindows();

        this._entityWindows = [];

        const missingIndices: number[] = [];

        for(const image of this._graphicEntityCache)
        {
            const clone = (this._entityTemplate?.clone() ?? null) as unknown as IWindowContainer | null;

            if(clone === null) continue;

            const index = this._entityWindows.length;

            if(image !== null)
            {
                const bitmap = clone.findChildByName('entity_bitmap') as unknown as IBitmapWrapperWindow | null;

                if(bitmap !== null)
                {
                    bitmap.width = image.width;
                    bitmap.height = image.height;
                    bitmap.bitmap = image;
                }
            }
            else
            {
                missingIndices.push(index);
            }

            const mouseRegion = clone.getChildByName('entity_mouse_region');

            if(mouseRegion !== null)
            {
                mouseRegion.procedure = this.entityMouseRegionWindowProcedure;

                if(
                    this._states[index] === CalendarEntityStateEnums.INACTIVE ||
                    this._states[index] === CalendarEntityStateEnums.COMPLETED ||
                    this._states[index] === CalendarEntityStateEnums.EXPIRED
                )
                {
                    mouseRegion.visible = false;
                }
            }

            clone.visible = true;
            this._calendarContainer?.addChild(clone);
            this._entityWindows.push(clone);
            this.updateEntityIndicatorPanel(index, false);
        }

        this.repositionEntityWrappers();
        this.updateEntityVisibilities();

        const stripeMaskLeft = this._calendarContainer?.findChildByName('stripe_mask_left') ?? null;
        const stripeMaskRight = this._calendarContainer?.findChildByName('stripe_mask_right') ?? null;
        const buttonLeft = this._calendarContainer?.findChildByName('button_left') ?? null;
        const buttonRight = this._calendarContainer?.findChildByName('button_right') ?? null;

        if(stripeMaskLeft !== null && this._calendarContainer) this._calendarContainer.setChildIndex(stripeMaskLeft, this._calendarContainer.numChildren - 1);
        if(stripeMaskRight !== null && this._calendarContainer) this._calendarContainer.setChildIndex(stripeMaskRight, this._calendarContainer.numChildren - 1);
        if(buttonLeft !== null && this._calendarContainer) this._calendarContainer.setChildIndex(buttonLeft, this._calendarContainer.numChildren - 1);
        if(buttonRight !== null && this._calendarContainer) this._calendarContainer.setChildIndex(buttonRight, this._calendarContainer.numChildren - 1);

        for(const index of missingIndices)
        {
            this.retrieveEntityImageAsset(index + 1, this._states[index]);
        }

        const currentDay = this._mainWindow?.currentDay ?? 0;

        if(this._states[currentDay - 1] === CalendarEntityStateEnums.ACTIVE)
        {
            this.startFlashingAtIndex(currentDay - 1);
        }
    }

    // AS3: .../Calendar.as::get firstVisibleIndex()
    private get firstVisibleIndex(): number
    {
        const index = this._viewIndex - 1;

        return index < 0 ? 0 : index;
    }

    // AS3: .../Calendar.as::get lastVisibleIndex()
    private get lastVisibleIndex(): number
    {
        const index = this._viewIndex + Calendar.VISIBLE_WINDOW_ENTITIES + 1;
        const max = this._entityCount - 1;

        return index > max ? max : index;
    }

    // AS3: .../Calendar.as::areViewableEntityBitmapsInitialized()
    private areViewableEntityBitmapsInitialized(): boolean
    {
        if(this._graphicEntityCache === null) return false;

        for(let index = this.firstVisibleIndex; index <= this.lastVisibleIndex; index++)
        {
            if(this._graphicEntityCache[index] === null) return false;
        }

        return true;
    }

    // AS3: .../Calendar.as::get firstBgIndex()
    private get firstBgIndex(): number
    {
        const offset = this.getBackgroundSliceOffset(this._viewIndex);
        const index = this._backgroundRenderer?.getImageIndexForOffset(offset) ?? -1;

        return index < 0 ? 0 : index;
    }

    // AS3: .../Calendar.as::get lastBgIndex()
    private get lastBgIndex(): number
    {
        const offset = this.getBackgroundSliceOffset(this._viewIndex);

        return this._backgroundRenderer?.getImageIndexForOffset(offset + 640) ?? -1;
    }

    // AS3: .../Calendar.as::areViewableBackgroundBitmapsInitialized()
    private areViewableBackgroundBitmapsInitialized(): boolean
    {
        if(this._backgroundImageCache === null) return false;

        for(let index = this.firstBgIndex; index <= this.lastBgIndex; index++)
        {
            if(this._backgroundImageCache[index] === null) return false;
        }

        return true;
    }

    // AS3: .../Calendar.as::updateEntityIndicatorPanel()
    private updateEntityIndicatorPanel(index: number, hovering: boolean): void
    {
        if(this._entityWindows === null || this._entityWindows.length < index - 1) return;

        const entityWindow = this._entityWindows[index];
        const indicator = entityWindow.findChildByName('entity_indicator');

        if(indicator === null) return;

        let color = CalendarEntityStateEnums.INDICATOR_COLOR[this._states[index]] ?? 0;

        if(hovering) color += 2105376;

        if(this._flashingEntityIndex !== index) indicator.color = color;

        const status = entityWindow.findChildByName('entity_indicator_status') as unknown as IBitmapWrapperWindow | null;

        if(status !== null)
        {
            if(this._states[index] === CalendarEntityStateEnums.COMPLETED)
            {
                status.bitmap = Calendar.assetToImageBitmap(this._questEngine?.assets ?? null, 'calendar_quest_complete');
            }
            else
            {
                status.bitmap = null;
            }
        }

        const text = (indicator as unknown as IWindowContainer).findChildByName('entity_indicator_text') as ITextWindow | null;

        if(text !== null)
        {
            const quest = this.getQuestByEntityWindowIndex(index);

            if(quest !== null)
            {
                text.text = this._questEngine?.getCampaignName(quest) ?? '';
            }
            else
            {
                const key = QuestMessageData.getCampaignLocalizationKeyForCode(
                    `${this._questEngine?.getSeasonalCampaignCodePrefix() ?? ''}_${index + 1}`
                );

                text.text = this._questEngine?.getCampaignNameByCode(key) ?? '';
            }
        }
    }

    // AS3: .../Calendar.as::retrieveEntityImageAsset()
    private retrieveEntityImageAsset(oneBasedIndex: number, state: number, skipLoad: boolean = false): void
    {
        let name = `${Calendar.ENTITY_IMAGE_PREFIX}${oneBasedIndex}`;

        switch(state)
        {
            case CalendarEntityStateEnums.ACTIVE:
            case CalendarEntityStateEnums.INACTIVE:
            case CalendarEntityStateEnums.EXPIRED:
                name += Calendar.ENTITY_IMAGE_UNCOMPLETE_POSTFIX;
                break;

            case CalendarEntityStateEnums.COMPLETED:
                name += Calendar.ENTITY_IMAGE_COMPLETED_POSTFIX;
                break;
        }

        this._states[oneBasedIndex - 1] = state;
        this._entityAssetIndexByName.set(name, oneBasedIndex - 1);

        const asset = this._questEngine?.assets?.getAssetByName(name) ?? null;

        if(asset !== null)
        {
            this.assignEntityBitmapToCacheByAssetName(name);
            this.initializeEntitiesIfAllImagesInCache();
        }
        else if(!skipLoad)
        {
            this.loadAssetFromImageGallery(name, () => this.onEntityImageAssetDownloaded(name));
        }
    }

    // AS3: .../Calendar.as::retrieveBackgroundImageAsset()
    private retrieveBackgroundImageAsset(zeroBasedIndex: number): void
    {
        const name = `${Calendar.BG_IMAGE_PREFIX}${zeroBasedIndex + 1}`;

        this._backgroundAssetNames[zeroBasedIndex] = name;

        const asset = this._questEngine?.assets?.getAssetByName(name) ?? null;

        if(asset !== null)
        {
            this.assignBackgroundBitmapToCacheByAssetName(name);
            this.initializeBackgroundRendererIfAllImagesInCache();
        }
        else
        {
            this.loadAssetFromImageGallery(name, () => this.onBackgroundImageAssetDownloaded(name));
        }
    }

    /**
     * TS deviation: AS3 binds the *same* callback to both `AssetLoaderEventComplete` and
     * `AssetLoaderEventError` (a failed download still resolves through
     * `assignXBitmapToCacheByAssetName()`'s null-content fallback), and reads the asset name back
     * off `event.target`. This port's `AssetLoaderEvent` carries no target, so the name is passed
     * in directly and the single callback fires for either outcome.
     */
    // AS3: .../Calendar.as::loadAssetFromImageGallery()
    private loadAssetFromImageGallery(name: string, onSettled: () => void): void
    {
        const url = `${this.getImageGalleryHost()}${name}.png`;
        const loader = this._questEngine?.assets?.loadAssetFromFile(name, url, 'image/png') ?? null;

        if(loader === null || loader.disposed) return;

        loader.events.on('event', (event: AssetLoaderEvent) =>
        {
            if(event.type === AssetLoaderEventType.COMPLETE || event.type === AssetLoaderEventType.ERROR)
            {
                onSettled();
            }
        });
    }

    // AS3: .../Calendar.as::onBackgroundImageAssetDownloaded()
    private onBackgroundImageAssetDownloaded(name: string): void
    {
        this.assignBackgroundBitmapToCacheByAssetName(name);
        this.initializeBackgroundRendererIfAllImagesInCache();
    }

    // AS3: .../Calendar.as::onEntityImageAssetDownloaded()
    private onEntityImageAssetDownloaded(name: string): void
    {
        this.assignEntityBitmapToCacheByAssetName(name);
        this.initializeEntitiesIfAllImagesInCache();
    }

    // AS3: .../Calendar.as::assignBackgroundBitmapToCacheByAssetName()
    private assignBackgroundBitmapToCacheByAssetName(name: string): void
    {
        const index = this._backgroundAssetNames.indexOf(name);

        if(index === -1 || this._backgroundImageCache === null) return;

        this._backgroundImageCache[index] = Calendar.assetToImageBitmap(this._questEngine?.assets ?? null, name)
            ?? Calendar.makeOpaqueWhiteBitmap(640, 320);
    }

    /**
     * AS3 reads `int(_entityAssetIndexByName[name])`, and AS3's `int(undefined)` for a missing
     * key is `0`, not `-1` — so the `idx == -1` guard below can never trigger through a missing
     * key (only if `-1` were ever stored, which `retrieveEntityImageAsset()` never does). Ported
     * literally with `?? 0` rather than the more defensive `?? -1`.
     */
    // AS3: .../Calendar.as::assignEntityBitmapToCacheByAssetName()
    private assignEntityBitmapToCacheByAssetName(name: string): void
    {
        if(this._graphicEntityCache === null) return;

        const index = this._entityAssetIndexByName.get(name) ?? 0;

        if(index === -1 || index >= this._graphicEntityCache.length) return;

        this._graphicEntityCache[index] = Calendar.assetToImageBitmap(this._questEngine?.assets ?? null, name)
            ?? Calendar.makeTransparentBitmap(1, 1);
    }

    // AS3: .../Calendar.as::repositionEntityWrappers()
    private repositionEntityWrappers(): void
    {
        if(this._entityWindows === null) return;

        for(let index = 0; index < this._entityWindows.length; index++)
        {
            this._entityWindows[index].x = (index - this._viewIndex) * Calendar.ENTITY_SPACING
                + this._scrollOffset + Calendar.ENTITIES_LEFT_MARGIN;
        }
    }

    // AS3: .../Calendar.as::getBackgroundSliceOffset()
    private getBackgroundSliceOffset(index: number): number
    {
        return index * Calendar.ENTITY_SPACING;
    }

    // AS3: .../Calendar.as::assignCurrentBackgroundSlice()
    private assignCurrentBackgroundSlice(): void
    {
        if(this._backgroundRenderer === null || this._backgroundSlice === null || this._calendarContainer === null) return;

        const slice = this._backgroundRenderer.getSlice(this.getBackgroundSliceOffset(this._viewIndex), this._calendarContainer.width);

        this._backgroundSlice.x = 0;
        this._backgroundSlice.width = slice.width;
        this._backgroundSlice.height = slice.height;
        this._backgroundSlice.bitmap = slice;
    }

    // AS3: .../Calendar.as::assignScrollableBackgroundSlice()
    private assignScrollableBackgroundSlice(targetIndex: number): void
    {
        if(this._backgroundRenderer === null || this._backgroundSlice === null || this._calendarContainer === null) return;

        let slice: ImageBitmap;

        if(targetIndex < this._viewIndex)
        {
            const stepsBack = this._viewIndex - targetIndex;
            const offset = this.getBackgroundSliceOffset(targetIndex);

            slice = this._backgroundRenderer.getSlice(offset, this._calendarContainer.width + Calendar.ENTITY_SPACING * stepsBack);
            this._scrollBgStartOffset = -(Calendar.ENTITY_SPACING * stepsBack);
        }
        else
        {
            const stepsForward = targetIndex - this._viewIndex;
            const width = Calendar.ENTITY_SPACING * stepsForward + this._calendarContainer.width;

            slice = this._backgroundRenderer.getSlice(this.getBackgroundSliceOffset(this._viewIndex), width);
            this._scrollBgStartOffset = 0;
        }

        this._backgroundSlice.x = this._scrollBgStartOffset;
        this._backgroundSlice.width = slice.width;
        this._backgroundSlice.height = slice.height;
        this._backgroundSlice.bitmap = slice;
    }

    // AS3: .../Calendar.as::repositionBackgroundSlice()
    private repositionBackgroundSlice(): void
    {
        if(this._backgroundSlice !== null) this._backgroundSlice.x = this._scrollBgStartOffset + this._scrollOffset;
    }

    // AS3: .../Calendar.as::scrollToIndex()
    private scrollToIndex(target: number): void
    {
        if(target < 0 || target >= this._entityCount) return;
        if(this._scrollAnimationHandle !== null) return;

        if(!this.areViewableEntityBitmapsInitialized())
        {
            this._viewIndex = target;
            this.enableScrollArrowsByViewIndex();

            return;
        }

        const previousIndex = this._viewIndex;

        this._viewIndex = target;

        if(this.areViewableBackgroundBitmapsInitialized())
        {
            this._viewIndex = previousIndex;

            this.assignScrollableBackgroundSlice(target);
            this.updateEntityVisibilities(true, target - this._viewIndex);
            this._scrollSpeed = -(Calendar.ENTITY_SPACING * (target - this._viewIndex)) / 10;
            this.startScrollAnimation();
        }
        else
        {
            this._viewIndex = previousIndex;
        }
    }

    // AS3: .../Calendar.as::get maxScrollRightIndex()
    private get maxScrollRightIndex(): number
    {
        return this._maximumEntities - Calendar.VISIBLE_WINDOW_ENTITIES;
    }

    // AS3: .../Calendar.as::enableScrollArrowsByViewIndex()
    private enableScrollArrowsByViewIndex(): void
    {
        if(this._viewIndex > 0) this._backArrow?.activate();
        else this._backArrow?.deactivate();

        if(this._viewIndex < Math.min(this._entityCount - Calendar.GOTO_DAY_OFFSET - 1, this.maxScrollRightIndex))
        {
            this._nextArrow?.activate();
        }
        else
        {
            this._nextArrow?.deactivate();
        }
    }

    // AS3: .../Calendar.as::updateEntityVisibilities()
    private updateEntityVisibilities(fromScroll: boolean = false, delta: number = 0): void
    {
        if(this._entityWindows === null) return;

        let low = this._viewIndex - 1;

        if(fromScroll && delta < 0) low += delta;

        let high = this._viewIndex + Calendar.VISIBLE_WINDOW_ENTITIES + 1;

        if(fromScroll && delta > 0) high += delta;

        for(let index = 0; index < this._entityWindows.length; index++)
        {
            const window = this._entityWindows[index];

            if(index < low || index > high)
            {
                window.visible = false;

                continue;
            }

            window.visible = true;

            const mouseRegion = window.getChildByName('entity_mouse_region');

            if(mouseRegion === null) continue;

            if(index === low || index === high)
            {
                mouseRegion.visible = false;
            }
            else if(this._states[index] === CalendarEntityStateEnums.ACTIVE)
            {
                mouseRegion.visible = true;
            }
        }
    }

    // AS3: .../Calendar.as::startScrollAnimation() — the 10x10ms Timer's "timer"/"timerComplete" pair, folded into one interval.
    private startScrollAnimation(): void
    {
        this._scrollAnimationTick = 0;

        this._scrollAnimationHandle = setInterval(() => this.onAnimateScrollTick(), 10);
    }

    // AS3: .../Calendar.as::onAnimateScroll()
    private onAnimateScrollTick(): void
    {
        this._scrollAnimationTick++;

        this._scrollOffset += this._scrollSpeed;
        this.repositionBackgroundSlice();
        this.repositionEntityWrappers();

        if(this._scrollAnimationTick < 10) return;

        if(this._scrollAnimationHandle !== null)
        {
            clearInterval(this._scrollAnimationHandle);
            this._scrollAnimationHandle = null;
        }

        this._scrollOffset = 0;

        if(this._scrollSpeed > 0) this._viewIndex -= 1;
        else this._viewIndex += 1;

        this.assignCurrentBackgroundSlice();
        this.repositionEntityWrappers();
        this.enableScrollArrowsByViewIndex();
        this.updateEntityVisibilities();
    }

    // AS3: .../Calendar.as::scrollArrowProcedure()
    private scrollArrowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.DOWN)
        {
            switch(window.name)
            {
                case 'button_left':
                    this._backArrowHeld = true;
                    break;

                case 'button_right':
                    this._nextArrowHeld = true;
                    break;
            }
        }

        if(event.type === WindowMouseEvent.UP || event.type === WindowMouseEvent.UP_OUTSIDE)
        {
            this._backArrowHeld = false;
            this._nextArrowHeld = false;
        }
    };

    // AS3: .../Calendar.as::entityMouseRegionWindowProcedure()
    private entityMouseRegionWindowProcedure = (event: WindowEvent, window: IWindow): void =>
    {
        if(window.name !== 'entity_mouse_region' || this._entityWindows === null) return;

        const index = this._entityWindows.indexOf(window.parent as unknown as IWindowContainer);

        if(event.type === WindowMouseEvent.CLICK)
        {
            const quest = this.getQuestByEntityWindowIndex(index);

            if(quest !== null) this._questEngine?.questController?.questDetails.openDetails(quest, true);
        }

        if(event.type === WindowMouseEvent.OVER)
        {
            this.updateEntityIndicatorPanel(index, true);
            this._hoveredEntityIndex = index;
        }

        if(event.type === WindowMouseEvent.OUT)
        {
            this.updateEntityIndicatorPanel(index, false);
            this._hoveredEntityIndex = -1;
        }
    };

    // AS3: .../Calendar.as::getQuestByEntityWindowIndex()
    private getQuestByEntityWindowIndex(index: number): QuestMessageData | null
    {
        for(const quest of this._seasonalQuests)
        {
            if(quest.sortOrder - 1 === index) return quest;
        }

        return null;
    }

    // AS3: .../Calendar.as::update()
    update(deltaTime: number): void
    {
        if(this._entityWindows !== null && this._flashingEntityIndex !== -1)
        {
            const baseColor = CalendarEntityStateEnums.INDICATOR_COLOR[this._states[this._flashingEntityIndex]] ?? 0;

            let t = (this._flashElapsedMs % Calendar.FLASH_PULSE_LENGHT_IN_MS) / Calendar.FLASH_PULSE_LENGHT_IN_MS;

            t -= 1;
            // AS3's own ternary is a no-op (`t > 0.5 ? t : t`) in both crypted trees — a genuine
            // AS3 quirk, not a decompiler artifact (the two independently-obfuscated trees agree
            // on it), so it is ported exactly rather than "fixed" into a triangle wave.
            t = Math.abs(2 * (t > 0.5 ? t : t));

            const indicator = this._entityWindows[this._flashingEntityIndex]?.findChildByName('entity_indicator') ?? null;

            if(indicator !== null)
            {
                let brightness = t * Calendar.FLASH_MAX_BRIGHTNESS;

                if(this._hoveredEntityIndex === this._flashingEntityIndex) brightness += 20;

                indicator.color = Calendar.adjustBrightness(baseColor, brightness);
            }

            this._flashElapsedMs += deltaTime;
        }

        if(this._scrollAnimationHandle === null)
        {
            if(this._backArrowHeld && this._scrollOffset === 0)
            {
                if(this._viewIndex > 0 && !this._backArrow?.isInactive())
                {
                    this.scrollToIndex(this._viewIndex - 1);
                }
            }

            if(this._nextArrowHeld && this._scrollOffset === 0)
            {
                if(this._viewIndex < this._highestAvailableQuestIndex && !this._nextArrow?.isInactive())
                {
                    this.scrollToIndex(this._viewIndex + 1);
                }
            }
        }
    }

    // AS3: .../Calendar.as::startFlashingAtIndex()
    private startFlashingAtIndex(index: number): void
    {
        if(index < 0 || index >= this._entityCount) return;

        this._flashingEntityIndex = index;
        this._flashElapsedMs = 0;
    }

    // AS3: .../Calendar.as::stopFlashing()
    private stopFlashing(): void
    {
        this._flashingEntityIndex = -1;
    }

    // AS3: .../Calendar.as::onDateRefreshTimer()
    private onDateRefreshTimer(): void
    {
        const now = new Date();

        if(this._lastSeenDayOfMonth !== now.getDate())
        {
            this._questEngine?.requestSeasonalQuests();
        }

        this._lastSeenDayOfMonth = now.getDate();
    }

    // TS-only: shared opaque-white placeholder, matching AS3's inline
    // `new BitmapData(w, h, false, 0xFFFFFF)` / `new BitmapData(w, h)` (default fill is opaque
    // white too).
    private static makeOpaqueWhiteBitmap(width: number, height: number): ImageBitmap
    {
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');

        if(context !== null)
        {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, width, height);
        }

        return canvas.transferToImageBitmap();
    }

    // TS-only: shared transparent placeholder, matching AS3's inline
    // `new BitmapData(w, h, true, 0)`.
    private static makeTransparentBitmap(width: number, height: number): ImageBitmap
    {
        const canvas = new OffscreenCanvas(width, height);

        return canvas.transferToImageBitmap();
    }
}
