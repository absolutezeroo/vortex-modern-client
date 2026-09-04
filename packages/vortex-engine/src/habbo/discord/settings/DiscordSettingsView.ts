import type {IDisposable} from '@core/runtime';
import type {XmlAsset} from '@core/assets/XmlAsset';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ISelectableWindow} from '@core/window/components/ISelectableWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import {WindowUtils} from '@core/window/utils/WindowUtils';
import {Logger} from '@core/utils/Logger';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {HabboWebTools} from '@habbo/utils/HabboWebTools';
import type {
    DiscordPreferences
} from '@habbo/communication/messages/parser/discord/DiscordPreferences';

import type {DiscordSettingsController} from './DiscordSettingsController';

const log = Logger.getLogger('habbo.discord.settings.DiscordSettingsView');

/**
 * The four Discord toggles, plus three buttons that open Habbo's own Discord servers.
 *
 * **Closing the window is what saves it.** There is no confirm button: both the header cross and
 * the wide button at the bottom run `onWindowClose`, which reads the four checkboxes straight into
 * `updatePreferences()`. Nothing else writes preferences, so a player who dismisses the popup has
 * still answered it — which is exactly how the five-second nag stops coming back.
 *
 * The greying is cosmetic and cascading: the whole box loses colour when "show Habbo" is off, and
 * the two sub-toggles are disabled when either it or "share activity" is off.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/discord/settings/DiscordSettingsView.as
 */
export class DiscordSettingsView implements IDisposable
{
    // AS3: .../settings/DiscordSettingsView.as::DESKTOP_WINDOW_LAYER
    public static readonly DESKTOP_WINDOW_LAYER: number = 1;

    // AS3: .../settings/DiscordSettingsView.as::_SafeStr_4593 (name derived: the owning controller)
    private _controller: DiscordSettingsController | null;

    // AS3: .../settings/DiscordSettingsView.as::_windowManager
    private _windowManager: IHabboWindowManager | null;

    // AS3: .../settings/DiscordSettingsView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../settings/DiscordSettingsView.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../settings/DiscordSettingsView.as::DiscordSettingsView()
    constructor(controller: DiscordSettingsController, windowManager: IHabboWindowManager | null)
    {
        this._controller = controller;
        this._windowManager = windowManager;

        const asset = (controller.assets?.getAssetByName('discord_settings_xml') as XmlAsset | null) ?? null;
        const layout = asset?.content ?? null;

        if(layout === null || windowManager === null)
        {
            log.warn('Missing layout "discord_settings_xml" — the Discord settings window is not built');

            return;
        }

        this._window = windowManager.buildFromXML(
            layout, DiscordSettingsView.DESKTOP_WINDOW_LAYER
        ) as unknown as IWindowContainer | null;

        if(this._window === null) return;

        this._window.enableLookupCache();

        this.closeButton?.addEventListener('WME_CLICK', this.onWindowClose);
        this.funnyButton?.addEventListener('WME_CLICK', this.onWindowClose);

        const checkboxes = [
            this.discordStatusCheckbox,
            this.shareActivityCheckbox,
            this.hideHiddenRoomsCheckbox,
            this.allowJoiningCheckbox
        ];

        for(const checkbox of checkboxes)
        {
            checkbox?.addEventListener('WE_SELECTED', this.onCheckboxChanged);
            checkbox?.addEventListener('WE_UNSELECTED', this.onCheckboxChanged);
        }

        this.collectiblesServerButton?.addEventListener('WME_CLICK', this.onClickCollectiblesDiscord);
        this.wiredServerButton?.addEventListener('WME_CLICK', this.onClickWiredDiscord);
        this.originsServerButton?.addEventListener('WME_CLICK', this.onClickOriginsDiscord);

        this.show();
        this.hide();
    }

    // AS3: .../settings/DiscordSettingsView.as::onCheckboxChanged()
    private onCheckboxChanged = (): void =>
    {
        this.updateUI();
    };

    // AS3: .../settings/DiscordSettingsView.as::updateUI()
    private updateUI(): void
    {
        const box = this.discordBox;
        const status = this.discordStatusCheckbox;
        const share = this.shareActivityCheckbox;

        const enabled = status?.isSelected ?? false;
        const sharing = share?.isSelected ?? false;

        if(box !== null)
        {
            box.greyscale = !enabled;
            box.invalidate();
        }

        const shareParent = this.shareActivityCheckbox?.parent ?? null;
        const hideParent = this.hideHiddenRoomsCheckbox?.parent ?? null;
        const joinParent = this.allowJoiningCheckbox?.parent ?? null;

        if(shareParent !== null) WindowUtils.disableSection(shareParent, !enabled);
        if(hideParent !== null) WindowUtils.disableSection(hideParent, !enabled || !sharing);
        if(joinParent !== null) WindowUtils.disableSection(joinParent, !enabled || !sharing);
    }

