import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomPreviewerWidget} from '@habbo/window/widgets/IRoomPreviewerWidget';
import type {IAvatarImageListener} from '@habbo/avatar/IAvatarImageListener';
import type {IAvatarImage} from '@habbo/avatar/IAvatarImage';
import type {IHabboCatalogPurse} from '@habbo/catalog/purse/IHabboCatalogPurse';
import type {ScrKickbackData} from '@habbo/communication/messages/incoming/users/ScrKickbackData';
import {FriendlyTime} from '@habbo/utils/FriendlyTime';
import {ClubStatus} from './util/ClubStatus';
import type {IHabboClubCenter} from './IHabboClubCenter';

const LAYOUT_NAME = 'club_center';

/**
 * Habbo Club Center popup window: status, badge, gift count, and payday
 * summary. Buttons deep-link into the catalog buy/gift pages.
 *
 * @see sources/win63_version/habbo/catalog/clubcenter/ClubCenterView.as
 */
export class ClubCenterView implements IAvatarImageListener
{
	private _manager: IHabboClubCenter | null;
	private _window: IWindowContainer | null = null;
	private _avatarWidget: IRoomPreviewerWidget | null = null;
	private _figure: string;

	constructor(manager: IHabboClubCenter, windowManager: IHabboWindowManager, figure: string)
	{
		this._manager = manager;
		this._figure = figure;

		const built = windowManager.buildWidgetLayout(LAYOUT_NAME) as IWindowContainer | null;

		if (!built) return;

		this._window = built;

		if (!this._manager.isKickbackEnabled())
		{
			this.removeElement('special_breakdown_link');
			this.removeElement('special_content');
			this.removeElement('special_content_postit');
			this._window.invalidate();
		}
		else
		{
			this.setElementVisibility('special_amount_icon', false);
			this.setElementVisibility('special_amount_title', false);
			this.setElementVisibility('special_amount_content', false);
			this.setElementVisibility('special_breakdown_link', false);
			this.setElementVisibility('special_time_content', false);
		}

		this.setElementVisibility('btn_earn', false);
		this._manager.getOffers();

		this._window.center();
		this._window.addEventListener(WindowEvent.WE_RELOCATE, this.onRelocate);

		this._avatarWidget = (this._window.findChildByName('avatar') as IWidgetWindow | null)?.widget as IRoomPreviewerWidget | null ?? null;

		this.updateAvatarPreview();

		this._window.procedure = this.onInput;
	}

	get disposed(): boolean
	{
		return this._manager === null;
	}

	dispose(): void
	{
		if (this._window)
		{
			this._window.removeEventListener(WindowEvent.WE_RELOCATE, this.onRelocate);
			this._window.dispose();
			this._window = null;
		}

		this._manager = null;
	}

	// AS3: sources/win63_version/habbo/catalog/clubcenter/ClubCenterView.as::dataReceived()
	dataReceived(
		kickbackData: ScrKickbackData | null,
		purse: IHabboCatalogPurse | null,
		giftsAvailable: number,
		clubStatus: string,
		badgeId: string | null
	): void
	{
		this.setElementText('status_title', `\${hccenter.status.${clubStatus}}`);

		const badgeWidget = (this._window?.findChildByName('hc_badge') as IWidgetWindow | null)?.widget as {badgeId: string} | null;

		if (badgeWidget)
		{
			badgeWidget.badgeId = badgeId ?? '';
		}

		if (!kickbackData || !purse)
		{
			this.setElementVisibility('gift_content', false);
			this.setElementVisibility('special_container', false);

			return;
		}

		this.setElementVisibility('gift_content', true);

		let info = this.getLocalization(`hccenter.status.${clubStatus}.info`);

		info = info.replace('%timeleft%', this.formatMinutes(purse.minutesUntilExpiration));
		info = info.replace('%joindate%', kickbackData.firstSubscriptionDate);
		info = info.replace('%streakduration%', this.formatDays(kickbackData.currentHcStreak));
		this.setElementText('status_info', info);

		if (this._manager?.isKickbackEnabled())
		{
			if (kickbackData.timeUntilPayday < 60)
			{
				this.setElementText('special_time_content', this.getLocalization('hccenter.special.time.soon'));
			}
			else
			{
				this.setElementText('special_time_content', this.formatMinutes(kickbackData.timeUntilPayday));
			}

			this.setElementVisibility('special_time_content', true);

			const rewardSum = kickbackData.creditRewardForMonthlySpent + kickbackData.creditRewardForStreakBonus;

			if (rewardSum > 0)
			{
				this.setElementVisibility('special_amount_icon', true);
				this.setElementVisibility('special_amount_title', true);
				this.setElementVisibility('special_amount_content', true);
				this.setElementVisibility('special_breakdown_link', true);
				this.setElementText('special_amount_content', this.getLocalization('hccenter.special.sum').replace('%credits%', String(rewardSum)));
			}
		}

		const giftButton = this._window?.findChildByName('btn_gift') ?? null;

		if (clubStatus === ClubStatus.ACTIVE && giftsAvailable > 0)
		{
			if (giftButton) giftButton.caption = '${hccenter.btn.gifts.redeem}';

			this.setElementText('gift_info', this.getLocalization('hccenter.unclaimedgifts').replace('%unclaimedgifts%', String(giftsAvailable)));
		}
		else
		{
			if (giftButton) giftButton.caption = '${hccenter.btn.gifts.view}';

			this.setElementText('gift_info', this.getLocalization('hccenter.gift.info'));
		}

		const buyButton = this._window?.findChildByName('btn_buy') ?? null;

		if (buyButton)
		{
			buyButton.caption = clubStatus === ClubStatus.ACTIVE ? '${hccenter.btn.extend}' : '${hccenter.btn.buy}';
		}
	}

