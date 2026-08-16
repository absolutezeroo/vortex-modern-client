import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {CountdownWidget} from '@habbo/window/widgets/CountdownWidget';
import type {
    ResolutionAchievementData
} from '@habbo/communication/messages/parser/quest/ResolutionAchievementData';
import type {
    AchievementNotificationData
} from '@habbo/communication/messages/incoming/notifications/AchievementNotificationData';
import {
    GetResolutionAchievementsMessageComposer
} from '@habbo/communication/messages/outgoing/quest/GetResolutionAchievementsMessageComposer';
import {
    ResetResolutionAchievementMessageComposer
} from '@habbo/communication/messages/outgoing/quest/ResetResolutionAchievementMessageComposer';

import type {HabboQuestEngine} from './HabboQuestEngine';
import type {AchievementData} from './AchievementCategory';
import {AchievementResolutionCompletedView} from './AchievementResolutionCompletedView';
import {AchievementResolutionProgressView} from './AchievementResolutionProgressView';

const log = Logger.getLogger('habbo.quest.AchievementsResolutionController');

/**
 * The "resolution" furni: a piece of furniture the player points at one achievement, which then
 * tracks progress towards it for a season.
 *
 * Three windows, one controller. **This** one is the chooser — a grid of candidate achievements, a
 * detail pane and a countdown; {@link AchievementResolutionProgressView} is what replaces it once a
 * choice is committed, and {@link AchievementResolutionCompletedView} is the congratulation. The two
 * are built lazily and kept.
 *
 * **One header does both reading and writing.** `GetResolutionAchievements(stuffId, 0)` asks for the
 * list; the same composer with a non-zero achievement id *commits* the choice. That is why the save
 * button and the three refresh paths look identical on the wire and are not.
 *
 * **Nothing here polls.** The progress view is refreshed by re-asking with the 0 form whenever an
 * event could have moved the number — a level-up notification or a completed achievement whose id
 * matches the one on screen — which is what {@link onLevelUp} and {@link onAchievement} are for.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/AchievementsResolutionController.as
 */
export class AchievementsResolutionController implements IDisposable
{
    // AS3: AchievementsResolutionController.as::_SafeStr_10490 (name derived from its value)
    private static readonly BUTTON_CLOSE: string = 'header_button_close';

    // AS3: AchievementsResolutionController.as::_SafeStr_10579 (name derived from its value)
    private static readonly BUTTON_SAVE: string = 'save_button';

    // AS3: AchievementsResolutionController.as::_SafeStr_10510 (name derived from its value)
    private static readonly BUTTON_CANCEL: string = 'cancel_button';

    /**
	 * Declared in AS3 and matched by a `case` that does nothing — the OK button is handled by the
	 * layout, not here. Kept so the constant list stays faithful.
	 */
    // AS3: AchievementsResolutionController.as::_SafeStr_10470 (name derived from its value)
    private static readonly BUTTON_OK: string = 'ok_button';

    // AS3: AchievementsResolutionController.as::ELEM_DISABLED_INFO
    private static readonly ELEM_DISABLED_INFO: string = 'disabled.reason';

    // AS3: AchievementsResolutionController.as::_questEngine
    private _questEngine: HabboQuestEngine | null;

    // AS3: AchievementsResolutionController.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: AchievementsResolutionController.as::_progressView
    private _progressView: AchievementResolutionProgressView | null = null;

    // AS3: AchievementsResolutionController.as::_completedView
    private _completedView: AchievementResolutionCompletedView | null = null;

    // AS3: AchievementsResolutionController.as::_stuffId
    private _stuffId: number = 0;

    // AS3: AchievementsResolutionController.as::_SafeStr_6150 (name derived: the candidate list)
    private _achievements: ResolutionAchievementData[] = [];

    // AS3: AchievementsResolutionController.as::_selectedAchievementId
    private _selectedAchievementId: number = -1;

    // AS3: AchievementsResolutionController.as::_endTime
    private _endTime: number = -1;

    // AS3: AchievementsResolutionController.as::AchievementsResolutionController()
    constructor(questEngine: HabboQuestEngine)
    {
        this._questEngine = questEngine;
    }

    // AS3: AchievementsResolutionController.as::dispose()
    dispose(): void
    {
        this._questEngine = null;

        if(this._window === null) return;

        const grid = (this._window.findChildByName('achievements') as IItemGridWindow | null) ?? null;

        grid?.destroyGridItems();

        if(this._progressView !== null)
        {
            this._progressView.dispose();
            this._progressView = null;
        }

        if(this._completedView !== null)
        {
            this._completedView.dispose();
            this._completedView = null;
        }

        (this._window as unknown as IWindow).dispose();
        this._window = null;
    }

