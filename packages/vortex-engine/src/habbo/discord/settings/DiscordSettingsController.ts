import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import {Logger} from '@core/utils/Logger';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {
    DiscordPreferencesMessageEvent
} from '@habbo/communication/messages/incoming/discord/DiscordPreferencesMessageEvent';
import {
    GetDiscordPreferencesMessageComposer
} from '@habbo/communication/messages/outgoing/discord/GetDiscordPreferencesMessageComposer';
import {
    UpdateDiscordPreferencesMessageComposer
} from '@habbo/communication/messages/outgoing/discord/UpdateDiscordPreferencesMessageComposer';
import {DiscordPreferences} from '@habbo/communication/messages/parser/discord/DiscordPreferences';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboConfigurationManager} from '@iid/IIDHabboConfigurationManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';

import type {HabboDiscordManager} from '../HabboDiscordManager';
import {DiscordSettingsView} from './DiscordSettingsView';
import type {IDiscordSettingsController} from './IDiscordSettingsController';

const log = Logger.getLogger('habbo.discord.settings.DiscordSettingsController');

/**
 * Owns the Discord preferences: asks for them at boot, hands them to the manager, and opens the
 * settings window — either from the `discord/settings/open` link or, once, on its own.
 *
 * **The unprompted popup has three conditions and fires five seconds late.** It needs Discord to
 * have connected (so it is never shown to a player who has no Discord running), preferences to
 * have arrived, and the stored `version` to be behind the hotel's
 * `discord_activity.settings.version` — that last one is how a hotel re-asks everybody after
 * changing what the toggles mean. `_checkedForPopup` makes the decision once per session, and the
 * timeout re-checks `_viewOpened` before showing, so a player who opened the window through the
 * link in the meantime is left alone.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/discord/settings/DiscordSettingsController.as
 */
export class DiscordSettingsController extends Component implements ILinkEventTracker, IDiscordSettingsController
{
    // AS3: .../settings/DiscordSettingsController.as::_SafeStr_10799 (name derived from its value)
    private static readonly POPUP_DELAY_MS: number = 5000;

    // AS3: .../settings/DiscordSettingsController.as::PREFERENCES_UNINITIALIZED
    private static readonly PREFERENCES_UNINITIALIZED: DiscordPreferences =
        new DiscordPreferences(0, false, false, false, false);

    // AS3: .../settings/DiscordSettingsController.as::PREFERENCES_DEFAULT
    private static readonly PREFERENCES_DEFAULT: DiscordPreferences =
        new DiscordPreferences(0, true, true, true, true);

    // AS3: .../settings/DiscordSettingsController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    // AS3: .../settings/DiscordSettingsController.as::_localization
    private _localization: IHabboLocalizationManager | null = null;

    // AS3: .../settings/DiscordSettingsController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: .../settings/DiscordSettingsController.as::_SafeStr_4571 (name derived: the owning manager)
    private _manager: HabboDiscordManager | null;

    // AS3: .../settings/DiscordSettingsController.as::_SafeStr_4550 (name derived: the settings view)
    private _view: DiscordSettingsView | null = null;

    // AS3: .../settings/DiscordSettingsController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: .../settings/DiscordSettingsController.as::_preferences
    private _preferences: DiscordPreferences | null = null;

    /**
	 * AS3: .../settings/DiscordSettingsController.as::_SafeStr_5324
	 *
	 * Name derived. Same object as `_preferences` except when the server answers with `version 0`
	 * — "never configured" — in which case this one holds the all-on default the dialog shows, and
	 * `_preferences` keeps the zeroes so `get preferences()` still reports what is stored.
	 */
    // AS3: .../settings/DiscordSettingsController.as::_SafeStr_5324
    private _displayedPreferences: DiscordPreferences | null = null;

    // AS3: .../settings/DiscordSettingsController.as::_SafeStr_7683 (name derived: Discord connected)
    private _discordConnected: boolean = false;

    // AS3: .../settings/DiscordSettingsController.as::_checkedForPopup
    private _checkedForPopup: boolean = false;

    // AS3: .../settings/DiscordSettingsController.as::_SafeStr_8568 (name derived: the view was opened)
    private _viewOpened: boolean = false;

    // AS3: .../settings/DiscordSettingsController.as::_SafeStr_5769 (name derived: the dispose latch)
    private _controllerDisposed: boolean = false;

    // AS3: .../settings/DiscordSettingsController.as::DiscordSettingsController()
    constructor(manager: HabboDiscordManager, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);

        this._manager = manager;

        this._messageEvents.push(new DiscordPreferencesMessageEvent(this.onDiscordPreferences));

