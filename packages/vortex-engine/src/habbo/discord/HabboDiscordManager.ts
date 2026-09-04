import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import {Logger} from '@core/utils/Logger';
import {DiscordRichPresence, type IDiscordStatusEvent} from '../../discord/DiscordRichPresence';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {DeBouncer} from '@habbo/utils/DeBouncer';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';

import {DiscordSettingsController} from './settings/DiscordSettingsController';
import {HabboActivityDetection} from './habbo_activity/HabboActivityDetection';
import type {IHabboDiscordManager} from './IHabboDiscordManager';

const log = Logger.getLogger('habbo.discord.HabboDiscordManager');

/**
 * Publishes what the player is doing to Discord Rich Presence, once every ten seconds and on every
 * change worth reporting.
 *
 * **Two layers of coalescing sit between an event and the IPC call.** The `DeBouncer` collapses a
 * burst of `tryUpdatePresence()` calls into one, and `updatePresence()` then compares the three
 * fields it is about to send against the last ones sent and returns if nothing moved — so the
 * ten-second timer costs nothing while the player stands still.
 *
 * **`start` is a session clock, not a room clock.** It is reset only when a caller passes
 * `resetStartTime` (entering a room, connecting, changing preferences), which is what makes
 * Discord's "elapsed" read as time-in-this-activity rather than time-since-login.
 *
 * The hotel is named from `environment.id` against a fixed allow-list — anything else sends an
 * empty hotel name rather than leaking an internal environment id — and the "Visit room" button
 * only appears for a player who allowed joining, is in a room, and is not on `local`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/discord/HabboDiscordManager.as
 */
export class HabboDiscordManager extends Component implements IHabboDiscordManager
{
    // AS3: .../discord/HabboDiscordManager.as::REFRESH_TIMEOUT_MS
    private static readonly REFRESH_TIMEOUT_MS: number = 10000;

    // AS3: .../discord/HabboDiscordManager.as::ALLOWED_ENVIRONMENTS
    private static readonly ALLOWED_ENVIRONMENTS: string[] =
        ['en', 'pt', 'fi', 'fr', 'de', 'nl', 'es', 'it', 'tr', 's2', 'local'];

    /**
	 * AS3: .../discord/HabboDiscordManager.as::initialize()
	 *
	 * The Discord application id the presence is published under. AS3 passes it as a literal to
	 * `rpc.initialize()`; it is named here rather than repeated inline.
	 */
    // AS3: .../discord/HabboDiscordManager.as::initialize()
    private static readonly DISCORD_CLIENT_ID: string = '1440237225051947050';

    // AS3: .../discord/HabboDiscordManager.as::_localization
    private _localization: IHabboLocalizationManager | null = null;

    // AS3: .../discord/HabboDiscordManager.as::_SafeStr_5227 (name derived: the settings controller)
    private _settings: DiscordSettingsController | null;

    // AS3: .../discord/HabboDiscordManager.as::_SafeStr_5215 (name derived: the activity detector)
    private _activity: HabboActivityDetection | null;

    // AS3: .../discord/HabboDiscordManager.as::rpc
    private readonly _rpc: DiscordRichPresence | null =
        DiscordRichPresence.isSupported ? DiscordRichPresence.instance : null;

    // AS3: .../discord/HabboDiscordManager.as::_SafeStr_6850 (name derived: Discord is connected)
    private _connected: boolean = false;

    // AS3: .../discord/HabboDiscordManager.as::_SafeStr_6158 (name derived: the update debouncer)
    private _debouncer: DeBouncer | null;

    // AS3: .../discord/HabboDiscordManager.as::_SafeStr_5693 (name derived: the refresh timer)
    private _refreshTimer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../discord/HabboDiscordManager.as::_SafeStr_8092 (name derived: a presence is published)
    private _presencePublished: boolean = false;

    // AS3: .../discord/HabboDiscordManager.as::_lastDetails
    private _lastDetails: string | null = null;