    // AS3: AchievementsResolutionController.as::get disposed()
    get disposed(): boolean
    {
        return this._questEngine == null;
    }

    /**
	 * An empty list returns before the window is even built — the server sends one for a furni whose
	 * season has no candidates, and AS3 treats that as "nothing to show" rather than an empty chooser.
	 */
    // AS3: AchievementsResolutionController.as::onResolutionAchievements()
    onResolutionAchievements(stuffId: number, achievements: ResolutionAchievementData[], endTime: number): void
    {
        this._stuffId = stuffId;
        this._achievements = achievements;
        this._endTime = endTime;

        if(achievements.length === 0)
        {
            return;
        }

        this.refresh();

        if(this._window === null) return;

        (this._window as unknown as IWindow).visible = true;
        this._selectedAchievementId = this._achievements[0].achievementId;
        this.populateAchievementGrid();
        this.selectAchievement(this._selectedAchievementId);
    }

    // AS3: AchievementsResolutionController.as::onResolutionProgress()
    onResolutionProgress(
        stuffId: number,
        achievementId: number,
        badgeCode: string,
        userProgress: number,
        totalProgress: number,
        endTime: number
    ): void
    {
        this._progressView ??= new AchievementResolutionProgressView(this);
        this._progressView.show(stuffId, achievementId, badgeCode, userProgress, totalProgress, endTime);
    }

    /**
	 * AS3 takes `(badgeCode, stuffCode)` and passes them to the view the other way round — the view's
	 * first parameter is the *stuff* code. Kept, argument swap included.
	 */
    // AS3: AchievementsResolutionController.as::onResolutionCompleted()
    onResolutionCompleted(badgeCode: string, stuffCode: string): void
    {
        this._completedView ??= new AchievementResolutionCompletedView(this);
        this._completedView.show(stuffCode, badgeCode);
    }

    /**
	 * A level-up notification carries the achievement's *type* where the progress view holds an
	 * achievement id, and AS3 compares the two directly. Transcribed as written.
	 */
    // AS3: AchievementsResolutionController.as::onLevelUp()
    onLevelUp(data: AchievementNotificationData | null): void
    {
        if(data == null) return;

        if(this._progressView?.visible === true && data.type === this._progressView.achievementId)
        {
            this._questEngine?.send(new GetResolutionAchievementsMessageComposer(this._progressView.stuffId, 0));
        }
    }

    // AS3: AchievementsResolutionController.as::onAchievement()
    onAchievement(data: AchievementData | null): void
    {
        if(data == null) return;

        if(this._progressView?.visible === true && data.achievementId === this._progressView.achievementId)
        {
            this._questEngine?.send(new GetResolutionAchievementsMessageComposer(this._progressView.stuffId, 0));
        }
    }

    /**
	 * Confirmed reset sends **two** messages: the reset itself, then a re-read so the progress view
	 * redraws with the choice gone. The second one reads `_progressView.stuffId` rather than the
	 * `stuffId` argument — the same value, by the guard above.
	 */
    // AS3: AchievementsResolutionController.as::resetResolution()
    resetResolution(stuffId: number): void
    {
        if(this._progressView?.visible !== true || stuffId !== this._progressView.stuffId) return;

        this._questEngine?.windowManager?.confirm(
            '${resolution.reset.confirmation.title}',
            '${resolution.reset.confirmation.text}',
            0,
            (dialog, event) =>
            {
                dialog.dispose();

                if(event.type !== 'WE_OK') return;

                this._questEngine?.send(new ResetResolutionAchievementMessageComposer(stuffId));
                this._questEngine?.send(
                    new GetResolutionAchievementsMessageComposer(this._progressView?.stuffId ?? stuffId, 0)
                );
            }
        );
    }

    // AS3: AchievementsResolutionController.as::refresh()
    private refresh(): void
    {
        if(this._window === null)
        {
            this.prepareWindow();
        }

        const holder = (this._window?.findChildByName('countdown_widget') as IWidgetWindow | null) ?? null;
        const widget = (holder?.widget as CountdownWidget | null) ?? null;

        if(widget === null) return;

        widget.seconds = this._endTime;
        widget.running = true;
    }

    // AS3: AchievementsResolutionController.as::prepareWindow()
    private prepareWindow(): void
    {
        if(this._window !== null)
        {
            return;
        }

        const built = this._questEngine?.getXmlWindow('AchievementsResolutions') ?? null;

        this._window = built as unknown as IWindowContainer | null;

        if(this._window === null)
        {
            log.warn('Missing layout "AchievementsResolutions" — the resolution chooser is not built');

            return;
        }

        const close = this._window.findChildByTag('close');

        if(close !== null) close.procedure = this.onWindowClose;

        (this._window as unknown as IWindow).center();
        (this._window as unknown as IWindow).visible = true;

        this.addClickListener(AchievementsResolutionController.BUTTON_CLOSE);
        this.addClickListener(AchievementsResolutionController.BUTTON_SAVE);
        this.addClickListener(AchievementsResolutionController.BUTTON_CANCEL);
    }

