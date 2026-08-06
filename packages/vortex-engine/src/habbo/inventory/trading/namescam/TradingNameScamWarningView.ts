import type {IDisposable} from '@core/runtime/IDisposable';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IAssetLibrary} from '@core/assets';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';
import type {TradingNameScamWarningController} from './TradingNameScamWarningController';
import type {TradingNameScamWarningData} from './TradingNameScamWarningData';

const log = Logger.getLogger('habbo.inventory.trading.namescam.TradingNameScamWarningView');

/**
 * The warning shown when the person you are about to trade with has a name that resembles someone
 * else's — theirs beside the lookalikes, with the close buttons locked for the first six seconds
 * so the warning cannot be clicked away without being seen.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/namescam/TradingNameScamWarningView.as
 */
export class TradingNameScamWarningView implements IDisposable
{
    // AS3: .../TradingNameScamWarningView.as::DESKTOP_WINDOW_LAYER
    static readonly DESKTOP_WINDOW_LAYER: number = 1;

    // AS3: .../TradingNameScamWarningView.as::CLOSE_LOCK_SECONDS
    private static readonly CLOSE_LOCK_SECONDS: number = 6;

    // AS3: .../TradingNameScamWarningView.as::SECTION_PADDING
    private static readonly SECTION_PADDING: number = 6;

    // AS3: .../TradingNameScamWarningView.as::_controller
    private _controller: TradingNameScamWarningController | null;

    // AS3: .../TradingNameScamWarningView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: .../TradingNameScamWarningView.as::_localization
    private _localization: IHabboLocalizationManager | null;

    // AS3: .../TradingNameScamWarningView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../TradingNameScamWarningView.as::_closeLockTimer
    // Name DERIVED (`_SafeStr_5547`): AS3's `Timer(1000, CLOSE_LOCK_SECONDS)`.
    private _closeLockTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../TradingNameScamWarningView.as::_closeLockSecondsLeft
    // Name DERIVED (`_SafeStr_5571`).
    private _closeLockSecondsLeft: number = 0;

    // AS3: .../src/com/sulake/habbo/inventory/trading/namescam/TradingNameScamWarningView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../TradingNameScamWarningView.as::TradingNameScamWarningView()
    // AS3 builds the window on layer 1 (the desktop layer above the room) and caches its child
    // lookups, because every accessor below re-resolves by name.
    constructor(
        controller: TradingNameScamWarningController,
        windowManager: IHabboWindowManager | null,
        assets: IAssetLibrary | null,
        localization: IHabboLocalizationManager | null
    )
    {
        void assets;

        this._controller = controller;
        this._windowManager = windowManager;
        this._localization = localization;
        this._window = windowManager?.buildWidgetLayout(
            'inventory_trading_name_scam_warning_xml',
            TradingNameScamWarningView.DESKTOP_WINDOW_LAYER
        ) as IWindowContainer | null;

        if(this._window === null || this._window === undefined)
        {
            log.warn('inventory_trading_name_scam_warning_xml did not build — no warning can be shown');

            return;
        }

        this._window.enableLookupCache();

        this.headerCloseButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.dismissButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.openProfileButton?.addEventListener('WME_CLICK', this.onOpenProfileClicked);
    }