    // AS3: .../settings/DiscordSettingsView.as::onWindowClose()
    private onWindowClose = (): void =>
    {
        this._controller?.updatePreferences(
            this.discordStatusCheckbox?.isSelected ?? false,
            this.shareActivityCheckbox?.isSelected ?? false,
            this.hideHiddenRoomsCheckbox?.isSelected ?? false,
            this.allowJoiningCheckbox?.isSelected ?? false
        );

        this.hide();
    };

    // AS3: .../settings/DiscordSettingsView.as::initialize()
    initialize(preferences: DiscordPreferences): void
    {
        const status = this.discordStatusCheckbox;
        const share = this.shareActivityCheckbox;
        const hide = this.hideHiddenRoomsCheckbox;
        const join = this.allowJoiningCheckbox;

        if(status !== null) status.isSelected = preferences.showHabbo;
        if(share !== null) share.isSelected = preferences.shareActivity;
        if(hide !== null) hide.isSelected = preferences.hideInHiddenRooms;
        if(join !== null) join.isSelected = preferences.allowJoining;

        this.updateUI();
    }

    // AS3: .../settings/DiscordSettingsView.as::show()
    show(): void
    {
        if(this._windowManager === null || this._window === null) return;

        const window = this._window as unknown as IWindow;

        if(window.parent !== null) return;

        const desktop = this._windowManager.getDesktop(DiscordSettingsView.DESKTOP_WINDOW_LAYER);

        if(desktop === null) return;

        (desktop as unknown as IWindowContainer).addChild(window);
        window.center();
        window.activate();
    }

    // AS3: .../settings/DiscordSettingsView.as::hide()
    hide(): void
    {
        if(!this.isShowing()) return;

        const desktop = this._windowManager?.getDesktop(DiscordSettingsView.DESKTOP_WINDOW_LAYER) ?? null;

        if(desktop === null) return;

        (desktop as unknown as IWindowContainer).removeChild(this._window as unknown as IWindow);
    }

    // AS3: .../settings/DiscordSettingsView.as::isShowing()
    isShowing(): boolean
    {
        return this._windowManager !== null
            && this._window !== null
            && (this._window as unknown as IWindow).parent !== null;
    }

    // AS3: .../settings/DiscordSettingsView.as::onClickCollectiblesDiscord()
    private onClickCollectiblesDiscord = (): void =>
    {
        HabboWebTools.openWebPageAndMinimizeClient(this._controller?.getProperty('collectibles.discord.link') ?? '');
    };

    // AS3: .../settings/DiscordSettingsView.as::onClickWiredDiscord()
    private onClickWiredDiscord = (): void =>
    {
        HabboWebTools.openWebPageAndMinimizeClient(this._controller?.getProperty('wired.discord.link') ?? '');
    };

    // AS3: .../settings/DiscordSettingsView.as::onClickOriginsDiscord()
    private onClickOriginsDiscord = (): void =>
    {
        HabboWebTools.openWebPageAndMinimizeClient(this._controller?.getProperty('origins.discord.link') ?? '');
    };

    // AS3: .../settings/DiscordSettingsView.as::get discordBox()
    private get discordBox(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('discord_box') as IStaticBitmapWrapperWindow | null) ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get closeButton()
    private get closeButton(): IWindow | null
    {
        return this._window?.findChildByName('header_button_close') ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get discordStatusCheckbox()
    private get discordStatusCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('show_habbo_cbx') as ISelectableWindow | null) ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get shareActivityCheckbox()
    private get shareActivityCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('share_activity_cbx') as ISelectableWindow | null) ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get hideHiddenRoomsCheckbox()
    private get hideHiddenRoomsCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('hide_in_hidden_cbx') as ISelectableWindow | null) ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get allowJoiningCheckbox()
    private get allowJoiningCheckbox(): ISelectableWindow | null
    {
        return (this._window?.findChildByName('allow_joining_cbx') as ISelectableWindow | null) ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get collectiblesServerButton()
    private get collectiblesServerButton(): IWindow | null
    {
        return this._window?.findChildByName('collectibles_server') ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get wiredServerButton()
    private get wiredServerButton(): IWindow | null
    {
        return this._window?.findChildByName('wired_server') ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get originsServerButton()
    private get originsServerButton(): IWindow | null
    {
        return this._window?.findChildByName('origins_server') ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get funnyButton()
    private get funnyButton(): IWindow | null
    {
        return this._window?.findChildByName('funny_button') ?? null;
    }

    // AS3: .../settings/DiscordSettingsView.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../settings/DiscordSettingsView.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._window !== null)
        {
            (this._window as unknown as IWindow).dispose();
            this._window = null;
        }

        this._windowManager = null;
        this._controller = null;
    }
}
