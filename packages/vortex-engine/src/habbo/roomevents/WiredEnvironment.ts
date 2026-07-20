import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {HabboUserDefinedRoomEvents} from './HabboUserDefinedRoomEvents';
import type {WiredEnvironmentParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredEnvironmentParser';
import type {WiredClickSettingsParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredClickSettingsParser';
import type {WiredClickUserResponseEventParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredClickUserResponseEventParser';
import {WiredEnvironmentEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredEnvironmentEvent';
import {WiredClickSettingsEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredClickSettingsEvent';
import {WiredClickUserResponseEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredClickUserResponseEvent';
import {WiredAchievementsUpdatedEvent} from './events/WiredAchievementsUpdatedEvent';
import {WiredUserClickHandledEvent} from './events/WiredUserClickHandledEvent';

/**
 * WiredEnvironment — room-wide wired state that is not tied to a single furni: the click-behaviour
 * settings (how clicking a user / furni is routed), whether a "click user" wired is active, and the
 * list of achievements wired furni can progress in this room.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/WiredEnvironment.as
 */
export class WiredEnvironment
{
    // AS3: WiredEnvironment.as::_SafeStr_10936 ("wired_env") — the click-settings client id.
    private static readonly WIRED_ENV_KEY: string = 'wired_env';

    // AS3: WiredEnvironment.as::CLICK_USER_DEFAULT
    static readonly CLICK_USER_DEFAULT: number = 0;

    // AS3: WiredEnvironment.as::CLICK_USER_CLICK_WALK_BEHIND
    static readonly CLICK_USER_CLICK_WALK_BEHIND: number = 1;

    // AS3: WiredEnvironment.as::CLICK_USER_PASS_THROUGH
    static readonly CLICK_USER_PASS_THROUGH: number = 2;

    // AS3: WiredEnvironment.as::CLICK_FURNI_DEFAULT
    static readonly CLICK_FURNI_DEFAULT: number = 0;

    // AS3: WiredEnvironment.as::CLICK_FURNI_PASS_THROUGH
    static readonly CLICK_FURNI_PASS_THROUGH: number = 1;

    // AS3: WiredEnvironment.as::CLICK_SETTINGS_NOTIFICATION_TOGGLE_ID
    private static readonly CLICK_SETTINGS_NOTIFICATION_TOGGLE_ID: string = 'wired_click_settings_toggle';

    private _disposed: boolean = false;

    private _roomEvents: HabboUserDefinedRoomEvents | null;

    private _messageEvents: IMessageEvent[];

    // AS3: WiredEnvironment.as::_SafeStr_6575 (hasClickUserWired)
    private _hasClickUserWired: boolean = false;

    // AS3: WiredEnvironment.as::_SafeStr_6150 (enabled achievements)
    private _achievements: string[] = [];

    // AS3: WiredEnvironment.as::_SafeStr_5703 (click-user option)
    private _userOption: number = 0;

    // AS3: WiredEnvironment.as::_SafeStr_5751 (click-furni option)
    private _furniOption: number = 0;

    // AS3: WiredEnvironment.as::_SafeStr_5456 (click settings toggled off / ignored)
    private _clickSettingsIgnored: boolean = false;

    // AS3: WiredEnvironment.as::_SafeStr_8649 (hide-if-inactive timeout handle)
    private _hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // AS3: WiredEnvironment.as::WiredEnvironment()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
        this._messageEvents = [];
        this._messageEvents.push(new WiredEnvironmentEvent((event: IMessageEvent) => this.onWiredEnvironmentEvent(event)));
        this._messageEvents.push(new WiredClickUserResponseEvent((event: IMessageEvent) => this.onWiredClickUserResponseEvent(event)));
        this._messageEvents.push(new WiredClickSettingsEvent((event: IMessageEvent) => this.onWiredClickSettingsEvent(event)));

        for(const messageEvent of this._messageEvents)
        {
            this._roomEvents.communication?.addHabboConnectionMessageEvent(messageEvent);
        }
    }

    // AS3: WiredEnvironment.as::hideClickSettingsIfInactive()
    private hideClickSettingsIfInactive(): void
    {
        if(!this.hasActiveClickSettings())
        {
            this._clickSettingsIgnored = false;
            // TODO(AS3): notifications.removeNotificationById('wired_click_settings_toggle') — the
            // port's IHabboNotifications has no removeNotificationById() yet.
        }
    }

    // AS3: WiredEnvironment.as::onWiredClickSettingsEvent()
    private onWiredClickSettingsEvent(event: IMessageEvent): void
    {
        if(!this._roomEvents) return;

        const parser = event.parser as WiredClickSettingsParser;
        let changed: boolean = this._userOption !== parser.userOption || this._furniOption !== parser.furniOption;

        if(this._clickSettingsIgnored && !this._roomEvents.wiredMenu.hasWritePermission)
        {
            this._clickSettingsIgnored = false;
            changed = true;
            // TODO(AS3): notifications.removeNotificationById('wired_click_settings_toggle') — not ported.
        }

        if(changed)
        {
            this._userOption = parser.userOption;
            this._furniOption = parser.furniOption;

            if(!this.hasActiveClickSettings())
            {
                if(this._hideTimeoutId !== null) clearTimeout(this._hideTimeoutId);
                this._hideTimeoutId = setTimeout(() => this.hideClickSettingsIfInactive(), 3000);
            }

            if(this._clickSettingsIgnored)
            {
                let text: string = '${notification.click_settings}';
                if(this.hasActiveClickSettings())
                {
                    text = this._roomEvents.localization.getLocalization('notification.click_settings_ignored')
                        + ' ' + this._roomEvents.localization.getLocalization('notification.click_settings');
                }
                this._roomEvents.notifications.addItem(text, 'wired');
                return;
            }

            this.applyClickSettings(this._userOption, this._furniOption);

            if(this._roomEvents.wiredMenu.hasWritePermission && this.hasActiveClickSettings())
            {
                // TODO(AS3): AS3 passes a 5th options arg { id, stay, toggle_callback:
                // onToggleClickSettingsNotification } to addItem() to render the dismissable toggle
                // notification. The port's IHabboNotifications.addItem() has no options/toggle
                // parameter yet, so this degrades to the plain notification below. Currently dead
                // code anyway: gated on wiredMenu.hasWritePermission (stubbed false).
                this._roomEvents.notifications.addItem('${notification.click_settings}', 'wired');
                return;
            }

            this._roomEvents.notifications.addItem('${notification.click_settings}', 'wired');
        }
    }

    // AS3: WiredEnvironment.as::get achievements()
    get achievements(): string[]
    {
        return this._achievements;
    }

    // AS3: WiredEnvironment.as::leaveRoom()
    leaveRoom(): void
    {
        // TODO(AS3): notifications.removeNotificationById('wired_click_settings_toggle') — not ported.
        this._clickSettingsIgnored = false;
        if(this._hideTimeoutId !== null) clearTimeout(this._hideTimeoutId);

        if(this._userOption !== 0 || this._furniOption !== 0 || this._clickSettingsIgnored)
        {
            this._userOption = 0;
            this._furniOption = 0;
            this.applyClickSettings(0, 0);
        }
    }

    // AS3: WiredEnvironment.as::onToggleClickSettingsNotification()
    private onToggleClickSettingsNotification(ignored: boolean): void
    {
        this._clickSettingsIgnored = ignored;
        if(ignored)
        {
            this.applyClickSettings(0, 0);
        }
        else
        {
            this.applyClickSettings(this._userOption, this._furniOption);
        }
    }

    // AS3: WiredEnvironment.as::hasActiveClickSettings()
    private hasActiveClickSettings(): boolean
    {
        return this._userOption !== 0 || this._furniOption !== 0;
    }

    // AS3: WiredEnvironment.as::applyClickSettings()
    private applyClickSettings(_userOption: number, _furniOption: number): void
    {
        // TODO(AS3): (roomEngine as IRoomEngine-ext).setClickSettings(WiredEnvironment.WIRED_ENV_KEY,
        // _userOption === CLICK_USER_PASS_THROUGH, _furniOption === CLICK_FURNI_PASS_THROUGH). The
        // port's RoomEngine does not expose setClickSettings() yet, so the computed pass-through flags
        // cannot be applied to the engine. Params kept for when that method lands.
    }

    // AS3: WiredEnvironment.as::onWiredEnvironmentEvent()
    private onWiredEnvironmentEvent(event: IMessageEvent): void
    {
        if(!this._roomEvents) return;

        const parser = event.parser as WiredEnvironmentParser;
        this._hasClickUserWired = parser.hasClickUserWired;
        this._achievements = parser.enabledAchievements;
        this._roomEvents.events.emit(
            WiredAchievementsUpdatedEvent.WIRED_ACHIEVEMENTS_UPDATED,
            new WiredAchievementsUpdatedEvent(WiredAchievementsUpdatedEvent.WIRED_ACHIEVEMENTS_UPDATED, this._achievements)
        );
    }

    // AS3: WiredEnvironment.as::onWiredClickUserResponseEvent()
    private onWiredClickUserResponseEvent(event: IMessageEvent): void
    {
        if(!this._roomEvents) return;

        const parser = event.parser as WiredClickUserResponseEventParser;
        this._roomEvents.events.emit(
            WiredUserClickHandledEvent.WIRED_USER_CLICK_HANDLED,
            new WiredUserClickHandledEvent(WiredUserClickHandledEvent.WIRED_USER_CLICK_HANDLED, parser.index, parser.openMenu)
        );
    }

    // AS3: WiredEnvironment.as::clear()
    clear(): void
    {
        this._hasClickUserWired = false;
    }

    // AS3: WiredEnvironment.as::get hasClickUserWired()
    get hasClickUserWired(): boolean
    {
        return this._hasClickUserWired;
    }

    // AS3: WiredEnvironment.as::get clickUserOption()
    get clickUserOption(): number
    {
        return this._clickSettingsIgnored ? 0 : this._userOption;
    }

    // AS3: WiredEnvironment.as::get clickFurniOption()
    get clickFurniOption(): number
    {
        return this._furniOption;
    }

    // AS3: WiredEnvironment.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._hasClickUserWired = false;

        const communication = this._roomEvents?.communication;
        if(communication)
        {
            for(const messageEvent of this._messageEvents)
            {
                communication.removeHabboConnectionMessageEvent(messageEvent);
            }
        }
        this._messageEvents = [];
        this._roomEvents = null;
    }

    // AS3: WiredEnvironment.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }
}
