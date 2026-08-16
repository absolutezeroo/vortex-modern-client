import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';
import type {CountdownWidget} from '@habbo/window/widgets/CountdownWidget';

import type {AchievementsResolutionController} from './AchievementsResolutionController';

const log = Logger.getLogger('habbo.quest.AchievementResolutionProgressView');

/**
 * "You are working towards this achievement" — the panel a resolution furni shows once a choice has
 * been committed: the badge, its name and description, a progress bar, and a countdown to the
 * deadline.
 *
 * **The progress bar is three windows, not one.** A left cap, a stretching middle and a right cap;
 * the right cap appears only at exactly 100%, which is what gives the bar a flat edge until it is
 * complete. The middle's authored width is captured once at build time and used as the 100% mark
 * forever after — so the bar must never be resized by anything else.
 *
 * **Re-showing for a *different* achievement resets the bar first.** `show()` compares the incoming
 * achievement id against the one on screen and, only when they differ, hides all three bar pieces and
 * re-centres — otherwise a progress update would briefly paint the old achievement's fill.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/AchievementResolutionProgressView.as
 */
export class AchievementResolutionProgressView implements IDisposable
{
    // AS3: AchievementResolutionProgressView.as::PROGRESSBAR_LEFT
    private static readonly PROGRESSBAR_LEFT: string = 'achieved_left';

    // AS3: AchievementResolutionProgressView.as::PROGRESSBAR_MID
    private static readonly PROGRESSBAR_MID: string = 'achieved_mid';

    // AS3: AchievementResolutionProgressView.as::PROGRESSBAR_RIGHT
    private static readonly PROGRESSBAR_RIGHT: string = 'achieved_right';

    // AS3: AchievementResolutionProgressView.as::_SafeStr_9649 (name derived: the bar's full width)
    private _fullBarWidth: number = 0;

    // AS3: AchievementResolutionProgressView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: AchievementsResolutionController | null;

    // AS3: AchievementResolutionProgressView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: AchievementResolutionProgressView.as::_stuffId
    private _stuffId: number = 0;

    // AS3: AchievementResolutionProgressView.as::_SafeStr_8123 (name derived: the achievement shown)
    private _achievementId: number = 0;

    // AS3: AchievementResolutionProgressView.as::_badgeCode
    private _badgeCode: string = '';

    // AS3: AchievementResolutionProgressView.as::AchievementResolutionProgressView()
    constructor(controller: AchievementsResolutionController)
    {
        this._controller = controller;
    }

    // AS3: AchievementResolutionProgressView.as::dispose()
    dispose(): void
    {
        if(this._window !== null)
        {
            (this._window as unknown as IWindow).dispose();
            this._window = null;
        }

        this._controller = null;
    }

    // AS3: AchievementResolutionProgressView.as::get disposed()
    get disposed(): boolean
    {
        return this._controller == null;
    }

    // AS3: AchievementResolutionProgressView.as::get achievementId()
    get achievementId(): number
    {
        return this._achievementId;
    }

    // AS3: AchievementResolutionProgressView.as::get stuffId()
    get stuffId(): number
    {
        return this._stuffId;
    }

    // AS3: AchievementResolutionProgressView.as::get visible()
    get visible(): boolean
    {
        if(this._window == null)
        {
            return false;
        }

        return (this._window as unknown as IWindow).visible;
    }

    /**
	 * Note the reset test runs against the *old* `_achievementId`, before the new one is stored.
	 */
    // AS3: AchievementResolutionProgressView.as::show()
    show(
        stuffId: number,
        achievementId: number,
        badgeCode: string,
        userProgress: number,
        requiredProgress: number,
        secondsLeft: number
    ): void
    {
        if(this._window == null)
        {
            this.createWindow();
        }

        if(this._window == null) return;

        if(achievementId !== this._achievementId)
        {
            this.initializeWindow();
            (this._window as unknown as IWindow).center();
        }

        this._stuffId = stuffId;
        this._achievementId = achievementId;
        this._badgeCode = badgeCode;

        this.setProgress(userProgress, requiredProgress);
        this.setBadge(this._badgeCode);
        this.setLocalizations();
        this.setCountdown(secondsLeft);

        (this._window as unknown as IWindow).visible = true;
    }

