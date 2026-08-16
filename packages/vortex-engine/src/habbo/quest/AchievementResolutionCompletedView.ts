import type {IDisposable} from '@core/runtime';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {IBadgeImageWidget} from '@habbo/window/widgets/IBadgeImageWidget';

import type {AchievementsResolutionController} from './AchievementsResolutionController';

const log = Logger.getLogger('habbo.quest.AchievementResolutionCompletedView');

/**
 * "You made it" — the panel shown when a resolution's achievement is finally earned. One badge, one
 * close button, no progress and no countdown.
 *
 * Unlike its progress sibling this one re-centres on **every** show, not only when the achievement
 * changes: it is a one-shot congratulation rather than a panel that gets updated in place.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/AchievementResolutionCompletedView.as
 */
export class AchievementResolutionCompletedView implements IDisposable
{
    // AS3: AchievementResolutionCompletedView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: AchievementsResolutionController | null;

    // AS3: AchievementResolutionCompletedView.as::_window
    private _window: IWindowContainer | null = null;

    /**
	 * Stored by `show()` and read by nothing, in AS3 as here.
	 */
    // AS3: AchievementResolutionCompletedView.as::_stuffCode
    private _stuffCode: string = '';

    // AS3: AchievementResolutionCompletedView.as::_badgeCode
    private _badgeCode: string = '';

    // AS3: AchievementResolutionCompletedView.as::AchievementResolutionCompletedView()
    constructor(controller: AchievementsResolutionController)
    {
        this._controller = controller;
    }

    // AS3: AchievementResolutionCompletedView.as::dispose()
    dispose(): void
    {
        this._controller = null;

        if(this._window !== null)
        {
            (this._window as unknown as IWindow).dispose();
            this._window = null;
        }
    }

    /**
	 * **AS3 writes `!= null` here, where every sibling writes `== null`** — so this answers "disposed"
	 * while the view is still alive, and false once it has been torn down. It is a bug in the dump,
	 * transcribed rather than corrected: nothing in the client reads it, so fixing it would change no
	 * behaviour and would hide the discrepancy from whoever reads this next.
	 */
    // AS3: AchievementResolutionCompletedView.as::get disposed()
    get disposed(): boolean
    {
        return this._controller != null;
    }

    // AS3: AchievementResolutionCompletedView.as::get visible()
    get visible(): boolean
    {
        if(this._window == null)
        {
            return false;
        }

        return (this._window as unknown as IWindow).visible;
    }

    // AS3: AchievementResolutionCompletedView.as::show()
    show(stuffCode: string, badgeCode: string): void
    {
        if(this._window == null)
        {
            this.createWindow();
        }

        if(this._window == null) return;

        this.initializeWindow();

        this._stuffCode = stuffCode;
        this._badgeCode = badgeCode;

        this.setBadge(this._badgeCode);

        (this._window as unknown as IWindow).visible = true;
    }

    // AS3: AchievementResolutionCompletedView.as::createWindow()
    private createWindow(): void
    {
        const built = this._controller?.questEngine?.getXmlWindow('AchievementResolutionCompleted') ?? null;

        this._window = built as unknown as IWindowContainer | null;

        if(this._window == null)
        {
            log.warn('Missing layout "AchievementResolutionCompleted" — the resolution completed panel is not built');

            return;
        }

        this.addClickListener('header_button_close');
        this.addClickListener('cancel_button');
    }

    // AS3: AchievementResolutionCompletedView.as::addClickListener()
    private addClickListener(name: string): void
    {
        this._window?.findChildByName(name)?.addEventListener('WME_CLICK', this.onMouseClick);
    }

    // AS3: AchievementResolutionCompletedView.as::onMouseClick()
    private onMouseClick = (event: WindowEvent): void =>
    {
        switch(event.target?.name)
        {
            case 'header_button_close':
            case 'cancel_button':
                this.close();
                break;
        }
    };

    // AS3: AchievementResolutionCompletedView.as::initializeWindow()
    private initializeWindow(): void
    {
        (this._window as unknown as IWindow | null)?.center();
    }

    /**
	 * The loading spinner goes into the widget's root window first, so the slot shows something while
	 * the badge image is fetched — the same two-step every badge holder in the client does.
	 */
    // AS3: AchievementResolutionCompletedView.as::setBadge()
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

    // AS3: AchievementResolutionCompletedView.as::close()
    close(): void
    {
        if(this._window !== null)
        {
            (this._window as unknown as IWindow).visible = false;
        }
    }
}