        for(const event of this._messageEvents)
        {
            this.addMessageEvent(event);
        }
    }

    // AS3: .../settings/DiscordSettingsController.as::onDiscordPreferences()
    private onDiscordPreferences = (event: IMessageEvent): void =>
    {
        this._preferences = (event as DiscordPreferencesMessageEvent).preferences;
        this._displayedPreferences = this._preferences;

        if(this._displayedPreferences?.version === 0)
        {
            this._displayedPreferences = DiscordSettingsController.PREFERENCES_DEFAULT;
        }

        this.maybeShowPopup();
        this._manager?.tryUpdatePresence(true, true);
    };

    // AS3: .../settings/DiscordSettingsController.as::maybeShowPopup()
    private maybeShowPopup(): void
    {
        if(this._checkedForPopup || this._displayedPreferences === null || !this._discordConnected) return;

        this._checkedForPopup = true;

        if(this._displayedPreferences.version >= this.preferenceGlobalVersion || this._viewOpened) return;

        setTimeout(() =>
        {
            if(!this._viewOpened) this.showView();
        }, DiscordSettingsController.POPUP_DELAY_MS);
    }

    // AS3: .../settings/DiscordSettingsController.as::get dependencies()
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) => { this._windowManager = manager; }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => { this._localization = manager; }
            ),
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => { this._communicationManager = manager; }
            ),
            new ComponentDependency(IID_HabboConfigurationManager, null, true),
        ];
    }

    // AS3: .../settings/DiscordSettingsController.as::onDiscordConnected()
    onDiscordConnected(): void
    {
        this._discordConnected = true;
        this.maybeShowPopup();
    }

    // AS3: .../settings/DiscordSettingsController.as::initComponent()
    protected override initComponent(): void
    {
        this.context.addLinkEventTracker(this);
        this._communicationManager?.connection?.send(new GetDiscordPreferencesMessageComposer());
    }

    // AS3: .../settings/DiscordSettingsController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'discord/settings/';
    }

    // AS3: .../settings/DiscordSettingsController.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 3) return;

        if(parts[2] === 'open') this.showView();
    }

    // AS3: .../settings/DiscordSettingsController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        this._communicationManager?.addHabboConnectionMessageEvent(event);
    }

    // AS3: .../settings/DiscordSettingsController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        this._communicationManager?.removeHabboConnectionMessageEvent(event);
    }

    // AS3: .../settings/DiscordSettingsController.as::showView()
    showView(): void
    {
        if(this._displayedPreferences === null)
        {
            log.debug('Attempted to open DiscordSettingsView but didn\'t have preferences available');

            return;
        }

        if(this._view === null) this._view = new DiscordSettingsView(this, this._windowManager);

        this._view.initialize(this._displayedPreferences);
        this._view.show();
        this._viewOpened = true;
    }

    // AS3: .../settings/DiscordSettingsController.as::hideView()
    hideView(): void
    {
        if(this._view !== null && this._view.isShowing()) this._view.hide();
    }

    // AS3: .../settings/DiscordSettingsController.as::get preferenceGlobalVersion()
    get preferenceGlobalVersion(): number
    {
        return this.getInteger('discord_activity.settings.version', 1);
    }

    // AS3: .../settings/DiscordSettingsController.as::updatePreferences()
    updatePreferences(
        showHabbo: boolean,
        shareActivity: boolean,
        hideInHiddenRooms: boolean,
        allowJoining: boolean
    ): void
    {
        const version = this.preferenceGlobalVersion;

        this._preferences = new DiscordPreferences(version, showHabbo, shareActivity, hideInHiddenRooms, allowJoining);
        this._displayedPreferences = this._preferences;

        this._communicationManager?.connection?.send(
            new UpdateDiscordPreferencesMessageComposer(
                version, showHabbo, shareActivity, hideInHiddenRooms, allowJoining
            )
        );

        this._manager?.tryUpdatePresence(true, true);
    }

    // AS3: .../settings/DiscordSettingsController.as::get preferences()
    get preferences(): DiscordPreferences
    {
        return this._preferences ?? DiscordSettingsController.PREFERENCES_UNINITIALIZED;
    }

    // AS3: .../settings/DiscordSettingsController.as::get localization()
    get localization(): IHabboLocalizationManager | null
    {
        return this._localization;
    }

    // AS3: .../settings/DiscordSettingsController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: .../settings/DiscordSettingsController.as::dispose()
    override dispose(): void
    {
        if(this._controllerDisposed) return;

        this._controllerDisposed = true;

        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        for(const event of this._messageEvents)
        {
            this.removeMessageEvent(event);
        }

        this._messageEvents = [];
        this._windowManager = null;
        this._localization = null;
        this._manager = null;
        this._displayedPreferences = null;
        this._preferences = null;
        this._discordConnected = false;
        this._checkedForPopup = false;

        this.context.removeLinkEventTracker(this);

        super.dispose();
    }
}
