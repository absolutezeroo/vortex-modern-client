import type {IDisposable} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowType} from '@core/window/enum/WindowType';
import type {HabboQuestEngine} from './HabboQuestEngine';
import type {QuestMessageData} from '@habbo/communication/messages/parser/quest/QuestMessageData';
import {ProgressBar} from './ProgressBar';
import {OpenQuestTrackerMessageComposer} from '@habbo/communication/messages/outgoing/quest/OpenQuestTrackerMessageComposer';
import {StartCampaignMessageComposer} from '@habbo/communication/messages/outgoing/quest/StartCampaignMessageComposer';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('QuestTracker');

// AS3: QuestTracker.as animation status constants
const STATUS_NONE = 0;
const STATUS_SLIDE_IN = 1;
const STATUS_SLIDE_OUT = 2;
const STATUS_COMPLETED_ANIMATION = 3;
const STATUS_PROGRESS_NUDGE = 4;
const STATUS_CLOSE_WAIT = 5;
const STATUS_PROMPT_ANIMATION = 6;

const PROMPT_SEQUENCE_REPEATS = 4;
const PROMPT_SEQUENCE_REPEATS_QUEST_OPEN = 2;
const PROMPT_FRAME_LENGTH_IN_MSECS = 200;
const PROMPT_DELAY_IN_MSECS = 10000;
const PROMPT_DELAY_ON_QUEST_OPEN_IN_MSECS = 0;
const NO_PROMPT_DELAY = -1;
const PROGRESS_BAR_WIDTH = 162;
const TRACKER_SLIDE_IN_SPEED = 0.01;
const TRACKER_SLIDE_OUT_SPEED = 100;
const COMPLETION_CLOSE_DELAY_IN_MSECS = 1000;

const NUDGE_OFFSETS: number[] = [-2, -3, -2, 0, 2, 3, 2, 0, 2, 1, 0, 1];
// AS3: QuestTracker.as::_SafeStr_8468 - success-sprite frame sequence (frame 4 repeats at the end).
const SUCCESS_FRAME_SEQUENCE: number[] = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 4];
const PROMPT_FRAMES: string[] = ['a', 'b', 'c', 'd'];
const PROGRESS_BAR_LOC = {x: 10, y: 87};

// AS3: QuestTracker.as::hasBlockingWindowInLayer() - "as IFrameWindow" runtime check.
const FRAME_WINDOW_TYPES: number[] = [WindowType.FRAME, WindowType.FRAME_THIN, WindowType.FRAME_THICK, WindowType.FRAME_NOTIFY];

/**
 * The floating "current quest" HUD widget - one instance per active campaign chain,
 * attached to the toolbar's extension view. Drives the slide-in/out animation, a
 * ProgressBar, a completion sprite sequence, and an idle in-room-prompt nudge/flash.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/QuestTracker.as
 */
export class QuestTracker implements IDisposable
{
    private static _nextInstanceIndex: number = 0;

    private readonly _instanceIndex: number;
    private _engine: HabboQuestEngine | null;
    private _currentQuest: QuestMessageData | null = null;
    private _window: IWindowContainer | null = null;
    private _progressBar: ProgressBar | null = null;

    private _startQuestTimerCreated: boolean = false;
    private _startQuestTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private _startQuestDelayMs: number = 0;

