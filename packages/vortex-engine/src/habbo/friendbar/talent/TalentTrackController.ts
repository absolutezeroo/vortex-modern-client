/**
 * TalentTrackController — the full-width talent-track window: one horizontally scrolling pane per
 * level, each with its reward block and its task list, plus the progress meter across the top.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/talent/TalentTrackController.as
 *
 * The window is rebuilt from scratch every time a `TalentTrack` message lands, so `createWindow()`
 * starts by destroying whatever is up. Eight templates are lifted out of the layout on the way in
 * (a level pane, four reward rows, three task rows) and cloned per level; every one of them is
 * disposed in `destroyWindow()`.
 *
 * Two structural details worth knowing before editing the arithmetic:
 *
 * - **Level 0's reward block is collapsed, not hidden by state.** `createLevelPane()` special-cases
 *   index 0 by zeroing the block's width, because the first pane is the track's intro.
 * - **Tasks alternate between two lists.** `task_list_top` and `task_list_bottom` are filled by
 *   comparing their counts, which lays the tasks out in two rows rather than one long one.
 *
 * The safety-quiz task additionally gets a clickable overlay cloned on top of it, positioned by
 * converting the task's global position back into the pane's local space.
 */
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextFieldWindow} from '@core/window/components/ITextFieldWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {Logger} from '@core/utils/Logger';
import type {IModalDialog} from '@habbo/window/utils/IModalDialog';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import {MathUtils} from '@habbo/utils/MathUtils';
import {TalentEnum, getTalentTypes} from '@habbo/session/enum/TalentEnum';

import {TalentTrackMessageEvent} from '@habbo/communication/messages/incoming/talent/TalentTrackMessageEvent';
import {ChangeEmailResultEvent} from '@habbo/communication/messages/incoming/users/ChangeEmailResultEvent';
import {EmailStatusResultEvent} from '@habbo/communication/messages/incoming/users/EmailStatusResultEvent';
import {
    HabboGroupDetailsMessageEvent
} from '@habbo/communication/messages/incoming/users/HabboGroupDetailsMessageEvent';
import {ChangeEmailComposer} from '@habbo/communication/messages/outgoing/users/ChangeEmailComposer';
import {GetEmailStatusComposer} from '@habbo/communication/messages/outgoing/users/GetEmailStatusComposer';
import {
    GetHabboGroupDetailsMessageComposer
} from '@habbo/communication/messages/outgoing/users/GetHabboGroupDetailsMessageComposer';
import {GetTalentTrackMessageComposer} from '@habbo/communication/messages/outgoing/talent/GetTalentTrackMessageComposer';
import {
    GuideAdvertisementReadMessageComposer
} from '@habbo/communication/messages/outgoing/talent/GuideAdvertisementReadMessageComposer';

import type {TalentTrack} from '@habbo/communication/messages/parser/talent/TalentTrack';
import type {TalentTrackLevel} from '@habbo/communication/messages/parser/talent/TalentTrackLevel';
import {TalentTrackTask} from '@habbo/communication/messages/parser/talent/TalentTrackTask';
import type {TalentTrackRewardPerk} from '@habbo/communication/messages/parser/talent/TalentTrackRewardPerk';
import type {
    TalentTrackRewardProduct
} from '@habbo/communication/messages/parser/talent/TalentTrackRewardProduct';

import type {HabboTalent} from './HabboTalent';
import {TalentProgressMeter} from './TalentProgressMeter';

const log = Logger.getLogger('habbo.friendbar.talent.TalentTrackController');

export class TalentTrackController
{
    // AS3: TalentTrackController.as::MODAL_DIALOG_LAYER
    private static readonly MODAL_DIALOG_LAYER: number = 3;

    // AS3: TalentTrackController.as::HORIZONTAL_MARGIN
    private static readonly HORIZONTAL_MARGIN: number = 100;

    // AS3: TalentTrackController.as::BEGIN_PANE_PREFIX
    private static readonly BEGIN_PANE_PREFIX: string = 'begin_';

    // AS3: TalentTrackController.as::LEVEL_PANE_PREFIX
    private static readonly LEVEL_PANE_PREFIX: string = 'level_pane_';

    // AS3: TalentTrackController.as::NO_CITIZENSHIP_SUFFIX
    private static readonly NO_CITIZENSHIP_SUFFIX: string = '_no_citizenship';

    // AS3: TalentTrackController.as::PROGRESS_BAR_MARGIN
    private static readonly PROGRESS_BAR_MARGIN: number = 40;

    // AS3: TalentTrackController.as::DEFAULT_PADDING
    private static readonly DEFAULT_PADDING: number = 10;

    // AS3: TalentTrackController.as::REWARD_WIDTH
    private static readonly REWARD_WIDTH: number = 200;

    // AS3: TalentTrackController.as::BADGE_RECT_SIZE
    private static readonly BADGE_RECT_SIZE: number = 60;

    /** AS3's `uint` literal 12434877 = 0xBDBDBD — a locked reward block's border. */
    // AS3: TalentTrackController.as::createLevelPane()
    private static readonly BORDER_COLOR_LOCKED: number = 0xBDBDBD;

    /** AS3's `uint` literal 4537147 = 0x453B3B — an unlocked reward block's border. */
    // AS3: TalentTrackController.as::createLevelPane()
    private static readonly BORDER_COLOR_UNLOCKED: number = 0x453B3B;

    /** AS3's `uint` literal 9934743 = 0x979797 — the tint on a locked product reward. */
    // AS3: TalentTrackController.as::createRewardProduct()
    private static readonly LOCKED_PRODUCT_COLOR: number = 0x979797;

    /** AS3's literal `48` — the task progress bar's full width. */
    // AS3: TalentTrackController.as::createTask()
    private static readonly TASK_PROGRESS_WIDTH: number = 48;

    // AS3: TalentTrackController.as::_habboTalent
    private _habboTalent: HabboTalent | null;

    // AS3: TalentTrackController.as::_disposed
    private _disposed: boolean = false;

    /** Derived name — `_SafeStr_4929`: the track window's modal. */
    // AS3: TalentTrackController.as::_SafeStr_4929
    private _modal: IModalDialog | null = null;

    // AS3: TalentTrackController.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: TalentTrackController.as::_taskProgressPopup
    private _taskProgressPopup: IModalDialog | null = null;

    /** Derived name — `_SafeStr_4761`: the horizontally scrolling strip of level panes. */
    // AS3: TalentTrackController.as::_SafeStr_4761
    private _panorama: IItemListWindow | null = null;

    // AS3: TalentTrackController.as::_talentTrack
    private _talentTrack: TalentTrack | null = null;

