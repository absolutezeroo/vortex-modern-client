/**
 * RewardTrackPremiumPurchaseConfirmationView — "unlock the premium track?", listing only the perks
 * this particular track actually grants and the price in whichever currencies it costs.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/premium/RewardTrackPremiumPurchaseConfirmationView.as
 *
 * **Every benefit row is in the layout and hidden per track**, so a track with no premium tasks
 * simply drops that line. The same goes for the two prices and the `+` between them: the separator
 * only appears when both currencies are charged.
 *
 * The confirm button locks on click and is only unlocked by `purchaseFailed()`, half a second later
 * — long enough that a held-down click cannot fire twice into the same refusal. A *successful*
 * purchase never unlocks anything: the controller disposes this window instead.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {RewardTrack} from '../../data/RewardTrack';
import type {RewardTrackController} from '../../RewardTrackController';

const log = Logger.getLogger('habbo.quest.rewardtrack.view.premium.RewardTrackPremiumPurchaseConfirmationView');

export class RewardTrackPremiumPurchaseConfirmationView implements IDisposable
{
    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::RETRY_ENABLE_DELAY_MS
    private static readonly RETRY_ENABLE_DELAY_MS: number = 500;

    /** AS3 passes the literal `1` to `buildFromXML`/`getDesktop`. */
    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::RewardTrackPremiumPurchaseConfirmationView()
    private static readonly DESKTOP_WINDOW_LAYER: number = 1;

    /** Derived name — `_SafeStr_4593`. */
    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::_SafeStr_4593
    private _controller: RewardTrackController | null;

    /** Derived name — `_SafeStr_4821`. */
    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::_SafeStr_4821
    private _track: RewardTrack | null;

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::_window
    private _window: IWindowContainer | null = null;

    /** Derived name — `_SafeStr_5093`: AS3's one-shot re-enable `Timer`. */
    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::_SafeStr_5093
    private _retryTimer: ReturnType<typeof setTimeout> | null = null;

    /** Derived name — `_SafeStr_6547`: a purchase is in flight. */
    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::_SafeStr_6547
    private _pending: boolean = false;

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::RewardTrackPremiumPurchaseConfirmationView()
    constructor(controller: RewardTrackController, track: RewardTrack)
    {
        this._controller = controller;
        this._track = track;

        const asset = (controller.assets?.getAssetByName(
            'reward_track_premium_purchase_confirmation_xml'
        ) as XmlAsset | null) ?? null;
        const layout = asset?.content ?? null;
        const windowManager = controller.windowManager;

        if(layout === null || windowManager === null)
        {
            log.warn(
                'Missing layout "reward_track_premium_purchase_confirmation_xml" — the confirmation is not built'
            );

            return;
        }

        this._window = windowManager.buildFromXML(
            layout, RewardTrackPremiumPurchaseConfirmationView.DESKTOP_WINDOW_LAYER
        ) as unknown as IWindowContainer | null;

        if(this._window === null) return;

        this._window.enableLookupCache();

        this.closeButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.cancelButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.confirmButton?.addEventListener('WME_CLICK', this.onConfirmClicked);

        this.initializeUI();
    }

    /** The boost reads as a percentage *above* 1 — a 1.5× multiplier is shown as "+50%". */
    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::initializeUI()
    private initializeUI(): void
    {
        const track = this._track;
        const localization = this._controller?.localizationManager ?? null;

        if(track === null) return;

        this.setText(this.boostBenefitText, localization?.getLocalizationWithParams(
            'reward_track.premium.confirm.benefit.boost',
            '',
            'percent', String(Math.round((track.taskPointsBoost - 1) * 100))
        ) ?? '');

        this.setText(this.instantPointsBenefitText, localization?.getLocalizationWithParams(
            'reward_track.premium.confirm.benefit.instant_points',
            '',
            'points', String(track.instantPoints)
        ) ?? '');

        RewardTrackPremiumPurchaseConfirmationView.setVisible(this.boostBenefitRow, track.taskPointsBoost > 1);
        RewardTrackPremiumPurchaseConfirmationView.setVisible(this.rewardsBenefitRow, track.hasPremiumPrizes);
        RewardTrackPremiumPurchaseConfirmationView.setVisible(this.instantPointsBenefitRow, track.instantPoints > 0);
        RewardTrackPremiumPurchaseConfirmationView.setVisible(this.tasksBenefitRow, track.hasPremiumTasks);
        RewardTrackPremiumPurchaseConfirmationView.setVisible(this.levelsBenefitRow, track.hasPremiumLevels);

        this.setText(this.priceCreditsText, String(track.costCredits));
        this.setText(this.priceDiamondsText, String(track.costDiamonds));

        RewardTrackPremiumPurchaseConfirmationView.setVisible(
            this.priceCreditsText as unknown as IWindow | null, track.costCredits > 0
        );
        RewardTrackPremiumPurchaseConfirmationView.setVisible(this.creditsIcon, track.costCredits > 0);
        RewardTrackPremiumPurchaseConfirmationView.setVisible(
            this.priceDiamondsText as unknown as IWindow | null, track.costDiamonds > 0
        );
        RewardTrackPremiumPurchaseConfirmationView.setVisible(this.diamondsIcon, track.costDiamonds > 0);
        RewardTrackPremiumPurchaseConfirmationView.setVisible(
            this.pricePlusText as unknown as IWindow | null, track.costCredits > 0 && track.costDiamonds > 0
        );
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::show()
    public show(): void
    {
        const window = this._window as unknown as IWindow | null;

        if(window === null) return;

        if(window.parent === null)
        {
            const desktop = this._controller?.windowManager?.getDesktop(
                RewardTrackPremiumPurchaseConfirmationView.DESKTOP_WINDOW_LAYER
            ) ?? null;

            if(desktop !== null) (desktop as unknown as IWindowContainer).addChild(window);
        }

        window.center();
        window.activate();
    }

    /** Restarts the delay if one was already running, exactly as AS3's timer swap does. */
    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::purchaseFailed()
    public purchaseFailed(): void
    {
        if(this._retryTimer !== null) clearTimeout(this._retryTimer);

        this._retryTimer = setTimeout(
            this.onRetryTimerComplete, RewardTrackPremiumPurchaseConfirmationView.RETRY_ENABLE_DELAY_MS
        );
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::setPending()
    public setPending(pending: boolean): void
    {
        this._pending = pending;

        if(pending)
        {
            this.confirmButton?.disable();
            this.cancelButton?.disable();
            this.closeButton?.disable();

            return;
        }

        this.confirmButton?.enable();
        this.cancelButton?.enable();
        this.closeButton?.enable();
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::onConfirmClicked()
    private onConfirmClicked = (): void =>
    {
        this.setPending(true);

        this._controller?.purchasePremium(this._track?.id ?? '');
    };

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::onRetryTimerComplete()
    private onRetryTimerComplete = (): void =>
    {
        this._retryTimer = null;

        this.setPending(false);
    };

    /** A click that lands while a purchase is in flight is swallowed — the window must not close. */
    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::onWindowClose()
    private onWindowClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;
        if(this._pending) return;

        this._controller?.closePremiumPurchaseConfirmation();
    };

    // TS-only: the null-guarded form of AS3's `someTextWindow.text = value`.
    private setText(target: ITextWindow | null, value: string): void
    {
        if(target !== null) target.text = value;
    }

    // TS-only: the null-guarded form of AS3's `someWindow.visible = value`.
    private static setVisible(target: IWindow | null, value: boolean): void
    {
        if(target !== null) target.visible = value;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get benefitsList()
    private get benefitsList(): IItemListWindow | null
    {
        return (this._window?.findChildByName('benefits') ?? null) as unknown as IItemListWindow | null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get boostBenefitRow()
    private get boostBenefitRow(): IWindow | null
    {
        return this.benefitsList?.findChildByName('benefit_boost_row') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get boostBenefitText()
    private get boostBenefitText(): ITextWindow | null
    {
        return (this.benefitsList?.findChildByName('benefit_boost_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get rewardsBenefitRow()
    private get rewardsBenefitRow(): IWindow | null
    {
        return this.benefitsList?.findChildByName('benefit_rewards_row') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get rewardsBenefitText()
    private get rewardsBenefitText(): ITextWindow | null
    {
        return (this.benefitsList?.findChildByName('benefit_rewards_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get instantPointsBenefitRow()
    private get instantPointsBenefitRow(): IWindow | null
    {
        return this.benefitsList?.findChildByName('benefit_instant_points_row') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get instantPointsBenefitText()
    private get instantPointsBenefitText(): ITextWindow | null
    {
        return (this.benefitsList?.findChildByName('benefit_instant_points_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get tasksBenefitRow()
    private get tasksBenefitRow(): IWindow | null
    {
        return this.benefitsList?.findChildByName('benefit_tasks_row') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get tasksBenefitText()
    private get tasksBenefitText(): ITextWindow | null
    {
        return (this.benefitsList?.findChildByName('benefit_tasks_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get levelsBenefitRow()
    private get levelsBenefitRow(): IWindow | null
    {
        return this.benefitsList?.findChildByName('benefit_levels_row') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get levelsBenefitText()
    private get levelsBenefitText(): ITextWindow | null
    {
        return (this.benefitsList?.findChildByName('benefit_levels_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get priceCreditsText()
    private get priceCreditsText(): ITextWindow | null
    {
        return (this._window?.findChildByName('price_credits') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get pricePlusText()
    private get pricePlusText(): ITextWindow | null
    {
        return (this._window?.findChildByName('plus_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get priceDiamondsText()
    private get priceDiamondsText(): ITextWindow | null
    {
        return (this._window?.findChildByName('price_diamonds') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get creditsIcon()
    private get creditsIcon(): IWindow | null
    {
        return this._window?.findChildByName('credits_icon') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get diamondsIcon()
    private get diamondsIcon(): IWindow | null
    {
        return this._window?.findChildByName('diamonds_icon') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get cancelButton()
    private get cancelButton(): IWindow | null
    {
        return this._window?.findChildByName('cancel_button') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::get confirmButton()
    private get confirmButton(): IWindow | null
    {
        return this._window?.findChildByName('confirm_button') ?? null;
    }

    // AS3: RewardTrackPremiumPurchaseConfirmationView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._retryTimer !== null)
        {
            clearTimeout(this._retryTimer);
            this._retryTimer = null;
        }

        this.closeButton?.removeEventListener('WME_CLICK', this.onWindowClose);
        this.cancelButton?.removeEventListener('WME_CLICK', this.onWindowClose);
        this.confirmButton?.removeEventListener('WME_CLICK', this.onConfirmClicked);

        const window = this._window as unknown as IWindow | null;

        if(window !== null)
        {
            (window.parent as unknown as IWindowContainer | null)?.removeChild(window);

            window.dispose();
        }

        this._window = null;
        this._controller = null;
        this._track = null;
    }
}