    private _trackerAnimationStatus: number = STATUS_NONE;
    private _nudgeStep: number = 0;
    private _remainingWait: number = 0;
    private _successFrame: number = -1;
    private _msecsUntilPrompt: number = -1;
    private _promptFrame: number = -1;
    private _msecsUntilNextPromptFrame: number = 0;
    private _promptRepeatsRemaining: number = 0;
    private _isQuestOpenPrompt: boolean = false;
    private _getNextQuestWhenCompletionAnimationFinishes: boolean = false;
    private _forceCloseRequested: boolean = false;
    private _newQuestTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // AS3: QuestTracker.as::QuestTracker()
    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
        this._instanceIndex = QuestTracker._nextInstanceIndex++;
    }

    // AS3: QuestTracker.as::dispose()
    dispose(): void
    {
        if(this._engine)
        {
            this._engine.toolbar?.extensionView?.detachExtension(`quest_tracker_${this._instanceIndex}`);
        }

        this._engine = null;
        this._currentQuest = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }

        if(this._startQuestTimeoutId !== null)
        {
            clearTimeout(this._startQuestTimeoutId);
            this._startQuestTimeoutId = null;
        }

        this._progressBar?.dispose();
        this._progressBar = null;
    }

    // AS3: QuestTracker.as::get disposed()
    get disposed(): boolean
    {
        return this._engine === null;
    }

    // AS3: QuestTracker.as::onQuestCompleted()
    onQuestCompleted(quest: QuestMessageData, showDialog: boolean): void
    {
        if(this._window)
        {
            this.clearPrompt();
            this._currentQuest = quest;
            this._nudgeStep = 0;
            this.refreshTrackerDetails();
            this._successFrame = 0;
            this._trackerAnimationStatus = STATUS_COMPLETED_ANIMATION;
            this._getNextQuestWhenCompletionAnimationFinishes = !showDialog;
        }
    }

    // AS3: QuestTracker.as::onQuestCancelled()
    onQuestCancelled(): void
    {
        this._currentQuest = null;

        if(this._window)
        {
            this.clearPrompt();
            this._progressBar?.refresh(0, 100, -1, 0);
            this._trackerAnimationStatus = STATUS_SLIDE_OUT;
        }
    }

    // AS3: QuestTracker.as::startDefaultCampaign()
    startDefaultCampaign(campaignChainCode: string): void
    {
        const engine = this._engine;
        const isNewIdentity = (engine?.getInteger('new.identity', 0) ?? 0) > 0;

        if(!isNewIdentity) return;

        if(!this._startQuestTimerCreated && isNewIdentity && campaignChainCode !== '')
        {
            this._startQuestTimerCreated = true;
            this._startQuestDelayMs = (engine?.getInteger('questing.startQuestDelayInSeconds', 30) ?? 30) * 1000;
            this.scheduleStartQuestTimer();
            log.debug(`Initialized start quest timer with period: ${this._startQuestDelayMs / 1000}`);
        }
    }

    private scheduleStartQuestTimer(): void
    {
        this._startQuestTimeoutId = setTimeout(this.onStartQuestTimer, this._startQuestDelayMs);
    }

    // AS3: QuestTracker.as::onRoomExit()
    onRoomExit(): void
    {
        if(this._window && this._window.visible)
        {
            const moreInfoTxt = this._window.findChildByName('more_info_txt');
            const moreInfoRegion = this._window.findChildByName('more_info_region');

            if(moreInfoTxt) moreInfoTxt.visible = false;
            if(moreInfoRegion) moreInfoRegion.visible = false;
        }
    }

    // AS3: QuestTracker.as::onQuest()
    onQuest(quest: QuestMessageData): void
    {
        if(this._startQuestTimeoutId !== null)
        {
            clearTimeout(this._startQuestTimeoutId);
            this._startQuestTimeoutId = null;
        }

        if(this._newQuestTimeoutId !== null)
        {
            clearTimeout(this._newQuestTimeoutId);
            this._newQuestTimeoutId = null;
        }

        const wasVisible = !!this._window && this._window.visible;

        if(quest.waitPeriodSeconds > 0)
        {
            if(wasVisible)
            {
                this.setWindowVisible(false);
            }

            return;
        }

        this._currentQuest = quest;
        this.prepareTrackerWindow();
        this.refreshTrackerDetails();
        this.refreshPromptFrames();
        this.setWindowVisible(true);
        this.hideSuccessFrames();

        if(wasVisible)
        {
            if(this._trackerAnimationStatus === STATUS_SLIDE_OUT)
            {
                this._trackerAnimationStatus = STATUS_SLIDE_IN;
            }

            this.setupPrompt(this._msecsUntilPrompt, PROMPT_SEQUENCE_REPEATS, false);
        }
        else if(this._window)
        {
            this._window.x = this.getOutScreenLocationX();
            this._trackerAnimationStatus = STATUS_SLIDE_IN;
            this.setupPrompt(PROMPT_DELAY_ON_QUEST_OPEN_IN_MSECS, PROMPT_SEQUENCE_REPEATS_QUEST_OPEN, false);
        }
    }

    // AS3: QuestTracker.as::refreshPromptFrames()
    private refreshPromptFrames(): void
    {
        const engine = this._engine;
        const quest = this._currentQuest;

        if(!engine || !quest || !this._window || !engine.isQuestWithPrompts(quest)) return;

        for(const frame of PROMPT_FRAMES)
        {
            engine.setupPromptFrameImage(this._window, quest, frame);
        }
    }

    // AS3: QuestTracker.as::prepareTrackerWindow()
    private prepareTrackerWindow(): void
    {
        if(this._window) return;

        const engine = this._engine;

        if(!engine) return;

        this._window = engine.windowManager?.buildWidgetLayout('QuestTracker') as unknown as IWindowContainer | null;

        if(!this._window) return;

        const moreInfoRegion = this._window.findChildByName('more_info_region');

        if(moreInfoRegion) moreInfoRegion.procedure = this.onMoreInfo;

        this.hideSuccessFrames();

        const contentContainer = this._window.findChildByName('content_cont') as IWindowContainer | null;

        if(contentContainer)
        {
            this._progressBar = new ProgressBar(engine, contentContainer, PROGRESS_BAR_WIDTH, 'quests.tracker.progress', false, PROGRESS_BAR_LOC);
        }
    }

    // AS3: QuestTracker.as::hideSuccessFrames()
    private hideSuccessFrames(): void
    {
        for(let i = 1; i <= 6; i++)
        {
            const frame = this.getSuccessFrame(i);

            if(frame) frame.visible = false;
        }
    }

    // AS3: QuestTracker.as::hidePromptFrames()
    private hidePromptFrames(): void
    {
        for(const frame of PROMPT_FRAMES)
        {
            const window = this.getPromptFrame(frame);

            if(window) window.visible = false;
        }
    }

    private getSuccessFrame(index: number): IWindow | null
    {
        return this._window?.findChildByName(`success_pic_${index}`) ?? null;
    }

    private getPromptFrame(frame: string): IWindow | null
    {
        return this._window?.findChildByName(`prompt_pic_${frame}`) ?? null;
    }

    // AS3: QuestTracker.as::refreshTrackerDetails()
    private refreshTrackerDetails(): void
    {
        const engine = this._engine;
        const quest = this._currentQuest;

        if(!engine || !quest || !this._window) return;

        const headerTxt = this._window.findChildByName('quest_header_txt');

        if(headerTxt)
        {
            headerTxt.caption = engine.localization?.getLocalizationWithParams(
                'quests.tracker.caption', '', 'quest_name', engine.getQuestName(quest)
            ) ?? '';
        }

        const descTxt = this._window.findChildByName('desc_txt');

        if(descTxt) descTxt.caption = engine.getQuestDesc(quest);

        const moreInfoTxt = this._window.findChildByName('more_info_txt');
        const moreInfoRegion = this._window.findChildByName('more_info_region');

        if(moreInfoTxt) moreInfoTxt.visible = engine.currentlyInRoom;
        if(moreInfoRegion) moreInfoRegion.visible = engine.currentlyInRoom;

        const percent = Math.ceil(100 * quest.completedSteps / quest.totalSteps);

        this._progressBar?.refresh(percent, 100, quest.id, 0);
        engine.setupQuestImage(this._window, quest);
    }

    // AS3: QuestTracker.as::onMoreInfo()
    private onMoreInfo = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type === WindowMouseEvent.CLICK && this._currentQuest)
        {
            this._engine?.questController?.questDetails.showDetails(this._currentQuest);
        }
    };

    // AS3: QuestTracker.as::forceWindowCloseAfterAnimationsFinished()
    forceWindowCloseAfterAnimationsFinished(): void
    {
        if(this._trackerAnimationStatus === STATUS_NONE)
        {
            this.setWindowVisible(false);
            this._forceCloseRequested = false;
        }
        else
        {
            this._forceCloseRequested = true;
        }
    }

    // AS3: QuestTracker.as::update()
    update(deltaTime: number): void
    {
        if(!this._window) return;

        this._progressBar?.updateView(deltaTime);

        switch(this._trackerAnimationStatus)
        {
            case STATUS_NONE:
                if(this._msecsUntilPrompt !== NO_PROMPT_DELAY)
                {
                    this._msecsUntilPrompt -= deltaTime;

                    if(this._msecsUntilPrompt < 0)
                    {
                        this._msecsUntilPrompt = NO_PROMPT_DELAY;

                        if(this._currentQuest !== null && this._engine?.isQuestWithPrompts(this._currentQuest))
                        {
                            if(this._isQuestOpenPrompt)
                            {
                                this.startNudge();
                                break;
                            }

                            this._trackerAnimationStatus = STATUS_PROMPT_ANIMATION;
                            this._promptFrame = 0;
                            this._msecsUntilNextPromptFrame = PROMPT_FRAME_LENGTH_IN_MSECS;
                        }
                    }
                }

                break;

            case STATUS_SLIDE_IN:
            {
                const targetX = this.getDefaultLocationX();
                const distance = this._window.x - targetX;

                if(distance > 0)
                {
                    const step = Math.max(1, Math.round(distance * deltaTime * TRACKER_SLIDE_IN_SPEED));

                    this._window.x -= step;

                    break;
                }

                this._trackerAnimationStatus = STATUS_NONE;
                this._window.x = targetX;

                break;
            }

            case STATUS_SLIDE_OUT:
            {
                const targetX = this.getOutScreenLocationX();
                const distance = this._window.width - this._window.x;

                if(distance > 0)
                {
                    const step = Math.max(1, Math.round(deltaTime * TRACKER_SLIDE_OUT_SPEED / distance));

                    this._window.x += step;

                    break;
                }

                this._trackerAnimationStatus = STATUS_NONE;
                this._window.x = targetX;
                this.setWindowVisible(false);

                break;
            }

            case STATUS_COMPLETED_ANIMATION:
                this.hideSuccessFrames();

                {
                    const frame = this.getSuccessFrame(SUCCESS_FRAME_SEQUENCE[this._successFrame]);

                    if(frame) frame.visible = true;
                }

                this._successFrame += 1;

                if(this._successFrame >= SUCCESS_FRAME_SEQUENCE.length)
                {
                    this._trackerAnimationStatus = STATUS_CLOSE_WAIT;
                    this._remainingWait = COMPLETION_CLOSE_DELAY_IN_MSECS;
                }

                break;

            case STATUS_PROGRESS_NUDGE:
                if(this._nudgeStep >= NUDGE_OFFSETS.length - 1)
                {
                    this._window.x = this.getDefaultLocationX();
                    this._trackerAnimationStatus = STATUS_NONE;
                    this.setupPrompt(PROMPT_DELAY_IN_MSECS, PROMPT_SEQUENCE_REPEATS, false);

                    break;
                }

                this._window.x = this.getDefaultLocationX() + NUDGE_OFFSETS[this._nudgeStep];
                this._nudgeStep += 1;

                break;

            case STATUS_CLOSE_WAIT:
                this._remainingWait -= deltaTime;

                if(this._remainingWait < 0)
                {
                    this._trackerAnimationStatus = STATUS_NONE;

                    if(this._getNextQuestWhenCompletionAnimationFinishes && !this._forceCloseRequested)
                    {
                        this._newQuestTimeoutId = setTimeout(this.onNewQuestNotReceived, 600);
                        this._engine?.send(new OpenQuestTrackerMessageComposer());

                        break;
                    }

                    this.setWindowVisible(false);
                    this._forceCloseRequested = false;
                }

                break;

            case STATUS_PROMPT_ANIMATION:
                this.setQuestImageVisible(false);
                this.hidePromptFrames();
                this._msecsUntilNextPromptFrame -= deltaTime;

                {
                    const frame = this.getPromptFrame(PROMPT_FRAMES[this._promptFrame]);

                    if(frame) frame.visible = true;
                }

                if(this._msecsUntilNextPromptFrame < 0)
                {
                    this._msecsUntilNextPromptFrame = PROMPT_FRAME_LENGTH_IN_MSECS;
                    this._promptFrame += 1;

                    if(this._promptFrame >= PROMPT_FRAMES.length)
                    {
                        this._promptFrame = 0;
                        this._promptRepeatsRemaining -= 1;

                        if(this._promptRepeatsRemaining < 1)
                        {
                            this.setupPrompt(PROMPT_DELAY_IN_MSECS, PROMPT_SEQUENCE_REPEATS, true);
                            this._trackerAnimationStatus = STATUS_NONE;
                        }
                    }
                }
        }
    }

    // AS3: QuestTracker.as::onNewQuestNotReceived()
    private onNewQuestNotReceived = (): void =>
    {
        this._newQuestTimeoutId = null;
        this.setWindowVisible(false);
        this._forceCloseRequested = false;
    };

    // AS3: QuestTracker.as::getDefaultLocationX()
    private getDefaultLocationX(): number
    {
        return 0;
    }

    // AS3: QuestTracker.as::getOutScreenLocationX()
    private getOutScreenLocationX(): number
    {
        return (this._window?.width ?? 0) + 10;
    }

    // AS3: QuestTracker.as::onStartQuestTimer()
    private onStartQuestTimer = (): void =>
    {
        this._startQuestTimeoutId = null;

        if(this.hasBlockingWindow())
        {
            log.debug('Quest start blocked. Waiting some more');
            this.scheduleStartQuestTimer();
        }
        else
        {
            const engine = this._engine;

            if(engine?.questController)
            {
                engine.questController.questDetails.openForNextQuest = engine.getBoolean('questing.showDetailsForNextQuest');
            }

            engine?.send(new StartCampaignMessageComposer(engine.questController?.getDefaultCampaign() ?? ''));
        }
    };

    // AS3: QuestTracker.as::hasBlockingWindow()
    private hasBlockingWindow(): boolean
    {
        for(let layer = 0; layer <= 2; layer++)
        {
            const desktop = this._engine?.windowManager?.getDesktop(layer) as unknown as IWindowContainer | null;

            if(desktop && this.hasBlockingWindowInLayer(desktop))
            {
                return true;
            }
        }

        return false;
    }

    // AS3: QuestTracker.as::hasBlockingWindowInLayer()
    private hasBlockingWindowInLayer(layer: IWindowContainer): boolean
    {
        for(let i = 0; i < layer.numChildren; i++)
        {
            const child = layer.getChildAt(i);

            if(child && child.visible)
            {
                if(FRAME_WINDOW_TYPES.indexOf(child.type) > -1)
                {
                    if(child.name !== 'mod_start_panel' && child.name !== '_frame')
                    {
                        return true;
                    }
                }
                else if(child.name === 'welcome_screen')
                {
                    return true;
                }
            }
        }

        return false;
    }

    // AS3: QuestTracker.as::setQuestImageVisible()
    private setQuestImageVisible(visible: boolean): void
    {
        const bitmap = this._window?.findChildByName('quest_pic_bitmap');

        if(bitmap) bitmap.visible = visible;
    }

    // AS3: QuestTracker.as::clearPrompt()
    private clearPrompt(): void
    {
        this.setupPrompt(NO_PROMPT_DELAY, 0, false);
    }

    // AS3: QuestTracker.as::setupPrompt()
    private setupPrompt(delayMs: number, repeats: number, isQuestOpenPrompt: boolean): void
    {
        this.setQuestImageVisible(true);
        this.hidePromptFrames();
        this._msecsUntilPrompt = delayMs;
        this._promptRepeatsRemaining = repeats;
        this._isQuestOpenPrompt = isQuestOpenPrompt;
    }

    // AS3: QuestTracker.as::startNudge()
    private startNudge(): void
    {
        this._nudgeStep = 0;
        this._trackerAnimationStatus = STATUS_PROGRESS_NUDGE;
    }

    // AS3: QuestTracker.as::setWindowVisible()
    private setWindowVisible(visible: boolean): void
    {
        if(!this._window) return;

        this._window.visible = visible;

        const extensionView = this._engine?.toolbar?.extensionView;

        if(!visible)
        {
            extensionView?.detachExtension(`quest_tracker_${this._instanceIndex}`);
        }
        else
        {
            extensionView?.attachExtension(`quest_tracker_${this._instanceIndex}`, this._window);
        }
    }

    // AS3: QuestTracker.as::get campaignChainCode()
    get campaignChainCode(): string | null
    {
        return this._currentQuest?.campaignChainCode ?? null;
    }

    // AS3: QuestTracker.as::get canBeDisposed()
    get canBeDisposed(): boolean
    {
        if(this._currentQuest === null) return true;

        return !!this._window && !this._window.visible && this._trackerAnimationStatus === STATUS_NONE;
    }
}
