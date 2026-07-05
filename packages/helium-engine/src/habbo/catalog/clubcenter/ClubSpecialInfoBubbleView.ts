import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IBubbleWindow} from '@core/window/components/IBubbleWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {ScrKickbackData} from '@habbo/communication/messages/incoming/users/ScrKickbackData';
import type {IHabboClubCenter} from './IHabboClubCenter';

const LAYOUT_NAME = 'club_special_info_popup_bubble';

/**
 * Payday breakdown bubble: shows the club payday reward math anchored next
 * to the "special_content_postit" link in ClubCenterView. Dismisses itself
 * on any click, inside or outside its own content.
 *
 * @see sources/win63_version/habbo/catalog/clubcenter/ClubSpecialInfoBubbleView.as
 */
export class ClubSpecialInfoBubbleView
{
	// AS3: MARGIN
	private static readonly MARGIN: number = 8;

	private _manager: IHabboClubCenter | null;
	private _window: IWindowContainer | null = null;
	private _desktop: IWindow | null = null;
	private _activateTimer: ReturnType<typeof setTimeout> | null = null;
	private readonly _onDesktopDown = (event: WindowEvent): void => this.onDesktopDown(event);

	constructor(manager: IHabboClubCenter, windowManager: IHabboWindowManager, kickbackData: ScrKickbackData, anchor: IWindow)
	{
		this._manager = manager;

		const built = windowManager.buildWidgetLayout(LAYOUT_NAME) as IWindowContainer | null;

		if (!built) return;

		this._window = built;
		this._window.procedure = this.onInput;
		this._desktop = windowManager.getDesktop(1);

		this.positionWindow(anchor);

		this.setElementText('info_creditsspent', this.getLocalization('hccenter.breakdown.creditsspent').replace('%credits%', String(kickbackData.totalCreditsSpent)));

		const percent = kickbackData.kickbackPercentage * 100;
		const multiplier = String(kickbackData.kickbackPercentage);

		let factorText = this._manager.localization?.getLocalization('hccenter.breakdown.paydayfactor.percent', '') ?? '';

		if (factorText && factorText.length > 0)
		{
			factorText = factorText.replace('%percent%', String(percent)).replace('%multiplier%', multiplier);
		}
		else
		{
			factorText = this.getLocalization('hccenter.breakdown.paydayfactor').replace('%percent%', multiplier);
		}

		this.setElementText('info_factor', factorText);

		this.setElementText('info_streakbonus', this.getLocalization('hccenter.breakdown.streakbonus').replace('%credits%', String(kickbackData.creditRewardForStreakBonus)));

		const actualReward = Math.trunc((kickbackData.kickbackPercentage * kickbackData.totalCreditsSpent + kickbackData.creditRewardForStreakBonus) * 100) / 100;
		const cappedReward = Math.trunc((kickbackData.creditRewardForMonthlySpent + kickbackData.creditRewardForStreakBonus) * 100) / 100;

		this.setElementText('info_total', this.getLocalization('hccenter.breakdown.total').replace('%credits%', String(cappedReward)).replace('%actual%', String(actualReward)));

		this._window.activate();

		this._activateTimer = setTimeout(() => this.onTimerEvent(), 80);

		this._desktop?.addEventListener(WindowMouseEvent.DOWN, this._onDesktopDown);
	}

	dispose(): void
	{
		this._desktop?.removeEventListener(WindowMouseEvent.DOWN, this._onDesktopDown);
		this._desktop = null;

		if (this._activateTimer !== null)
		{
			clearTimeout(this._activateTimer);
			this._activateTimer = null;
		}

		if (this._window)
		{
			this._window.dispose();
			this._window = null;
		}

		this._manager = null;
	}

	private onTimerEvent(): void
	{
		this._activateTimer = null;
		this._window?.activate();
	}

	private positionWindow(anchor: IWindow): void
	{
		if (!this._window || !this._manager || !this._desktop) return;

		const desktop = this._desktop;

		const anchorPos = {x: 0, y: 0};

		anchor.getGlobalPosition(anchorPos);

		const desktopWidth = desktop.width;

		if (desktopWidth < anchorPos.x + anchor.width + this._window.width + ClubSpecialInfoBubbleView.MARGIN
			&& anchorPos.x > this._window.width + ClubSpecialInfoBubbleView.MARGIN)
		{
			(this._window as unknown as IBubbleWindow).direction = 'right';
			anchorPos.x -= this._window.width + ClubSpecialInfoBubbleView.MARGIN;
		}
		else
		{
			anchorPos.x += anchor.width + ClubSpecialInfoBubbleView.MARGIN;
		}

		anchorPos.y += anchor.height * 0.5 - this._window.height * 0.5;
		this._window.position = anchorPos;
	}

	private onInput = (event: WindowEvent, window: IWindow): void =>
	{
		if (event.type !== WindowMouseEvent.DOWN || !this._manager) return;

		event.stopImmediatePropagation();

		if (window.name === 'special_infolink')
		{
			this._manager.openPaydayHelpPage();
		}

		this._manager.removeBreakdown();
	};

	// TS-only: AS3 listens on the Flash `Stage` for ANY click to dismiss the
	// bubble (see class header). This port's window system bubbles mouse-down
	// events up to the shared desktop root instead, so it's the desktop that
	// gets a listener here; the bubble's own onInput() already
	// stopImmediatePropagation()s clicks on its own content before they'd
	// reach this handler.
	private onDesktopDown(event: WindowEvent): void
	{
		this._manager?.removeBreakdown();
	}

	private setElementText(name: string, text: string): void
	{
		const el = this._window?.findChildByName(name) as ITextWindow | null;

		if (el) el.text = text;
	}

	private getLocalization(key: string): string
	{
		if (!this._manager?.localization) return '';

		return this._manager.localization.getLocalization(key, key);
	}
}