    // AS3: .../discord/HabboDiscordManager.as::_SafeStr_8128 (name derived: the last state line sent)
    private _lastState: string | null = null;

    // AS3: .../discord/HabboDiscordManager.as::_lastStartTime
    private _lastStartTime: number = -1;

    // AS3: .../discord/HabboDiscordManager.as::_startTime
    private _startTime: number;

    // AS3: .../discord/HabboDiscordManager.as::HabboDiscordManager()
    constructor(context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);

        this._debouncer = new DeBouncer(1500, 3000, () => this.updatePresence());
        this._settings = new DiscordSettingsController(this, context, 0, assets);
        this._activity = new HabboActivityDetection(this, context, 0, assets);
        this._startTime = Math.floor(Date.now() / 1000);

        this.initialize();

        this._refreshTimer = setInterval(() => this.onPresenceTimer(), HabboDiscordManager.REFRESH_TIMEOUT_MS);
    }

    // AS3: .../discord/HabboDiscordManager.as::get dependencies()
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) => { this._localization = manager; }
            ),
        ];
    }

    // AS3: .../discord/HabboDiscordManager.as::initialize()
    initialize(): void
    {
        if(this._rpc === null) return;

        try
        {
            // AS3 registers empty join/join-request listeners here — the client never acts on an
            // invite, it only has to keep the extension from queueing them. Kept for the same
            // reason: removing them would change which callbacks the native side sees registered.
            this._rpc.addJoinListener(() => { /* AS3 body is empty */ });
            this._rpc.addJoinRequestListener(() => { /* AS3 body is empty */ });

            this._rpc.addStatusListener((event: IDiscordStatusEvent): void =>
            {
                if(this.disposed) return;

                if(event.code === DiscordRichPresence.EVENT_CONNECTED)
                {
                    this._settings?.onDiscordConnected();
                    this._connected = true;
                    this.tryUpdatePresence(true, true);
                }
                else if(event.code === DiscordRichPresence.EVENT_SHUTDOWN)
                {
                    this._connected = false;
                    this.tryUpdatePresence(true);
                }
            });

            this._rpc.initialize(HabboDiscordManager.DISCORD_CLIENT_ID);
        }
        catch (error)
        {
            log.warn(`Failed to initialize discord rich presence: ${String(error)}`);
        }
    }

    // AS3: .../discord/HabboDiscordManager.as::tryUpdatePresence()
    tryUpdatePresence(force: boolean = false, resetStartTime: boolean = false): void
    {
        if(this.disposed || this._debouncer === null) return;

        if(resetStartTime) this._startTime = Math.floor(Date.now() / 1000);

        this._debouncer.trigger(force);
    }

    // AS3: .../discord/HabboDiscordManager.as::get featureEnabled()
    private get featureEnabled(): boolean
    {
        return this.getBoolean('discord.enabled');
    }

    // AS3: .../discord/HabboDiscordManager.as::updatePresence()
    updatePresence(): void
    {
        if(
            this._rpc === null
            || !this._connected
            || this._settings === null
            || this._activity === null
            || this._localization === null
            || !this.featureEnabled
        )
        {
            return;
        }

        const preferences = this._settings.preferences;

        if(preferences === null || !preferences.showHabbo)
        {
            if(this._presencePublished)
            {
                try
                {
                    this._rpc.clearPresence();
                }
                catch
                {
                    // AS3 swallows this too — a dead IPC pipe must not take the client with it.
                }
            }

            this._presencePublished = false;
            this._lastDetails = null;
            this._lastState = null;
            this._lastStartTime = -1;

            return;
        }

        const hotel = this.getEnvironmentName();
        const details = this._localization.getLocalizationWithParams(
            'discord.rpc.details', '', 'hotel_id', hotel
        );

        let state: string | null = null;

        if(preferences.shareActivity)
        {
            const inRoom = this._activity.isInRoom();
            const hidden = this._activity.isInHiddenRoom();

            if(!inRoom)
            {
                state = this._localization.getLocalization('discord.rpc.state.hotelview');
            }
            else if(hidden && preferences.hideInHiddenRooms)
            {
                state = this._localization.getLocalization('discord.rpc.state.hidden');
            }
            else
            {
                const activity = this._activity.getCurrentRoomActivity();
                const roomName = this._activity.getCurrentRoomName();
                const noun = activity === null
                    ? ''
                    : this._localization.getLocalization(`discord.rpc.state.room.${activity.name}`);

                if(roomName === null || roomName.length === 0 || noun === null || noun.length === 0)
                {
                    state = null;
                }
                else
                {
                    state = this._localization.getLocalizationWithParams(
                        'discord.rpc.state.room', '', 'noun', noun, 'room_name', roomName
                    );
                }
            }
        }

        if(details === this._lastDetails && state === this._lastState && this._startTime === this._lastStartTime)
        {
            return;
        }

        try
        {
            if(state !== null && state.length > 0)
            {
                const link = this.getLink();

                if(link !== null)
                {
                    this._rpc.updatePresence({
                        details,
                        state,
                        timestamps: {start: this._startTime},
                        buttons: [{label: 'Visit room', url: link}]
                    });
                }
                else
                {
                    this._rpc.updatePresence({
                        details,
                        state,
                        timestamps: {start: this._startTime}
                    });
                }
            }
            else
            {
                this._rpc.updatePresence({
                    details,
                    timestamps: {start: this._startTime}
                });
            }

            this._lastDetails = details;
            this._lastState = state;
            this._lastStartTime = this._startTime;
        }
        catch
        {
            // AS3 swallows this too.
        }

        this._presencePublished = true;
    }

    // AS3: .../discord/HabboDiscordManager.as::getEnvironmentName()
    private getEnvironmentName(): string
    {
        let environment = this.getProperty('environment.id');

        if(HabboDiscordManager.ALLOWED_ENVIRONMENTS.indexOf(environment) === -1) return '';

        if(environment === 's2') return 'Sandbox';

        environment = environment.replace('pt', 'br');
        environment = environment.replace('en', 'com');

        return environment.toUpperCase();
    }

    // AS3: .../discord/HabboDiscordManager.as::getLink()
    private getLink(): string | null
    {
        if(this._settings === null || this._activity === null || this._localization === null) return null;

        const preferences = this._settings.preferences;

        if(preferences === null) return null;

        if(!preferences.allowJoining || !this._activity.isInRoom() || this._activity.roomId === -1) return null;

        const environment = this.getProperty('environment.id');

        if(HabboDiscordManager.ALLOWED_ENVIRONMENTS.indexOf(environment) === -1 || environment === 'local')
        {
            return null;
        }

        return this._localization.getLocalizationWithParams(
            'navigator.embed.src', '', 'roomId', String(this._activity.roomId)
        );
    }

    // AS3: .../discord/HabboDiscordManager.as::onPresenceTimer()
    private onPresenceTimer(): void
    {
        if(this.disposed || this._refreshTimer === null) return;

        this.tryUpdatePresence();
    }

    // AS3: .../discord/HabboDiscordManager.as::dispose()
    override dispose(): void
    {
        if(this.disposed) return;

        this._connected = false;

        if(this._refreshTimer !== null)
        {
            clearInterval(this._refreshTimer);
            this._refreshTimer = null;
        }

        if(this._settings !== null)
        {
            this._settings.dispose();
            this._settings = null;
        }

        if(this._activity !== null)
        {
            this._activity.dispose();
            this._activity = null;
        }

        if(this._debouncer !== null)
        {
            this._debouncer.dispose();
            this._debouncer = null;
        }

        this._localization = null;

        if(this._rpc !== null)
        {
            try
            {
                this._rpc.shutdown();
                this._rpc.dispose();
            }
            catch
            {
                // AS3 swallows this too.
            }
        }

        super.dispose();
    }
}