    // AS3: AchievementsResolutionController.as::onWindowClose()
    private onWindowClose = (event: WindowEvent): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this.close();
        }
    };

    // AS3: AchievementsResolutionController.as::addClickListener()
    private addClickListener(name: string): void
    {
        this._window?.findChildByName(name)?.addEventListener('WME_CLICK', this.onMouseClick);
    }

    /**
	 * **Save closes the window before asking.** The confirmation then either commits — the same
	 * composer as the list request, with the chosen id instead of 0 — or puts the window back. AS3's
	 * order, and it is deliberate: the confirm dialog would otherwise sit on top of the chooser.
	 */
    // AS3: AchievementsResolutionController.as::onMouseClick()
    private onMouseClick = (event: WindowEvent): void =>
    {
        switch(event.target?.name)
        {
            case AchievementsResolutionController.BUTTON_CLOSE:
            case AchievementsResolutionController.BUTTON_CANCEL:
                this.close();
                break;
            case AchievementsResolutionController.BUTTON_SAVE:
                this.close();
                this._questEngine?.windowManager?.confirm(
                    '${resolution.confirmation.title}',
                    '${resolution.confirmation.text}',
                    0,
                    (dialog, confirmEvent) =>
                    {
                        dialog.dispose();

                        if(confirmEvent.type === 'WE_OK')
                        {
                            this._questEngine?.send(new GetResolutionAchievementsMessageComposer(
                                this._stuffId, this._selectedAchievementId
                            ));
                        }
                        else if(this._window !== null)
                        {
                            (this._window as unknown as IWindow).visible = true;
                        }
                    }
                );
                break;
            case AchievementsResolutionController.BUTTON_OK:
                // AS3's case body is empty.
                break;
        }
    };

    // AS3: AchievementsResolutionController.as::isVisible()
    isVisible(): boolean
    {
        return this._window !== null && (this._window as unknown as IWindow).visible;
    }

    // AS3: AchievementsResolutionController.as::close()
    close(): void
    {
        if(this._window !== null)
        {
            (this._window as unknown as IWindow).visible = false;
        }
    }

    /**
	 * Each cell is a clone of the `AchievementSimple` layout, carrying the achievement id as its
	 * window id — which is how {@link onSelectAchievementProc} knows what was clicked, off the
	 * clicked region's *parent*.
	 */
    // AS3: AchievementsResolutionController.as::populateAchievementGrid()
    private populateAchievementGrid(): void
    {
        if(this._window === null) return;

        const grid = (this._window.findChildByName('achievements') as IItemGridWindow | null) ?? null;

        if(grid === null) return;

        grid.destroyGridItems();

        const template = this._questEngine?.getXmlWindow('AchievementSimple') ?? null;

        if(template === null)
        {
            log.warn('Missing layout "AchievementSimple" — the resolution grid stays empty');

            return;
        }

        for(const achievement of this._achievements)
        {
            const cell = template.clone() as unknown as IWindowContainer;

            (cell as unknown as IWindow).id = achievement.achievementId;
            this.refreshBadgeImage(cell, achievement);

            const region = cell.findChildByName('bg_region');

            if(region !== null) region.procedure = this.onSelectAchievementProc;

            const selected = cell.findChildByName('bg_selected_bitmap');

            if(selected !== null) selected.visible = false;

            grid.addGridItem(cell as unknown as IWindow);
        }
    }

    // AS3: AchievementsResolutionController.as::hiliteGridItem()
    private hiliteGridItem(achievementId: number, highlighted: boolean): void
    {
        const grid = (this._window?.findChildByName('achievements') as IItemGridWindow | null) ?? null;
        const cell = (grid?.getGridItemByID(achievementId) as unknown as IWindowContainer | null) ?? null;

        if(cell === null) return;

        const selected = cell.findChildByName('bg_selected_bitmap');

        if(selected !== null) selected.visible = highlighted;
    }

    /**
	 * An id with no matching achievement returns **after** the old highlight has been cleared, so a
	 * stale selection is dropped rather than left lit.
	 */
    // AS3: AchievementsResolutionController.as::selectAchievement()
    private selectAchievement(achievementId: number): void
    {
        if(this._selectedAchievementId !== -1)
        {
            this.hiliteGridItem(this._selectedAchievementId, false);
        }

        const achievement = this.findAchievement(achievementId);

        if(achievement === null || this._window === null)
        {
            return;
        }

        this._selectedAchievementId = achievementId;
        this.hiliteGridItem(this._selectedAchievementId, true);

        const localization = this._questEngine?.localization ?? null;
        const name = this._window.findChildByName('achievement.name');
        const description = this._window.findChildByName('achievement.description');
        const level = this._window.findChildByName('achievement.level');

        if(name !== null) name.caption = localization?.getBadgeName(achievement.badgeId) ?? '';
        if(description !== null) description.caption = localization?.getBadgeDesc(achievement.badgeId) ?? '';
        if(level !== null) level.caption = String(achievement.level);

        localization?.registerParameter(
            'resolution.achievement.target.value', 'level', String(achievement.requiredLevel)
        );

        this.refreshBadgeImageLarge(achievement);

        if(achievement.enabled)
        {
            this.enable();
        }
        else
        {
            this.disable(achievement.state);
        }
    }

    /**
	 * The reason key is built from the achievement's state, so an unknown state renders its own key
	 * rather than an empty line.
	 */
    // AS3: AchievementsResolutionController.as::disable()
    private disable(state: number): void
    {
        if(this._window === null) return;

        const window = this._window as unknown as IWindow;

        window.setVisibleChildren(false, [AchievementsResolutionController.BUTTON_SAVE]);
        window.setVisibleChildren(true, [AchievementsResolutionController.ELEM_DISABLED_INFO]);

        const reason = this._window.findChildByName(AchievementsResolutionController.ELEM_DISABLED_INFO);

        if(reason !== null) reason.caption = '${resolution.disabled.' + state + '}';
    }

    // AS3: AchievementsResolutionController.as::enable()
    enable(): void
    {
        if(this._window === null) return;

        const window = this._window as unknown as IWindow;

        window.setVisibleChildren(true, [AchievementsResolutionController.BUTTON_SAVE]);
        window.setVisibleChildren(false, [AchievementsResolutionController.ELEM_DISABLED_INFO]);
    }

    // AS3: AchievementsResolutionController.as::onSelectAchievementProc()
    private onSelectAchievementProc = (event: WindowEvent, window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        // The id lives on the cell, and the procedure is on the region inside it.
        const parent = window.parent;

        if(parent !== null) this.selectAchievement(parent.id);
    };

    /**
	 * A null achievement hides the slot outright — AS3 guards for it even though
	 * `populateAchievementGrid()` never passes one.
	 */
    // AS3: AchievementsResolutionController.as::refreshBadgeImage()
    private refreshBadgeImage(cell: IWindowContainer, achievement: ResolutionAchievementData | null): void
    {
        const holder = (cell.findChildByName('achievement_pic_bitmap') as IWidgetWindow | null) ?? null;

        if(holder === null) return;

        if(achievement === null)
        {
            (holder as unknown as IWindow).visible = false;

            return;
        }

        this.applyBadge(holder, achievement);
    }

    // AS3: AchievementsResolutionController.as::refreshBadgeImageLarge()
    private refreshBadgeImageLarge(achievement: ResolutionAchievementData): void
    {
        const holder = (this._window?.findChildByName('achievement_badge') as IWidgetWindow | null) ?? null;

        if(holder === null) return;

        this.applyBadge(holder, achievement);
    }

    /**
	 * TS-only: AS3 writes these four lines twice, once per badge slot. The loading spinner goes in
	 * first so the slot shows something while the badge image is fetched, and a locked achievement is
	 * greyed rather than hidden.
	 */
    // TS-only: no AS3 counterpart; AS3 inlines these four lines in refreshBadgeImage() and
    // refreshBadgeImageLarge() separately.
    private applyBadge(holder: IWidgetWindow, achievement: ResolutionAchievementData): void
    {
        const widget = holder.widget as IBadgeImageWidget | null;
        const root = holder.rootWindow as unknown as IWindowContainer | null;
        const bitmap = (root?.findChildByName('bitmap') ?? null) as IStaticBitmapWrapperWindow | null;

        if(bitmap !== null) bitmap.assetUri = 'common_loading_icon';

        if(widget !== null)
        {
            widget.badgeId = achievement.badgeId;
            widget.greyscale = !achievement.enabled;
        }

        (holder as unknown as IWindow).visible = true;
    }

    // AS3: AchievementsResolutionController.as::findAchievement()
    private findAchievement(achievementId: number): ResolutionAchievementData | null
    {
        for(const achievement of this._achievements)
        {
            if(achievement.achievementId === achievementId)
            {
                return achievement;
            }
        }

        return null;
    }

    // AS3: AchievementsResolutionController.as::get questEngine()
    get questEngine(): HabboQuestEngine | null
    {
        return this._questEngine;
    }
}