	// AS3: sources/win63_version/habbo/catalog/clubcenter/ClubCenterView.as::avatarImageReady()
	avatarImageReady(figure: string): void
	{
		if (figure !== this._figure) return;

		this.updateAvatarPreview();
	}

	getSpecialCalloutAnchor(): IWindow | null
	{
		return this._window?.findChildByName('special_content_postit') ?? null;
	}

	setVideoOfferButtonVisibility(visible: boolean, enabled: boolean): void
	{
		const button = this._window?.findChildByName('btn_earn');

		if (!button) return;

		button.visible = visible;

		if (enabled)
		{
			button.enable();
			button.alpha = 0;
		}
		else
		{
			button.disable();
			button.alpha = 51;
		}
	}

	private updateAvatarPreview(): void
	{
		if (!this._avatarWidget) return;

		const avatarImage = this._manager?.avatarRenderManager?.createAvatarImage(this._figure, 'h', '', this, null) ?? null;

		if (!avatarImage) return;

		avatarImage.setDirection('full', 4);

		const snapshot = ClubCenterView.snapshotCroppedImage(avatarImage);

		if (snapshot)
		{
			this._avatarWidget.showPreview(snapshot);
		}

		avatarImage.dispose();
	}

	// TS-only: AvatarImage.getCroppedImage() returns a PixiJS Texture backed
	// directly by an OffscreenCanvas (no GPU render pass involved — see
	// AvatarImage.ts::getCroppedImage()), so it can be drawn straight onto a
	// plain <canvas> without needing a PixiJS Renderer instance. Copying it
	// into an independent canvas (rather than handing out the texture itself)
	// keeps the preview valid after avatarImage.dispose() runs right below.
	private static snapshotCroppedImage(avatarImage: IAvatarImage): HTMLCanvasElement | null
	{
		const texture = avatarImage.getCroppedImage('full') as {
			width: number;
			height: number;
			source?: {resource?: CanvasImageSource};
		} | null;

		const resource = texture?.source?.resource;

		if (!texture || !resource) return null;

		const canvas = document.createElement('canvas');

		canvas.width = texture.width;
		canvas.height = texture.height;

		const ctx = canvas.getContext('2d');

		if (!ctx) return null;

		ctx.drawImage(resource, 0, 0);

		return canvas;
	}

	private onInput = (event: WindowEvent, window: IWindow): void =>
	{
		if (event.type !== WindowMouseEvent.DOWN || !this._manager) return;

		event.stopImmediatePropagation();
		event.stopPropagation();

		switch (window.name)
		{
			case 'header_button_close':
				this._manager.removeView();

				return;
			case 'special_infolink':
				this._manager.openPaydayHelpPage();
				break;
			case 'special_breakdown_link':
				this._manager.showPaydayBreakdownView();
				break;
			case 'general_infolink':
				this._manager.openHelpPage();
				break;
			case 'btn_gift':
				this._manager.openClubGiftPage();
				this._manager.removeView();
				break;
			case 'btn_buy':
				this._manager.openPurchasePage();
				this._manager.removeView();
				break;
			case 'btn_earn':
				(this._manager.offerCenter as {showVideo?: () => void} | null)?.showVideo?.();
				break;
			default:
				return;
		}
	};

	private onRelocate = (): void =>
	{
		this._manager?.removeBreakdown();
	};

	private setElementText(name: string, text: string): void
	{
		const el = this._window?.findChildByName(name) as ITextWindow | null;

		if (el) el.text = text;
	}

	private setElementVisibility(name: string, visible: boolean): void
	{
		const el = this._window?.findChildByName(name);

		if (el) el.visible = visible;
	}

	private removeElement(name: string): void
	{
		const el = this._window?.findChildByName(name);

		if (!el || !el.parent) return;

		(el.parent as IWindowContainer).removeChild(el);
	}

	private getLocalization(key: string): string
	{
		if (!this._manager?.localization) return '';

		return this._manager.localization.getLocalization(key, key);
	}

	private formatMinutes(minutes: number): string
	{
		return FriendlyTime.getShortFriendlyTime(minutes * 60);
	}

	private formatDays(days: number): string
	{
		return FriendlyTime.getShortFriendlyTime(days * 86400);
	}
}