    // AS3: .../TradingNameScamWarningView.as::show()
    show(data: TradingNameScamWarningData | null): void
    {
        if(this._disposed || data === null || this._window === null) return;

        this._window.caption = this._localization?.getLocalization('inventory.trading.namescam.title') ?? '';

        const warningText = this.warningText;

        if(warningText !== null)
        {
            warningText.text = this._localization?.getLocalizationWithParams(
                'inventory.trading.namescam.warning', '', 'trader_name', data.tradedUserName
            ) ?? '';
            warningText.height = warningText.textHeight + TradingNameScamWarningView.SECTION_PADDING;
        }

        const traderLabel = this.traderLabel;

        if(traderLabel !== null)
        {
            traderLabel.text = this._localization?.getLocalization('inventory.trading.namescam.trader') ?? '';
        }

        const traderNameText = this.traderNameText;

        if(traderNameText !== null) traderNameText.text = data.tradedUserName;

        const openProfileButton = this.openProfileButton;

        if(openProfileButton !== null) openProfileButton.id = data.tradedUserId;

        const avatar = this.traderAvatar?.widget as IAvatarImageWidget | null;

        if(avatar !== null && avatar !== undefined)
        {
            avatar.figure = data.tradedUserFigure;
            avatar.userId = data.tradedUserId;
        }

        this.updateMatchesSection(
            this.roomMatchesSection, this.roomMatchesHeader, this.roomMatchesText,
            'inventory.trading.namescam.similar_in_room', data.similarInRoom
        );
        this.updateMatchesSection(
            this.friendMatchesSection, this.friendMatchesHeader, this.friendMatchesText,
            'inventory.trading.namescam.similar_in_friends', data.similarInFriends
        );

        this.startCloseLockCountdown();

        if(this._window.parent === null)
        {
            const desktop = this._windowManager?.getDesktop(TradingNameScamWarningView.DESKTOP_WINDOW_LAYER);

            (desktop as IWindowContainer | null)?.addChild(this._window);
        }

        this._window.center();
        this._window.activate();
    }

    // AS3: .../TradingNameScamWarningView.as::hide()
    hide(): void
    {
        this.stopCloseLockCountdown();

        if(this._windowManager !== null && this._window !== null && this._window.parent !== null)
        {
            const desktop = this._windowManager.getDesktop(TradingNameScamWarningView.DESKTOP_WINDOW_LAYER);

            (desktop as IWindowContainer | null)?.removeChild(this._window);
        }
    }

    // AS3: .../TradingNameScamWarningView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../TradingNameScamWarningView.as::startCloseLockCountdown()
    private startCloseLockCountdown(): void
    {
        this._closeLockSecondsLeft = TradingNameScamWarningView.CLOSE_LOCK_SECONDS;

        if(this._closeLockTimer !== null) clearInterval(this._closeLockTimer);

        this._closeLockTimer = setInterval(() => this.onCloseLockTimer(), 1000);
        this.updateCloseLockUI();
    }

    // AS3: .../TradingNameScamWarningView.as::stopCloseLockCountdown()
    private stopCloseLockCountdown(): void
    {
        if(this._closeLockTimer !== null)
        {
            clearInterval(this._closeLockTimer);
            this._closeLockTimer = null;
        }

        this._closeLockSecondsLeft = 0;
        this.updateCloseLockUI();
    }

    // AS3: .../TradingNameScamWarningView.as::onCloseLockTimer()
    private onCloseLockTimer(): void
    {
        this._closeLockSecondsLeft -= 1;

        if(this._closeLockSecondsLeft <= 0)
        {
            this.stopCloseLockCountdown();

            return;
        }

        this.updateCloseLockUI();
    }

    // AS3: .../TradingNameScamWarningView.as::updateCloseLockUI()
    // Both ways out are disabled while the lock runs, and the remaining seconds are shown.
    private updateCloseLockUI(): void
    {
        const locked = this._closeLockSecondsLeft > 0;
        const countdownText = this.closeCountdownText;

        if(locked)
        {
            this.dismissButton?.disable();
            this.headerCloseButton?.disable();

            if(countdownText !== null)
            {
                countdownText.visible = true;
                countdownText.text = this._localization?.getLocalizationWithParams(
                    'inventory.trading.namescam.close_countdown', '', 'seconds', String(this._closeLockSecondsLeft)
                ) ?? '';
            }

            return;
        }

        this.dismissButton?.enable();
        this.headerCloseButton?.enable();

        if(countdownText !== null)
        {
            countdownText.text = '';
            countdownText.visible = false;
        }
    }