    /**
	 * The two caps are shown together as soon as there is any progress at all, and the right one is
	 * then hidden again unless the bar is full — AS3 writes it in that order and the net effect is
	 * "left+mid from the first point, right only at 100%".
	 */
    // AS3: AchievementResolutionProgressView.as::setProgress()
    private setProgress(userProgress: number, requiredProgress: number): void
    {
        if(this._window == null) return;

        const ratio = Math.min(1, userProgress / requiredProgress);
        const window = this._window as unknown as IWindow;

        if(ratio > 0)
        {
            window.setVisibleChildren(true, [
                AchievementResolutionProgressView.PROGRESSBAR_LEFT,
                AchievementResolutionProgressView.PROGRESSBAR_MID,
            ]);

            const right = this._window.findChildByName(AchievementResolutionProgressView.PROGRESSBAR_RIGHT);

            if(right !== null) right.visible = ratio === 1;
        }

        const mid = this._window.findChildByName(AchievementResolutionProgressView.PROGRESSBAR_MID);

        if(mid !== null) mid.width = this._fullBarWidth * ratio;

        const localization = this._controller?.questEngine?.localization ?? null;

        localization?.registerParameter('resolution.progress.progress', 'progress', String(userProgress));
        localization?.registerParameter('resolution.progress.progress', 'total', String(requiredProgress));
    }

    /**
	 * The loading spinner is written into the widget's own root window before the badge id, so the
	 * slot shows something while the badge image is fetched.
	 */
    // AS3: AchievementResolutionProgressView.as::setBadge()
    private setBadge(badgeCode: string): void
    {
        if(this._window == null) return;

        const holder = (this._window.findChildByName('achievement_badge') as IWidgetWindow | null) ?? null;

        if(holder == null) return;

        const widget = holder.widget as IBadgeImageWidget | null;
        const root = holder.rootWindow as unknown as IWindowContainer | null;
        const bitmap = (root?.findChildByName('bitmap') ?? null) as IStaticBitmapWrapperWindow | null;

        if(bitmap !== null) bitmap.assetUri = 'common_loading_icon';

        if(widget !== null) widget.badgeId = badgeCode;

        (holder as unknown as IWindow).visible = true;
    }

    // AS3: AchievementResolutionProgressView.as::setLocalizations()
    private setLocalizations(): void
    {
        if(this._window == null) return;

        const localization = this._controller?.questEngine?.localization ?? null;
        const name = this._window.findChildByName('achievement.name');
        const description = this._window.findChildByName('achievement.desc');

        if(name !== null) name.caption = localization?.getBadgeName(this._badgeCode) ?? '';
        if(description !== null) description.caption = localization?.getBadgeDesc(this._badgeCode) ?? '';
    }

    // AS3: AchievementResolutionProgressView.as::setCountdown()
    private setCountdown(seconds: number): void
    {
        const holder = (this._window?.findChildByName('time_left_widget') as IWidgetWindow | null) ?? null;
        const widget = (holder?.widget as CountdownWidget | null) ?? null;

        if(widget === null) return;

        widget.seconds = seconds;
        widget.running = true;
    }

    // AS3: AchievementResolutionProgressView.as::createWindow()
    private createWindow(): void
    {
        const built = this._controller?.questEngine?.getXmlWindow('AchievementResolutionProgress') ?? null;

        this._window = built as unknown as IWindowContainer | null;

        if(this._window == null)
        {
            log.warn('Missing layout "AchievementResolutionProgress" — the resolution progress panel is not built');

            return;
        }

        const close = this._window.findChildByTag('close');

        if(close !== null) close.procedure = this.onWindowClose;

        const reset = this._window.findChildByName('reset_button');

        if(reset !== null) reset.procedure = this.onResetButton;

        // Captured once, while the layout is still at its authored width — this is the 100% mark.
        this._fullBarWidth = this._window.findChildByName(AchievementResolutionProgressView.PROGRESSBAR_MID)?.width ?? 0;
    }

    // AS3: AchievementResolutionProgressView.as::initializeWindow()
    private initializeWindow(): void
    {
        if(this._window == null) return;

        const window = this._window as unknown as IWindow;

        window.center();
        window.setVisibleChildren(false, [
            AchievementResolutionProgressView.PROGRESSBAR_LEFT,
            AchievementResolutionProgressView.PROGRESSBAR_MID,
            AchievementResolutionProgressView.PROGRESSBAR_RIGHT,
        ]);
    }

    // AS3: AchievementResolutionProgressView.as::close()
    close(): void
    {
        if(this._window !== null)
        {
            (this._window as unknown as IWindow).visible = false;
        }
    }

    // AS3: AchievementResolutionProgressView.as::onWindowClose()
    private onWindowClose = (event: WindowEvent): void =>
    {
        if(event.type === 'WME_CLICK')
        {
            this.close();
        }
    };

    /**
	 * The confirmation lives in the controller, not here — this only asks and closes. Closing before
	 * the player has answered is AS3's own order.
	 */
    // AS3: AchievementResolutionProgressView.as::onResetButton()
    private onResetButton = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._controller?.resetResolution(this._stuffId);
        this.close();
    };
}