    // AS3: TalentTrackController.as::_talentProgressMeter
    private _talentProgressMeter: TalentProgressMeter | null = null;

    /** Derived name — `_SafeStr_5521`: the level-pane template. */
    // AS3: TalentTrackController.as::_SafeStr_5521
    private _levelPaneTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6568`: the achieved-perk reward row. */
    // AS3: TalentTrackController.as::_SafeStr_6568
    private _rewardAchievedTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6542`: the locked-perk reward row. */
    // AS3: TalentTrackController.as::_SafeStr_6542
    private _rewardLockedTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6513`: the product reward row. */
    // AS3: TalentTrackController.as::_SafeStr_6513
    private _rewardProductTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6658`: the subscription reward row. */
    // AS3: TalentTrackController.as::_SafeStr_6658
    private _rewardVipTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6814`: the completed-task row. */
    // AS3: TalentTrackController.as::_SafeStr_6814
    private _taskAchievedTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6505`: the in-progress task row. */
    // AS3: TalentTrackController.as::_SafeStr_6505
    private _taskOngoingTemplate: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_6869`: the locked task row. */
    // AS3: TalentTrackController.as::_SafeStr_6869
    private _taskLockedTemplate: IWindowContainer | null = null;

    // AS3: TalentTrackController.as::_overlayTemplate
    private _overlayTemplate: IWindow | null = null;

    /** Derived name — `_SafeStr_7715`: the guide group whose details are awaited, -1 when none. */
    // AS3: TalentTrackController.as::_SafeStr_7715
    private _pendingGuideGroupId: number = -1;

    // AS3: TalentTrackController.as::TalentTrackController()
    constructor(habboTalent: HabboTalent)
    {
        this._habboTalent = habboTalent;
    }

    // AS3: TalentTrackController.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: TalentTrackController.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: TalentTrackController.as::get talentTrack()
    public get talentTrack(): TalentTrack | null
    {
        return this._talentTrack;
    }

    // AS3: TalentTrackController.as::initialize()
    public initialize(): void
    {
        const communication = this._habboTalent?.communicationManager ?? null;

        if(communication === null) return;

        communication.addMessageEvent(new ChangeEmailResultEvent(this.onChangeEmailResult));
        communication.addMessageEvent(new TalentTrackMessageEvent(this.onTalentTrack));
        communication.addMessageEvent(new EmailStatusResultEvent(this.onEmailStatus));
        communication.addMessageEvent(new HabboGroupDetailsMessageEvent(this.onGroupDetails));
    }

    // AS3: TalentTrackController.as::onEmailStatus()
    private onEmailStatus = (event: IMessageEvent): void =>
    {
        const container = this.getEmailContainer();

        if(container === null) return;

        const parser = event.parser as unknown as {email: string; isVerified: boolean};
        const text = this.getEmailText();

        if(text !== null) text.text = parser.email;

        const unverified = container.findChildByName('unverified_container');
        const verified = container.findChildByName('verified_txt');

        if(unverified !== null) unverified.visible = !parser.isVerified;
        if(verified !== null) verified.visible = parser.isVerified;
    };

    // AS3: TalentTrackController.as::onChangeEmailResult()
    private onChangeEmailResult = (event: IMessageEvent): void =>
    {
        this.setEmailErrorStatus(true, (event.parser as unknown as {result: number}).result);
    };

    // AS3: TalentTrackController.as::onTalentTrack()
    private onTalentTrack = (event: IMessageEvent): void =>
    {
        this._talentTrack = (event as TalentTrackMessageEvent).talentParser.getTalentTrack();

        this.createWindow();
    };

    /**
     * The one place the guide group id matters: the details reply for the group this controller
     * asked about is what carries the room to walk into.
     */
    // AS3: TalentTrackController.as::onGroupDetails()
    private onGroupDetails = (event: IMessageEvent): void =>
    {
        const data = (event as unknown as {data: {groupId: number; roomId: number} | null}).data;

        if(data == null) return;

        if(data.groupId === this._pendingGuideGroupId)
        {
            this._pendingGuideGroupId = -1;
            this._habboTalent?.navigator?.goToPrivateRoom(data.roomId);
        }
    };

    // AS3: TalentTrackController.as::createWindow()
    private createWindow(): void
    {
        this.destroyWindow();

        if(this._talentTrack === null) return;

        this._modal = this._habboTalent?.getModalXmlWindow('talent_track') ?? null;
        this._window = (this._modal?.rootWindow ?? null) as IWindowContainer | null;

        if(this._window === null) return;

        (this._window as unknown as IWindow).procedure = this.onWindowEvent;

        if(this._modal?.background != null)
        {
            this._modal.background.procedure = this.onModalWindowBackgroundEvent;
        }

        this.desktopWindow?.addEventListener('WE_RESIZED', this.onDesktopResized);

        this._panorama = this._window.findChildByName('panorama') as unknown as IItemListWindow | null;

        if(this._panorama === null) return;

        this._levelPaneTemplate = TalentTrackController.takeListTemplate(
            this._panorama, 'level_pane'
        ) as IWindowContainer | null;

        if(this._levelPaneTemplate === null) return;

        const rewardList = this._levelPaneTemplate.findChildByName('reward_list') as unknown as IItemListWindow | null;

        if(rewardList !== null)
        {
            this._rewardAchievedTemplate = TalentTrackController.takeListTemplate(
                rewardList, 'reward_achieved') as IWindowContainer | null;
            this._rewardLockedTemplate = TalentTrackController.takeListTemplate(
                rewardList, 'reward_locked') as IWindowContainer | null;
            this._rewardProductTemplate = TalentTrackController.takeListTemplate(
                rewardList, 'reward_product') as IWindowContainer | null;
            this._rewardVipTemplate = TalentTrackController.takeListTemplate(
                rewardList, 'reward_vip') as IWindowContainer | null;
        }

        const taskListTop = this._levelPaneTemplate.findChildByName('task_list_top') as unknown as IItemListWindow | null;

        if(taskListTop !== null)
        {
            this._taskAchievedTemplate = TalentTrackController.takeListTemplate(
                taskListTop, 'task_achieved') as IWindowContainer | null;
            this._taskOngoingTemplate = TalentTrackController.takeListTemplate(
                taskListTop, 'task_ongoing') as IWindowContainer | null;
            this._taskLockedTemplate = TalentTrackController.takeListTemplate(
                taskListTop, 'task_locked') as IWindowContainer | null;
        }

        const overlay = this._levelPaneTemplate.findChildByName('action_overlay');

        this._overlayTemplate = overlay !== null ? this._levelPaneTemplate.removeChild(overlay) : null;

        const citizenshipEnabled = this._habboTalent?.citizenshipEnabled ?? false;

        for(const type of getTalentTypes())
        {
            let pane = this._panorama.getListItemByName(
                TalentTrackController.BEGIN_PANE_PREFIX + type
            ) as IWindowContainer | null;

            if(pane !== null)
            {
                (pane as unknown as IWindow).visible = type === this._talentTrack.name && citizenshipEnabled;

                if((pane as unknown as IWindow).visible) this.showAvatarInContainer(pane);
            }

            if(type !== TalentEnum.CITIZENSHIP)
            {
                pane = this._panorama.getListItemByName(
                    TalentTrackController.BEGIN_PANE_PREFIX + type + TalentTrackController.NO_CITIZENSHIP_SUFFIX
                ) as IWindowContainer | null;

                if(pane !== null)
                {
                    (pane as unknown as IWindow).visible = type === this._talentTrack.name && !citizenshipEnabled;

                    if((pane as unknown as IWindow).visible) this.showAvatarInContainer(pane);
                }
            }
        }

        this.setCaption(this._window, 'frame_title', `\${talent.track.${this._talentTrack.name}.frame.title}`);
        this.setCaption(this._window, 'frame_subtitle', `\${talent.track.${this._talentTrack.name}.frame.subtitle}`);
        this.setCaption(this._window, 'progress_text', `\${talent.track.${this._talentTrack.name}.progress.title}`);

        // The helper track's first level *is* the citizenship track's last one, so it is dropped
        // rather than shown twice.
        if(citizenshipEnabled && this._talentTrack.name !== TalentEnum.CITIZENSHIP)
        {
            this._talentTrack.removeFirstLevel();
        }

        let currentLevelIndex = 0;

        for(let index = 0; index < this._talentTrack.levels.length; index++)
        {
            this.createLevelPane(this._talentTrack.levels[index], index);

            if(this._talentTrack.levels[index].state === 1)
            {
                currentLevelIndex = index;
            }
        }

        this._talentProgressMeter = new TalentProgressMeter(this._habboTalent!, this);

        const endPadding = this._panorama.getListItemByName('end_padding');

        if(endPadding !== null)
        {
            this._panorama.setListItemIndex(endPadding, this._panorama.numListItems - 1);
        }

        this.resizeWindow();
        this.scrollToLevel(currentLevelIndex);
    }

    // TS-only: AS3 inlines `list.removeListItem(list.getListItemByName(name))` at each template
    // lift; the null-guard the port needs is the same every time.
    private static takeListTemplate(list: IItemListWindow, name: string): IWindow | null
    {
        const item = list.getListItemByName(name);

        return item !== null ? list.removeListItem(item) : null;
    }

    // TS-only: the null-guarded form of AS3's `findChildByName(name).caption = value`.
    private setCaption(parent: IWindowContainer, name: string, caption: string): void
    {
        const child = parent.findChildByName(name);

        if(child !== null) child.caption = caption;
    }

    // AS3: TalentTrackController.as::showAvatarInContainer()
    private showAvatarInContainer(container: IWindowContainer): void
    {
        const image = container.findChildByName('avatar_image') as unknown as IWidgetWindow | null;

        if(image === null) return;

        const avatar = image.widget as unknown as IAvatarImageWidget | null;

        if(avatar != null) avatar.figure = this._habboTalent?.sessionManager?.figure ?? '';
    }

    /**
     * Builds one level's pane. The width arithmetic is AS3's, verbatim: the reward block sizes
     * itself to its content through four mutually exclusive branches (no rewards / one product /
     * one perk / several), and the pane then sizes itself to the block plus the task list.
     */
    // AS3: TalentTrackController.as::createLevelPane()
    private createLevelPane(level: TalentTrackLevel, index: number): void
    {
        if(this._levelPaneTemplate === null || this._talentTrack === null || this._panorama === null) return;

        const pane = (this._levelPaneTemplate as unknown as IWindow).clone() as unknown as IWindowContainer;
        const statusList = pane.findChildByName('status_list') as unknown as IItemListWindow | null;
        const levelReward = pane.findChildByName('level_reward') as IWindowContainer | null;
        const levelTask = pane.findChildByName('level_task') as IWindowContainer | null;
        const taskListTop = pane.findChildByName('task_list_top') as unknown as IItemListWindow | null;
        const taskListBottom = pane.findChildByName('task_list_bottom') as unknown as IItemListWindow | null;

        (pane as unknown as IWindow).name = TalentTrackController.LEVEL_PANE_PREFIX + index;

        this.setCaption(pane, 'level_title', `\${talent.track.${this._talentTrack.name}.level.${level.level}.title}`);
        this.setCaption(
            pane, 'level_description', `\${talent.track.${this._talentTrack.name}.level.${level.level}.description}`
        );

        const padding = TalentTrackController.DEFAULT_PADDING;

        if(index === 0)
        {
            if(levelReward !== null)
            {
                (levelReward as unknown as IWindow).width = 0;
                (levelReward as unknown as IWindow).visible = false;
            }

            if(statusList !== null) (statusList as unknown as IWindow).x = 4 * padding;
        }
        else if(levelReward !== null)
        {
            this.layoutRewardBlock(level, levelReward);
        }

        if(level.tasks.length === 0)
        {
            if(levelTask !== null)
            {
                (levelTask as unknown as IWindow).width = 0;
                (levelTask as unknown as IWindow).visible = false;
            }
        }
        else if(taskListTop !== null && taskListBottom !== null)
        {
            const overlayTargets: IWindow[] = [];

            for(const task of level.tasks)
            {
                const row = this.createTask(task);

                if(row === null) continue;

                // The two lists are filled by comparing their counts, which alternates the tasks
                // between the top and the bottom row.
                if(taskListTop.numListItems === taskListBottom.numListItems)
                {
                    taskListTop.addListItem(row);
                }
                else
                {
                    taskListBottom.addListItem(row);
                }

                if(task.badgeCode === TalentTrackTask.SAFETY_QUIZ_GRADUATE_1 && task.state === 1)
                {
                    overlayTargets.push(row);
                }
            }

            taskListTop.arrangeListItems();
            taskListBottom.arrangeListItems();

            if(levelTask !== null)
            {
                (levelTask as unknown as IWindow).width = Math.max(
                    (taskListTop as unknown as IWindow).width, (taskListBottom as unknown as IWindow).width
                );
            }

            for(const target of overlayTargets)
            {
                if(this._overlayTemplate === null) break;

                const overlay = this._overlayTemplate.clone();
                const point = {x: 0, y: 0};

                pane.addChild(overlay);

                target.convertPointFromLocalToGlobalSpace(point);
                (pane as unknown as IWindow).convertPointFromGlobalToLocalSpace(point);

                overlay.x += point.x;
                overlay.y += point.y;
                overlay.visible = true;
            }
        }

        if(statusList !== null)
        {
            statusList.arrangeListItems();

            const statusWindow = statusList as unknown as IWindow;

            statusWindow.width = ((levelReward as unknown as IWindow | null)?.width ?? 0)
                + padding + ((levelTask as unknown as IWindow | null)?.width ?? 0);

            (pane as unknown as IWindow).width = statusWindow.x + statusWindow.width + padding;
        }

        this.repositionLevelIllustration(level, pane);
        this._panorama.addListItem(pane as unknown as IWindow);
    }

    // AS3: TalentTrackController.as::createLevelPane() (the reward-block half)
    private layoutRewardBlock(level: TalentTrackLevel, levelReward: IWindowContainer): void
    {
        if(this._talentTrack === null) return;

        const padding = TalentTrackController.DEFAULT_PADDING;
        const rewardWidth = TalentTrackController.REWARD_WIDTH;

        const border = levelReward.findChildByName('border') as IWindowContainer | null;
        const titleLocked = levelReward.findChildByName('title_locked') as ITextWindow | null;
        const titleAchieved = levelReward.findChildByName('title_achieved') as ITextWindow | null;
        const descriptionLocked = levelReward.findChildByName('description_locked') as ITextWindow | null;
        const descriptionAchieved = levelReward.findChildByName('description_achieved') as ITextWindow | null;
        const rewardList = levelReward.findChildByName('reward_list') as unknown as IItemListWindow | null;

        const borderWindow = border as unknown as IWindow | null;
        const rewardWindow = levelReward as unknown as IWindow;
        const titleLockedWindow = titleLocked as unknown as IWindow | null;
        const titleAchievedWindow = titleAchieved as unknown as IWindow | null;
        const descLockedWindow = descriptionLocked as unknown as IWindow | null;
        const descAchievedWindow = descriptionAchieved as unknown as IWindow | null;

        const prefix = `talent.track.${this._talentTrack.name}.level.${level.level}`;

        if(level.state === 0)
        {
            if(borderWindow !== null) borderWindow.color = TalentTrackController.BORDER_COLOR_LOCKED;

            const unlocked = border?.findChildByName('unlocked') ?? null;

            if(unlocked !== null) unlocked.visible = false;
            if(titleLockedWindow !== null) titleLockedWindow.caption = `\${${prefix}.title}`;
            if(titleAchievedWindow !== null) titleAchievedWindow.visible = false;
            if(descLockedWindow !== null) descLockedWindow.caption = `\${${prefix}.unlock}`;
            if(descAchievedWindow !== null) descAchievedWindow.visible = false;

            const achieved = levelReward.findChildByName('achieved');

            if(achieved !== null) achieved.visible = false;
        }
        else
        {
            if(borderWindow !== null) borderWindow.color = TalentTrackController.BORDER_COLOR_UNLOCKED;
            if(titleLockedWindow !== null) titleLockedWindow.visible = false;

            if(titleAchievedWindow !== null)
            {
                const localization = this._habboTalent?.localizationManager ?? null;

                titleAchievedWindow.caption =
                    (localization?.getLocalizationWithParams('talent.track.common.unlocked.level.prefix') ?? '')
                    + ' '
                    + (localization?.getLocalizationWithParams(`${prefix}.title`) ?? '');
            }

            if(descLockedWindow !== null) descLockedWindow.visible = false;
            if(descAchievedWindow !== null) descAchievedWindow.caption = `\${${prefix}.unlock}`;

            const locked = levelReward.findChildByName('locked');

            if(locked !== null) locked.visible = false;
        }

        const titleWidth = Math.max(titleAchievedWindow?.width ?? 0, titleLockedWindow?.width ?? 0);

        if(level.rewardCount === 0)
        {
            const width = Math.max(rewardWidth, titleWidth);

            if(descLockedWindow !== null) descLockedWindow.width = width;
            if(descAchievedWindow !== null) descAchievedWindow.width = width;
            if(borderWindow !== null) borderWindow.width = width + 2 * padding;

            rewardWindow.width = width + 2 * padding;

            if(borderWindow !== null && descAchievedWindow !== null)
            {
                borderWindow.height = descAchievedWindow.y
                    + Math.max(descAchievedWindow.height, descLockedWindow?.height ?? 0) + padding;
                rewardWindow.height = borderWindow.height + borderWindow.y;
            }

            if(rewardList !== null) (rewardList as unknown as IWindow).visible = false;
        }
        else if(level.rewardCount === 1 && level.rewardProducts.length > 0)
        {
            const width = Math.max(rewardWidth + padding * 2, titleWidth);

            if(descLockedWindow !== null) descLockedWindow.width = width;
            if(descAchievedWindow !== null) descAchievedWindow.width = width;

            const row = this.createRewardProduct(level, level.rewardProducts[0]);

            if(row !== null) rewardList?.addListItem(row);

            if(borderWindow !== null) borderWindow.width = width + 2 * padding;

            rewardWindow.width = width + 2 * padding;
        }
        else if(level.rewardCount === 1)
        {
            if(descLockedWindow !== null) descLockedWindow.width = rewardWidth * 2;
            if(descAchievedWindow !== null) descAchievedWindow.width = rewardWidth * 2;

            const row = level.rewardPerks.length > 0
                ? this.createRewardPerk(level, level.rewardPerks[0])
                : this.createRewardProduct(level, level.rewardProducts[0]);

            if(row !== null) rewardList?.addListItem(row);

            rewardList?.arrangeListItems();

            const listWidth = (rewardList as unknown as IWindow | null)?.width ?? 0;

            rewardWindow.width = listWidth + 2 * padding;

            if(borderWindow !== null) borderWindow.width = listWidth + 2 * padding;
        }
        else
        {
            for(const perk of level.rewardPerks)
            {
                const row = this.createRewardPerk(level, perk);

                if(row !== null) rewardList?.addListItem(row);
            }

            for(const product of level.rewardProducts)
            {
                const row = this.createRewardProduct(level, product);

                if(row !== null) rewardList?.addListItem(row);
            }

            rewardList?.arrangeListItems();

            const listWidth = (rewardList as unknown as IWindow | null)?.width ?? 0;

            rewardWindow.width = listWidth + 2 * padding;

            if(borderWindow !== null)
            {
                borderWindow.width = listWidth + 2 * padding;

                if(descAchievedWindow !== null) descAchievedWindow.width = borderWindow.width - 2 * padding;
            }
        }
    }

    /**
     * The illustration hangs off the right edge of the pane, and three level/track pairs get their
     * own hardcoded size — AS3's own special cases, kept as they are.
     */
    // AS3: TalentTrackController.as::repositionLevelIllustration()
    private repositionLevelIllustration(level: TalentTrackLevel, pane: IWindowContainer): void
    {
        if(this._talentTrack === null) return;

        const description = pane.findChildByName('level_description');
        const illustration = pane.findChildByName('level_illustration') as IStaticBitmapWrapperWindow | null;

        if(illustration === null) return;

        const image = illustration as unknown as IWindow;
        const paneWindow = pane as unknown as IWindow;
        const right = description?.right ?? 0;

        illustration.assetUri =
            `\${image.library.url}talent/${this._talentTrack.name}_${level.level}.png`;

        if(level.level === 8 && this._talentTrack.name === TalentEnum.HELPER)
        {
            image.width = 220;
            image.height = 270;
            image.x = Math.max(right, paneWindow.width);
        }
        else if(level.level === 0 && this._talentTrack.name === TalentEnum.CITIZENSHIP)
        {
            image.width = 0;
            image.x = Math.max(right, paneWindow.width);
        }
        else if(level.level === 4 && this._talentTrack.name === TalentEnum.CITIZENSHIP)
        {
            image.width = 220;
            image.height = 280;
            image.x = Math.max(right, paneWindow.width);
        }
        else
        {
            image.x = Math.max(right, paneWindow.width - image.width);
        }

        paneWindow.width = Math.max(paneWindow.width, image.right);
    }

    // AS3: TalentTrackController.as::createRewardPerk()
    private createRewardPerk(level: TalentTrackLevel, perk: TalentTrackRewardPerk): IWindow | null
    {
        let row: IWindowContainer | null;

        if(level.state === 0)
        {
            row = ((this._rewardLockedTemplate as unknown as IWindow | null)?.clone()
                ?? null) as unknown as IWindowContainer | null;
        }
        else
        {
            row = ((this._rewardAchievedTemplate as unknown as IWindow | null)?.clone()
                ?? null) as unknown as IWindowContainer | null;

            const achieved = row?.findChildByName('achieved') as unknown as IWidgetWindow | null;
            const badge = achieved?.widget as unknown as IBadgeImageWidget | null;

            if(badge != null) badge.badgeId = perk.perkId;
        }

        if(row === null) return null;

        const title = row.findChildByName('title');
        const description = row.findChildByName('description');

        if(title !== null) title.caption = `\${perk.${perk.perkId}.name}`;
        if(description !== null) description.caption = `\${perk.${perk.perkId}.description}`;

        const rowWindow = row as unknown as IWindow;
        const padding = TalentTrackController.DEFAULT_PADDING;
        const rewardWidth = TalentTrackController.REWARD_WIDTH;
        const badgeSize = TalentTrackController.BADGE_RECT_SIZE;

        if(level.rewardCount === 1)
        {
            rowWindow.width = rewardWidth * 2;

            if(title !== null) title.width = rewardWidth * 2 - badgeSize;
            if(description !== null) description.width = rewardWidth * 2 - badgeSize;
        }
        else if(description !== null)
        {
            if(description.height > 30)
            {
                description.width += 4 * padding;
            }

            description.width = Math.max(description.width, title?.width ?? 0);
            rowWindow.width = Math.max(description.width, title?.width ?? 0) + badgeSize + padding;
        }

        return rowWindow;
    }

    // AS3: TalentTrackController.as::createRewardProduct()
    private createRewardProduct(level: TalentTrackLevel, product: TalentTrackRewardProduct): IWindow | null
    {
        let row: IWindowContainer | null;

        if(product.vipDays === 0)
        {
            row = ((this._rewardProductTemplate as unknown as IWindow | null)?.clone()
                ?? null) as unknown as IWindowContainer | null;

            const icon = row?.findChildByName('product_icon') as IStaticBitmapWrapperWindow | null;
            const code = product.productCode.toLowerCase().replace(' ', '_');

            if(icon !== null) icon.assetUri = `\${image.library.url}talent/reward_product_${code}.png`;
        }
        else
        {
            row = ((this._rewardVipTemplate as unknown as IWindow | null)?.clone()
                ?? null) as unknown as IWindowContainer | null;

            const length = row?.findChildByName('vip_length') ?? null;

            if(length !== null)
            {
                length.caption = this._habboTalent?.localizationManager?.getLocalizationWithParams(
                    'catalog.vip.item.header.days', '', 'num_days', String(product.vipDays)
                ) ?? '';
            }
        }

        if(row === null) return null;

        const rowWindow = row as unknown as IWindow;

        if(level.state === 0)
        {
            rowWindow.color = TalentTrackController.LOCKED_PRODUCT_COLOR;
            rowWindow.blend = 0.6;
        }

        return rowWindow;
    }

    /**
     * A task with no badge code has nothing to show and is dropped — AS3 returns null and the
     * caller adds nothing.
     */
    // AS3: TalentTrackController.as::createTask()
    private createTask(task: TalentTrackTask): IWindow | null
    {
        if(task.badgeCode == null || task.badgeCode === '') return null;

        let row: IWindowContainer | null = null;

        switch(task.state)
        {
            case 0:
                row = ((this._taskLockedTemplate as unknown as IWindow | null)?.clone()
                    ?? null) as unknown as IWindowContainer | null;
                break;

            case 1:
            {
                row = ((this._taskOngoingTemplate as unknown as IWindow | null)?.clone()
                    ?? null) as unknown as IWindowContainer | null;

                const badgeWindow = row?.findChildByName('badge') as unknown as IWidgetWindow | null;
                const badge = badgeWindow?.widget as unknown as IBadgeImageWidget | null;

                if(badge != null) badge.badgeId = task.badgeCode;

                const progress = row?.findChildByName('task_progress_fg') ?? null;

                if(progress !== null)
                {
                    progress.width = MathUtils.map(
                        task.currentScore, 0, task.totalScore, 0, TalentTrackController.TASK_PROGRESS_WIDTH
                    );
                }

                const region = row?.findChildByName('task_ongoing_region') as unknown as IRegionWindow | null;
                const regionWindow = region as unknown as IWindow | null;

                if(regionWindow !== null)
                {
                    regionWindow.id = task.achievementId;

                    // The safety quiz is the one task whose row is renamed to its badge code, so
                    // that the window procedure can route the click straight to the booklet.
                    if(task.badgeCode === TalentTrackTask.SAFETY_QUIZ_GRADUATE_1)
                    {
                        if(region !== null) region.toolTipCaption = '';

                        regionWindow.name = task.badgeCode;
                    }
                }

                break;
            }

            case 2:
            {
                row = ((this._taskAchievedTemplate as unknown as IWindow | null)?.clone()
                    ?? null) as unknown as IWindowContainer | null;

                const badgeWindow = row?.findChildByName('badge') as unknown as IWidgetWindow | null;
                const badge = badgeWindow?.widget as unknown as IBadgeImageWidget | null;

                if(badge != null) badge.badgeId = task.badgeCode;

                break;
            }
        }

        if(row === null) return null;

        const localization = this._habboTalent?.localizationManager ?? null;
        const title = row.findChildByName('title');
        const description = row.findChildByName('description');

        if(title !== null)
        {
            title.caption = (localization?.getAchievementName(task.badgeCode) ?? '').toUpperCase();
        }

        if(description !== null)
        {
            description.caption = localization?.getAchievementInstruction(task.badgeCode) ?? '';
        }

        if(title !== null && description !== null)
        {
            if(title.height > 20)
            {
                title.y -= 5;
                description.y += 5;
            }
            else if(description.height > 30)
            {
                title.y -= 5;
                description.y -= 5;
            }
        }

        return row as unknown as IWindow;
    }

    // AS3: TalentTrackController.as::destroyWindow()
    private destroyWindow(): void
    {
        this.destroyTaskProgressDialog();

        for(const template of [
            this._overlayTemplate,
            this._levelPaneTemplate as unknown as IWindow | null,
            this._rewardAchievedTemplate as unknown as IWindow | null,
            this._rewardLockedTemplate as unknown as IWindow | null,
            this._rewardProductTemplate as unknown as IWindow | null,
            this._rewardVipTemplate as unknown as IWindow | null,
            this._taskAchievedTemplate as unknown as IWindow | null,
            this._taskOngoingTemplate as unknown as IWindow | null,
            this._taskLockedTemplate as unknown as IWindow | null
        ])
        {
            template?.dispose();
        }

        this._overlayTemplate = null;
        this._levelPaneTemplate = null;
        this._rewardAchievedTemplate = null;
        this._rewardLockedTemplate = null;
        this._rewardProductTemplate = null;
        this._rewardVipTemplate = null;
        this._taskAchievedTemplate = null;
        this._taskOngoingTemplate = null;
        this._taskLockedTemplate = null;

        if(this._modal !== null)
        {
            this._modal.dispose();
            this._modal = null;
            this._window = null;

            this.desktopWindow?.removeEventListener('WE_RESIZED', this.onDesktopResized);
        }
    }

    /** The window spans the desktop less a fixed margin either side, and re-lays on every resize. */
    // AS3: TalentTrackController.as::resizeWindow()
    private resizeWindow(): void
    {
        if(this._modal === null || this._modal.disposed || this._window === null) return;

        const window = this._window as unknown as IWindow;
        const margin = TalentTrackController.HORIZONTAL_MARGIN;

        window.x = margin;
        window.width = (window.desktop?.width ?? window.width) - 2 * margin;

        for(const name of ['frame', 'panorama', 'panorama_scrollbar'])
        {
            const child = this._window.findChildByName(name);

            if(child !== null) child.width = window.width;
        }

        this._talentProgressMeter?.resize();
        this._panorama?.arrangeListItems();
        window.invalidate();
    }

    // AS3: TalentTrackController.as::onDesktopResized()
    private onDesktopResized = (): void =>
    {
        this.resizeWindow();
    };

    // AS3: TalentTrackController.as::onWindowEvent()
    private onWindowEvent = (event: WindowEvent, window: IWindow): void =>
    {
        const self = this._window as unknown as IWindow | null;

        if(self === null || self.disposed || event.type !== 'WME_CLICK') return;

        switch(window.name)
        {
            case 'header_button_close':
                this.destroyWindow();
                break;

            case 'progress_container':
            {
                const localX = Math.trunc((event as WindowMouseEvent).localX);
                const meter = this._talentProgressMeter;
                const margin = TalentTrackController.PROGRESS_BAR_MARGIN;

                if(this._panorama === null || meter === null) break;

                if(localX < margin)
                {
                    this._panorama.scrollH = 0;
                    break;
                }

                if(localX > meter.width - margin)
                {
                    this._panorama.scrollH = 1;
                    break;
                }

                this.scrollToLevel(Math.trunc(Math.floor(localX / meter.progressPerLevelWidth)));
                break;
            }

            case 'task_ongoing_region':
                this.createTaskProgressDialog(window.id);
                break;

            case 'citizenship_button':
                this._habboTalent?.tracking?.trackTalentTrackOpen(TalentEnum.CITIZENSHIP, 'talentrack');
                this._habboTalent?.send(new GetTalentTrackMessageComposer(TalentEnum.CITIZENSHIP));
                break;

            case TalentTrackTask.SAFETY_QUIZ_GRADUATE_1:
                this.closeAndLog(window.name);
                this._habboTalent?.habboHelp?.showSafetyBooklet();
                break;

            // AS3 lists both track buttons with an empty body — the clicks are swallowed.
            case 'button_track_citizenship':
            case 'button_track_helper':
                break;
        }
    };

    // AS3: TalentTrackController.as::onModalWindowBackgroundEvent()
    private onModalWindowBackgroundEvent = (event: WindowEvent): void =>
    {
        const self = this._window as unknown as IWindow | null;

        if(self === null || self.disposed || event.type !== 'WME_CLICK') return;

        this.destroyWindow();
    };

    // AS3: TalentTrackController.as::scrollToLevel()
    private scrollToLevel(index: number): void
    {
        if(this._panorama === null) return;

        if(index === 0)
        {
            this._panorama.scrollH = 0;

            return;
        }

        const pane = this._panorama.getListItemByName(TalentTrackController.LEVEL_PANE_PREFIX + index);

        if(pane === null) return;

        this._panorama.scrollH = MathUtils.map(
            pane.x - 20,
            0,
            this._panorama.scrollableRegion.width - this._panorama.visibleRegion.width,
            0,
            1
        );
    }

    /**
     * The per-task detail popup. The guide-advertisement task takes a different window entirely, and
     * the email-verification task grows an inline email field when the hotel allows changing it.
     */
    // AS3: TalentTrackController.as::createTaskProgressDialog()
    private createTaskProgressDialog(achievementId: number): void
    {
        this.destroyTaskProgressDialog();

        const task = this._talentTrack?.findTaskByAchievementId(achievementId) ?? null;

        if(task === null || task.badgeCode == null || task.badgeCode === '') return;

        this._habboTalent?.tracking?.trackEventLog(
            'Talent', this._talentTrack?.name ?? '', 'talent.progress.show', task.badgeCode
        );

        if(task.badgeCode === TalentTrackTask.GUIDE_ADVERTISEMENT_READER_1)
        {
            this.setupTourAdvertisement();

            return;
        }

        this._taskProgressPopup = this._habboTalent?.getModalXmlWindow('task_progress_dialog') ?? null;

        const root = (this._taskProgressPopup?.rootWindow ?? null) as IWindowContainer | null;

        if(root === null) return;

        (root as unknown as IWindow).procedure = this.onTaskProgressWindowEvent;

        if(this._taskProgressPopup?.background != null)
        {
            this._taskProgressPopup.background.procedure = this.onTaskProgressBackgroundWindowEvent;
        }

        const localization = this._habboTalent?.localizationManager ?? null;

        this.setCaption(root, 'instruction', localization?.getAchievementInstruction(task.badgeCode) ?? '');
        this.setCaption(root, 'title', localization?.getAchievementName(task.badgeCode) ?? '');
        this.setCaption(
            root,
            'progress_text',
            (localization?.getLocalizationWithParams('talent.track.task.progress.dialog.progress') ?? '')
                + ' ' + task.currentScore + '/' + task.totalScore
        );

        const badgeWindow = root.findChildByName('badge') as unknown as IWidgetWindow | null;
        const badge = badgeWindow?.widget as unknown as IBadgeImageWidget | null;

        if(badge != null) badge.badgeId = task.badgeCode;

        const emailContainer = this.getEmailContainer();

        if(emailContainer !== null) (emailContainer as unknown as IWindow).visible = false;

        if(this._habboTalent?.citizenshipEnabled)
        {
            const key = `talent.track.task.action.${this._talentTrack?.name}.${TalentTrackController.mapBadgeCode(task.badgeCode)}`;
            const description = localization?.getLocalizationWithParams(`${key}.description`, '') ?? '';
            const link = localization?.getLocalizationWithParams(`${key}.link`, '') ?? '';
            const hasAction = description !== '' || link !== '';

            const separator = root.findChildByName('action_separator');
            const actionTitle = root.findChildByName('action_title');

            if(separator !== null) separator.visible = hasAction;
            if(actionTitle !== null) actionTitle.visible = hasAction;

            TalentTrackController.setText(root, 'action_description', description);
            TalentTrackController.setText(root, 'action_link', link);

            const actionLink = root.findChildByName('action_link');

            if(actionLink !== null) actionLink.name = task.badgeCode;

            const progressSeparator = root.findChildByName('progress_separator');

            if(progressSeparator !== null) progressSeparator.visible = link !== '';

            if(task.badgeCode === TalentTrackTask.EMAIL_VERIFICATION_1 && this.emailChangeEnabled)
            {
                const container = this.getEmailContainer();

                if(container !== null)
                {
                    (container as unknown as IWindow).visible = true;

                    const region = container.findChildByName('change_email_region');

                    if(region !== null) region.procedure = this.onChangeEmail;

                    const text = this.getEmailText();

                    if(text !== null) (text as unknown as IWindow).procedure = this.onEmailTxt;
                }

                this._habboTalent?.send(new GetEmailStatusComposer());
                this.setEmailErrorStatus(false);
            }
        }
        else
        {
            for(const name of ['action_separator', 'action_title', 'action_description', 'action_link'])
            {
                const child = root.findChildByName(name);

                if(child !== null) child.visible = false;
            }
        }

        (root.findChildByName('top_list') as unknown as IItemListWindow | null)?.arrangeListItems();

        if(task.currentScore <= 0)
        {
            for(const name of ['achieved_left', 'achieved_right', 'achieved_mid'])
            {
                const child = root.findChildByName(name);

                if(child !== null) child.visible = false;
            }
        }
        else if(task.currentScore < task.totalScore)
        {
            const right = root.findChildByName('achieved_right');
            const mid = root.findChildByName('achieved_mid');
            const unachieved = root.findChildByName('unachieved_mid');

            if(right !== null) right.visible = false;

            if(mid !== null)
            {
                mid.width = MathUtils.map(
                    task.currentScore, 0, task.totalScore, 0, unachieved?.width ?? 0
                );
            }
        }

        const list = root.findChildByName('list') as unknown as IItemListWindow | null;

        if(list !== null)
        {
            if(!task.hasProgressDisplay())
            {
                const container = list.getListItemByName('progress_main_container');

                if(container !== null) list.removeListItem(container);
            }

            list.arrangeListItems();
        }
    }

    // AS3: TalentTrackController.as::getEmailContainer()
    private getEmailContainer(): IWindowContainer | null
    {
        const root = (this._taskProgressPopup?.rootWindow ?? null) as IWindowContainer | null;

        if(root === null) return null;

        return root.findChildByName('email_container') as IWindowContainer | null;
    }

    /** Both room-entry achievements share one localization key. */
    // AS3: TalentTrackController.as::mapBadgeCode()
    private static mapBadgeCode(badgeCode: string): string
    {
        if(badgeCode === TalentTrackTask.ROOM_ENTRY_1 || badgeCode === TalentTrackTask.ROOM_ENTRY_2)
        {
            return 'ACH_RoomEntry';
        }

        return badgeCode;
    }

    // AS3: TalentTrackController.as::setText()
    private static setText(parent: IWindowContainer, name: string, text: string): void
    {
        const child = parent.findChildByName(name);

        if(child === null) return;

        child.caption = text;
        child.visible = text !== '';
    }

    // AS3: TalentTrackController.as::destroyTaskProgressDialog()
    private destroyTaskProgressDialog(): void
    {
        if(this._taskProgressPopup !== null)
        {
            this._taskProgressPopup.dispose();
            this._taskProgressPopup = null;
        }
    }

    /**
     * Each task's own row name doubles as the action it triggers, which is why the switch reads
     * badge codes rather than button names.
     */
    // AS3: TalentTrackController.as::onTaskProgressWindowEvent()
    private onTaskProgressWindowEvent = (event: WindowEvent, window: IWindow): void =>
    {
        if(this._taskProgressPopup === null || this._taskProgressPopup.disposed
            || event.type !== 'WME_CLICK')
        {
            return;
        }

        switch(window.name)
        {
            case 'header_button_close':
            case 'thanks_button':
                this.destroyTaskProgressDialog();
                break;

            case TalentTrackTask.HABBO_WAY_GRADUATE_1:
                this.closeAndLog(window.name);
                this._habboTalent?.habboHelp?.showHabboWay();
                break;

            case TalentTrackTask.GUIDE_GROUP_MEMBER_1:
            {
                this.closeAndLog(window.name);

                const groupId = this._habboTalent?.getInteger('guide.help.alpha.groupid', 0) ?? 0;

                if(groupId > 0)
                {
                    this._pendingGuideGroupId = groupId;
                    this._habboTalent?.send(new GetHabboGroupDetailsMessageComposer(groupId, false));
                }

                break;
            }

            case TalentTrackTask.SAFETY_QUIZ_GRADUATE_1:
                this.closeAndLog(window.name);
                this._habboTalent?.habboHelp?.showSafetyBooklet();
                break;

            case TalentTrackTask.ROOM_ENTRY_1:
            case TalentTrackTask.ROOM_ENTRY_2:
                this.closeAndLog(window.name);
                // AS3 passes an explicit `null` Point; this port's signature drops the optional argument.
                this._habboTalent?.navigator?.openNavigator();
                break;

            case TalentTrackTask.AVATAR_LOOKS_1:
                this.closeAndLog(window.name);
                this._habboTalent?.avatarEditor?.openEditor(0, null, null, true);
                this._habboTalent?.avatarEditor?.loadOwnAvatarInEditor(0);
                break;
        }
    };

    // AS3: TalentTrackController.as::closeAndLog()
    private closeAndLog(badgeCode: string): void
    {
        this.destroyWindow();

        this._habboTalent?.tracking?.trackEventLog(
            'Talent', this._talentTrack?.name ?? '', 'talent.progress.click_activity', badgeCode
        );
    }

    // AS3: TalentTrackController.as::setupTourAdvertisement()
    private setupTourAdvertisement(): void
    {
        this._taskProgressPopup = this._habboTalent?.getModalXmlWindow('tour_task_progress_dialog') ?? null;

        const root = (this._taskProgressPopup?.rootWindow ?? null) as IWindowContainer | null;

        if(root === null) return;

        const take = root.findChildByName('take_tour_button');
        const decline = root.findChildByName('decline_tour_region');
        const close = root.findChildByName('header_button_close');

        if(take !== null) take.procedure = this.onTakeTour;
        if(decline !== null) decline.procedure = this.onDeclineTour;
        if(close !== null) close.procedure = this.onCloseTourAd;
    }

    // AS3: TalentTrackController.as::onTakeTour()
    private onTakeTour = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.destroyWindow();
        this.destroyTaskProgressDialog();

        this._habboTalent?.send(new GuideAdvertisementReadMessageComposer());
        this._habboTalent?.habboHelp?.requestGuide();
        this._habboTalent?.tracking?.trackEventLog('Help', '', 'tour.new_user.accept');
        this._habboTalent?.tracking?.trackGoogle('newbieTourWindow', 'click_acceptTour');
    };

    // AS3: TalentTrackController.as::onCloseTourAd()
    private onCloseTourAd = (event: WindowEvent): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this.destroyTaskProgressDialog();
        }
    };

    /**
     * Declining still sends the read receipt — AS3 marks the advertisement seen either way, so it
     * is not offered again.
     */
    // AS3: TalentTrackController.as::onDeclineTour()
    private onDeclineTour = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.destroyWindow();
        this.destroyTaskProgressDialog();

        this._habboTalent?.send(new GuideAdvertisementReadMessageComposer());
        this._habboTalent?.tracking?.trackEventLog('Help', '', 'tour.new_user.cancel');
        this._habboTalent?.tracking?.trackGoogle('newbieTourWindow', 'click_refuseTour');
    };

    // AS3: TalentTrackController.as::onChangeEmail()
    private onChangeEmail = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        const email = this.getEmailText()?.text ?? '';

        this._habboTalent?.send(new ChangeEmailComposer(email));
    };

    // AS3: TalentTrackController.as::onEmailTxt()
    private onEmailTxt = (event: WindowEvent): void =>
    {
        if(event.type === 'WE_FOCUSED')
        {
            this.setEmailErrorStatus(false);
        }
    };

    /** `result === 0` is success, which shows the "changed" panel rather than an error. */
    // AS3: TalentTrackController.as::setEmailErrorStatus()
    private setEmailErrorStatus(answered: boolean, result: number = 0): void
    {
        const container = this.getEmailContainer();

        if(container === null) return;

        const failed = answered && result !== 0;
        const error = container.findChildByName('error_txt');

        if(error !== null)
        {
            error.visible = failed;
            error.caption = `\${welcome.gift.email.error.${result}}`;
        }

        const border = container.findChildByName('error_border');
        const region = container.findChildByName('change_email_region');
        const changed = container.findChildByName('changed_container');

        if(border !== null) border.visible = failed;
        if(region !== null) region.visible = !answered;
        if(changed !== null) changed.visible = answered && result === 0;
    }

    // AS3: TalentTrackController.as::getEmailText()
    private getEmailText(): ITextFieldWindow | null
    {
        return (this.getEmailContainer()?.findChildByName('email_txt')
            ?? null) as unknown as ITextFieldWindow | null;
    }

    // AS3: TalentTrackController.as::onTaskProgressBackgroundWindowEvent()
    private onTaskProgressBackgroundWindowEvent = (event: WindowEvent): void =>
    {
        if(this._taskProgressPopup === null || this._taskProgressPopup.disposed
            || event.type !== 'WME_CLICK')
        {
            return;
        }

        this.destroyTaskProgressDialog();
    };

    // AS3: TalentTrackController.as::get emailChangeEnabled()
    private get emailChangeEnabled(): boolean
    {
        return this._habboTalent?.getBoolean('talent.progress.emailchange.enabled') ?? false;
    }

    // TS-only: AS3 repeats `windowManager.getWindowContext(3).getDesktopWindow()` at both the
    // subscribe and the unsubscribe.
    private get desktopWindow(): IWindow | null
    {
        return (this._habboTalent?.windowManager
            ?.getWindowContext(TalentTrackController.MODAL_DIALOG_LAYER)
            ?.getDesktopWindow() ?? null) as IWindow | null;
    }

    // AS3: TalentTrackController.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        if(this._talentProgressMeter !== null)
        {
            this._talentProgressMeter.dispose();
            this._talentProgressMeter = null;
        }

        this.destroyWindow();

        log.debug('Talent track controller disposed');

        this._habboTalent = null;
    }
}