    // AS3: .../TradingNameScamWarningView.as::updateMatchesSection()
    // An empty list collapses its section to zero height rather than leaving a gap.
    private updateMatchesSection(
        section: IWindowContainer | null,
        header: ITextWindow | null,
        text: ITextWindow | null,
        headerKey: string,
        names: string[]
    ): void
    {
        const hasMatches = names !== null && names.length > 0;

        if(section !== null) section.visible = hasMatches;

        if(!hasMatches)
        {
            if(section !== null) section.height = 0;
            if(text !== null) text.text = '';

            return;
        }

        if(header !== null) header.text = this._localization?.getLocalization(headerKey) ?? '';

        if(text !== null)
        {
            text.text = names.join('\r');
            text.height = text.textHeight + TradingNameScamWarningView.SECTION_PADDING;

            if(section !== null)
            {
                section.height = text.y + text.height + TradingNameScamWarningView.SECTION_PADDING;
            }
        }
    }

    // AS3: .../TradingNameScamWarningView.as::onOpenProfileClicked()
    private onOpenProfileClicked = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this._controller?.openProfile(this.openProfileButton?.id ?? 0);
    };

    // AS3: .../TradingNameScamWarningView.as::onWindowClose()
    // The click is ignored outright while the lock runs — the buttons are disabled too, so this is
    // AS3 belt-and-braces.
    private onWindowClose = (event: WindowEvent): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        if(this._closeLockSecondsLeft > 0) return;

        this.hide();
    };

    // AS3: .../TradingNameScamWarningView.as::get headerCloseButton()
    private get headerCloseButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get contentList()
    // Read by nothing in AS3 either — kept so the member list matches.
    private get contentList(): IWindow | null
    {
        return this._window?.findChildByName('content_list') ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get warningText()
    private get warningText(): ITextWindow | null
    {
        return (this._window?.findChildByName('warning_text') as ITextWindow) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get traderLabel()
    private get traderLabel(): ITextWindow | null
    {
        return (this._window?.findChildByName('trader_label') as ITextWindow) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get traderNameText()
    private get traderNameText(): ITextWindow | null
    {
        return (this._window?.findChildByName('trader_name_text') as ITextWindow) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get traderAvatar()
    private get traderAvatar(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('trader_avatar') as unknown as IWidgetWindow) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get openProfileButton()
    private get openProfileButton(): IWindow | null
    {
        return this._window?.findChildByName('open_profile_button') ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get roomMatchesSection()
    private get roomMatchesSection(): IWindowContainer | null
    {
        return (this._window?.findChildByName('room_matches_section') as IWindowContainer) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get roomMatchesHeader()
    private get roomMatchesHeader(): ITextWindow | null
    {
        return (this._window?.findChildByName('room_matches_header') as ITextWindow) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get roomMatchesText()
    private get roomMatchesText(): ITextWindow | null
    {
        return (this._window?.findChildByName('room_matches_text') as ITextWindow) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get friendMatchesSection()
    private get friendMatchesSection(): IWindowContainer | null
    {
        return (this._window?.findChildByName('friend_matches_section') as IWindowContainer) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get friendMatchesHeader()
    private get friendMatchesHeader(): ITextWindow | null
    {
        return (this._window?.findChildByName('friend_matches_header') as ITextWindow) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get friendMatchesText()
    private get friendMatchesText(): ITextWindow | null
    {
        return (this._window?.findChildByName('friend_matches_text') as ITextWindow) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get dismissButton()
    private get dismissButton(): IWindow | null
    {
        return this._window?.findChildByName('close_button') ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::get closeCountdownText()
    private get closeCountdownText(): ITextWindow | null
    {
        return (this._window?.findChildByName('close_countdown_text') as ITextWindow) ?? null;
    }

    // AS3: .../TradingNameScamWarningView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.headerCloseButton?.removeEventListener('WME_CLICK', this.onWindowClose);
        this.dismissButton?.removeEventListener('WME_CLICK', this.onWindowClose);
        this.openProfileButton?.removeEventListener('WME_CLICK', this.onOpenProfileClicked);

        this.hide();

        this._closeLockTimer = null;
        this._window?.dispose();
        this._window = null;
        this._windowManager = null;
        this._localization = null;
        this._controller = null;
        this._disposed = true;
    }
}
